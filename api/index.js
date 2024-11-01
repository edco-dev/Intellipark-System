const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const app = express();
app.use(bodyParser.json()); // Middleware to parse JSON bodies

// Initialize Firebase Admin SDK
const serviceAccount = require('./config/serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://intellipark-db283.firebaseapp.com"
});

const MAX_SLOTS = 50; // Maximum available parking slots

// Validation endpoint
app.post('/api/validate', async (req, res) => {
    const { docId } = req.body;
    try {
        const docRef = admin.firestore().collection('drivers').doc(docId);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Check if the vehicle is already in `vehiclesIn`
        const vehicleInSnapshot = await admin.firestore().collection('vehiclesIn')
            .where('plateNumber', '==', docSnapshot.data().plateNumber)
            .get();

        if (!vehicleInSnapshot.empty) {
            // Vehicle is already parked
            return res.status(200).json({
                message: 'Vehicle is currently parked. Proceed to exit.',
                data: docSnapshot.data(),
                action: 'exit'
            });
        } else {
            // Vehicle can enter
            return res.status(200).json({
                message: 'Vehicle can enter.',
                data: docSnapshot.data(),
                action: 'enter'
            });
        }
    } catch (error) {
        console.error('Error validating document:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Vehicle Entry (In) Endpoint
app.post('/api/vehicle-entry', async (req, res) => {
    const vehicleData = req.body;
    
    // Extract plateNumber from both nested and top-level structures
    const plateNumber = vehicleData.data?.plateNumber || vehicleData.plateNumber;

    if (!plateNumber) {
        return res.status(400).json({ message: 'Missing plate number.' });
    }

    try {
        // Extract other necessary fields (ensure they are present)
        const {
            firstName,
            middleName,
            lastName,
            contactNumber,
            userType,
            vehicleType,
            status,
            vehicleColor
        } = vehicleData.data || vehicleData; // Fallback to top-level if data is not nested

        const vehicleOwner = `${firstName} ${middleName} ${lastName}`;
        const date = new Date();
        const transactionId = `${date.getTime()}-${plateNumber}`;  // Unique transaction ID
        const formattedDate = date.toISOString().split('T')[0];    // YYYY-MM-DD for consistency
        const timeIn = date.toLocaleTimeString();

        const vehiclesInRef = admin.firestore().collection('vehiclesIn');
        const parkingLogRef = admin.firestore().collection('parkingLog');

        // Check for available slots
        const vehiclesInCount = (await vehiclesInRef.get()).size;
        const slotsAvailable = MAX_SLOTS - vehiclesInCount;

        // Check if the vehicle is already parked
        const vehicleInSnapshot = await vehiclesInRef.where('plateNumber', '==', plateNumber).get();
        if (!status && slotsAvailable > 0 && vehicleInSnapshot.empty) {
            // Vehicle entry (in)
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

            // Insert into `vehiclesIn` for tracking current vehicles in parking
            await vehiclesInRef.doc(transactionId).set(vehicleInData);

            // Log entry in `parkingLog` with a null `timeOut` initially
            await parkingLogRef.doc(transactionId).set({
                ...vehicleInData,
                timeOut: null
            });

            res.status(201).json({ message: 'Vehicle checked in successfully', data: vehicleInData });
        } else if (vehicleInSnapshot.empty && status) {
            res.status(400).json({ message: 'Vehicle is already marked as "out". Please use the exit endpoint instead.' });
        } else {
            res.status(403).json({ message: 'No available slots for parking or vehicle already inside.' });
        }

    } catch (error) {
        console.error('Error handling vehicle entry:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Vehicle Exit (Out) Endpoint
app.post('/api/vehicle-exit', async (req, res) => {
    const vehicleData = req.body;

    // Extract plateNumber from both nested and top-level structures
    const plateNumber = vehicleData.data?.plateNumber || vehicleData.plateNumber;

    if (!plateNumber) {
        return res.status(400).json({ message: 'Missing plate number' });
    }

    try {
        // Query to find the vehicle in `vehiclesIn`
        const vehiclesInRef = admin.firestore().collection('vehiclesIn').where('plateNumber', '==', plateNumber);
        const snapshot = await vehiclesInRef.get();

        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const vehicleData = doc.data();
            const date = new Date();
            const timeOut = date.toLocaleTimeString();

            // Prepare vehicle exit data
            const vehicleOutData = {
                transactionId: vehicleData.transactionId, // Use the same transaction ID
                plateNumber,
                vehicleOwner: vehicleData.vehicleOwner,
                contactNumber: vehicleData.contactNumber,
                userType: vehicleData.userType,
                vehicleType: vehicleData.vehicleType,
                vehicleColor: vehicleData.vehicleColor,
                date: vehicleData.date, // Use the same date from vehiclesIn
                timeIn: vehicleData.timeIn, // Keep time in for reference
                timeOut // Current time as the time out
            };

            // Remove from `vehiclesIn` as vehicle exits
            await doc.ref.delete();

            // Insert the vehicle data into `vehiclesOut`
            await admin.firestore().collection('vehiclesOut').add(vehicleOutData);

            // Update the parking log with the `timeOut`
            const parkingLogRef = admin.firestore().collection('parkingLog').doc(vehicleData.transactionId);
            await parkingLogRef.update({
                timeOut
            });

            res.status(200).json({ message: 'Vehicle checked out successfully', plateNumber });

        } else {
            res.status(404).json({ message: 'Vehicle not found in the parking area' });
        }

    } catch (error) {
        console.error('Error handling vehicle exit:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Retrieve Parking History by Date
app.get('/api/vehicle-history', async (req, res) => {
    const { date } = req.query; // Expected format: YYYY-MM-DD

    try {
        const logRef = admin.firestore().collection('parkingLog');
        const snapshot = await logRef.where('date', '==', date).get();

        if (snapshot.empty) {
            res.status(404).json({ message: 'No records found for the specified date' });
            return;
        }

        const historyData = [];
        snapshot.forEach(doc => {
            historyData.push(doc.data());
        });

        res.status(200).json({ message: 'Records retrieved successfully', data: historyData });

    } catch (error) {
        console.error('Error retrieving historical data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
