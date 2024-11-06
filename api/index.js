const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const app = express();
app.use(bodyParser.json());

const serviceAccount = require('./config/serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://intellipark-db283.firebaseapp.com"
});

const MAX_SLOTS = 50;

app.post('/api/validate', async (req, res) => {
    const { docId } = req.body;

    try {
        const docRef = admin.firestore().collection('drivers').doc(docId);
        const docSnapshot = await docRef.get();

        if (!docSnapshot.exists) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const vehicleInSnapshot = await admin.firestore().collection('vehiclesIn')
            .where('plateNumber', '==', docSnapshot.data().plateNumber)
            .get();

        if (!vehicleInSnapshot.empty) {
            return res.status(200).json({
                message: 'Vehicle is currently parked. Proceed to exit.',
                data: docSnapshot.data(),
                action: 'exit'
            });
        } else {
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

app.post('/api/vehicle-entry', async (req, res) => {
    const vehicleData = req.body;
    const plateNumber = vehicleData.data?.plateNumber || vehicleData.plateNumber;

    if (!plateNumber) {
        return res.status(400).json({ message: 'Missing plate number.' });
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

app.post('/api/vehicle-exit', async (req, res) => {
    const vehicleData = req.body;
    const plateNumber = vehicleData.data?.plateNumber || vehicleData.plateNumber;

    if (!plateNumber) {
        return res.status(400).json({ message: 'Missing plate number' });
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

            res.status(200).json({ message: 'Vehicle checked out successfully', plateNumber });
        } else {
            res.status(404).json({ message: 'Vehicle not found in the parking area' });
        }

    } catch (error) {
        console.error('Error handling vehicle exit:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/vehicle-history', async (req, res) => {
    const { date } = req.query;

    try {
        const logRef = admin.firestore().collection('parkingLog');
        const snapshot = await logRef.where('date', '==', date).get();

        if (snapshot.empty) {
            res.status(404).json({ message: 'No records found for the specified date' });
            return;
        }

        const historyData = [];
        snapshot.forEach(doc => historyData.push(doc.data()));

        res.status(200).json({ message: 'Records retrieved successfully', data: historyData });

    } catch (error) {
        console.error('Error retrieving historical data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
