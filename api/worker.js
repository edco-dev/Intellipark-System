const { workerData, parentPort } = require('worker_threads');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK in the worker thread (make sure it's not already initialized in the main thread)
if (!admin.apps.length) {
    const serviceAccount = require('./config/serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://intellipark-db283.firebaseapp.com"
    });
}

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

async function validateVehicle(docId) {
    try {
        const docRef = admin.firestore().collection('drivers').doc(docId);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
            return { message: 'Document not found' };
        }

        const vehicleInSnapshot = await admin.firestore().collection('vehiclesIn')
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

async function handleVehicleEntry(vehicleData) {
    const plateNumber = vehicleData.data?.plateNumber || vehicleData.plateNumber;

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

        const vehicleOwner = `${firstName} ${middleName} ${lastName}`;
        const date = new Date();
        const transactionId = `${date.getTime()}-${plateNumber}`;
        const formattedDate = date.toISOString().split('T')[0];
        const timeIn = date.toLocaleTimeString();

        const vehiclesInRef = admin.firestore().collection('vehiclesIn');
        const parkingLogRef = admin.firestore().collection('parkingLog');

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

            return { message: 'Vehicle checked in successfully', data: vehicleInData };
        } else if (vehicleInSnapshot.empty && status) {
            return { message: 'Vehicle is already marked as "out". Please use the exit endpoint instead.' };
        } else {
            return { message: 'No available slots for parking or vehicle already inside.' };
        }
    } catch (error) {
        console.error('Error handling vehicle entry:', error);
        return { message: 'Internal server error' };
    }
}

async function handleVehicleExit(vehicleData) {
    const plateNumber = vehicleData.data?.plateNumber || vehicleData.plateNumber;

    if (!plateNumber) {
        return { message: 'Missing plate number' };
    }

    try {
        const vehiclesInRef = admin.firestore().collection('vehiclesIn').where('plateNumber', '==', plateNumber);
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
            await admin.firestore().collection('vehiclesOut').add(vehicleOutData);

            const parkingLogRef = admin.firestore().collection('parkingLog').doc(vehicleData.transactionId);
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

async function getVehicleHistory(date) {
    try {
        const logRef = admin.firestore().collection('parkingLog');
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

// Execute the action handler
handleAction();
