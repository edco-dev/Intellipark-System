// Load environment variables from .env file
const dotenv = require('dotenv');
const { workerData, parentPort } = require('worker_threads');
const admin = require('firebase-admin');

dotenv.config();

// Ensure Firebase Admin SDK is initialized (this block ensures it initializes only once)
if (!admin.apps.length) {
    const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    };

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}

const db = admin.firestore();
module.exports = { db };

const MAX_SLOTS = 50;

async function handleAction() {
    const { action } = workerData;
    let result;

    switch (action) {
        case 'validate':
            result = await validateVehicle(workerData.docId);
            break;
        case 'vehicle-entry':
            result = await handleVehicleEntry(workerData.vehicleData);
            break;
        case 'vehicle-exit':
            result = await handleVehicleExit(workerData.vehicleData);
            break;
        case 'vehicle-history':
            result = await getVehicleHistory(workerData.date);
            break;
        default:
            result = { message: 'Unknown action' };
    }

    parentPort.postMessage(result); // Return the result to the main thread
}

// Validation for vehicle
async function validateVehicle(docId) {
    if (!docId) {
        return { message: 'Invalid or missing document ID' };
    }

    try {
        const docRef = db.collection('drivers').doc(docId);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
            return { message: 'Document not found' };
        }

        const vehicleInSnapshot = await db.collection('vehiclesIn')
            .where('plateNumber', '==', docSnapshot.data().plateNumber)
            .get();

        if (!vehicleInSnapshot.empty) {
            return {
                message: 'Vehicle is currently parked. Proceed to exit.',
                data: docSnapshot.data(),
                action: 'exit'
            };
        } else {
            return {
                message: 'Vehicle can enter.',
                data: docSnapshot.data(),
                action: 'enter'
            };
        }
    } catch (error) {
        console.error('Error validating document:', error);
        return { message: 'Internal server error' };
    }
}

// Handle vehicle entry
async function handleVehicleEntry(vehicleData) {
    const plateNumber = vehicleData?.data?.plateNumber || vehicleData?.plateNumber;

    if (!plateNumber) {
        return { message: 'Missing plate number.' };
    }

    try {
        const {
            firstName,
            middleName,
            lastName,
            contactNumber,
            userType,
            vehicleType,
            status,
            vehicleColor
        } = vehicleData.data || vehicleData;

        const vehicleOwner = `${firstName || ''} ${middleName || ''} ${lastName || ''}`.trim();
        const date = new Date();
        const transactionId = `${date.getTime()}-${plateNumber}`;
        const formattedDate = date.toISOString().split('T')[0];
        const timeIn = date.toLocaleTimeString();

        const vehiclesInRef = db.collection('vehiclesIn');
        const parkingLogRef = db.collection('parkingLog');

        const vehiclesInCount = (await vehiclesInRef.get()).size;
        const slotsAvailable = MAX_SLOTS - vehiclesInCount;

        const vehicleInSnapshot = await vehiclesInRef.where('plateNumber', '==', plateNumber).get();
        if (!status && slotsAvailable > 0 && vehicleInSnapshot.empty) {
            const vehicleInData = {
                transactionId,
                plateNumber,
                vehicleOwner,
                contactNumber,
                userType,
                vehicleType,
                vehicleColor,
                date: formattedDate,
                timeIn
            };

            await vehiclesInRef.doc(transactionId).set(vehicleInData);
            await parkingLogRef.doc(transactionId).set({
                ...vehicleInData,
                timeOut: null
            });

            return { message: 'Vehicle entered successfully', plateNumber };
        }

        return { message: 'Parking lot full or vehicle already entered' };
    } catch (error) {
        console.error('Error handling vehicle entry:', error);
        return { message: 'Internal server error' };
    }
}

// Handle vehicle exit
async function handleVehicleExit(vehicleData) {
    const plateNumber = vehicleData?.plateNumber || vehicleData?.data?.plateNumber;

    if (!plateNumber) {
        return { message: 'Missing plate number' };
    }

    try {
        const vehiclesInRef = db.collection('vehiclesIn').where('plateNumber', '==', plateNumber);
        const snapshot = await vehiclesInRef.get();

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const vehicleData = doc.data();
            const date = new Date();
            const timeOut = date.toLocaleTimeString();

            const vehicleOutData = {
                transactionId: vehicleData.transactionId,
                plateNumber,
                vehicleOwner: vehicleData.vehicleOwner,
                contactNumber: vehicleData.contactNumber,
                userType: vehicleData.userType,
                vehicleType: vehicleData.vehicleType,
                vehicleColor: vehicleData.vehicleColor,
                date: vehicleData.date,
                timeIn: vehicleData.timeIn,
                timeOut
            };

            await doc.ref.delete();
            await db.collection('vehiclesOut').add(vehicleOutData);

            const parkingLogRef = db.collection('parkingLog').doc(vehicleData.transactionId);
            await parkingLogRef.update({ timeOut });

            return { message: 'Vehicle checked out successfully', plateNumber };
        } else {
            return { message: 'Vehicle not found in the parking area' };
        }
    } catch (error) {
        console.error('Error handling vehicle exit:', error);
        return { message: 'Internal server error' };
    }
}

// Get vehicle history
async function getVehicleHistory(date) {
    if (!date) {
        return { message: 'Invalid or missing date' };
    }

    try {
        const logRef = db.collection('parkingLog');
        const snapshot = await logRef.where('date', '==', date).get();

        if (snapshot.empty) {
            return { message: 'No records found for the specified date' };
        }

        const historyData = [];
        snapshot.forEach(doc => historyData.push(doc.data()));

        return { message: 'Records retrieved successfully', data: historyData };
    } catch (error) {
        console.error('Error retrieving historical data:', error);
        return { message: 'Internal server error' };
    }
}

handleAction();
