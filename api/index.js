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

// Existing validation endpoint
app.post('/api/validate', async (req, res) => {
    const { docId } = req.body;
    try {
        const docRef = admin.firestore().collection('drivers').doc(docId);
        const docSnapshot = await docRef.get();
        if (docSnapshot.exists) {
            res.status(200).json({ message: 'Document exists!', data: docSnapshot.data() });
        } else {
            res.status(404).json({ message: 'Document not found' });
        }
    } catch (error) {
        console.error('Error validating document:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// New vehicle entry endpoint (In)
app.post('/api/vehicle-entry', async (req, res) => {
    const vehicleData = req.body;
    if (!vehicleData.data) {
        return res.status(400).json({ message: 'Missing data field.' });
    }
    try {
        const {
            firstName,
            middleName,
            lastName,
            contactNumber,
            userType,
            plateNumber,
            vehicleType,
            status,
            vehicleColor
        } = vehicleData.data;

        const vehicleOwner = `${firstName} ${middleName} ${lastName}`;
        const date = new Date();
        const transactionId = `${date.getTime()}-${plateNumber}`;  // Unique transaction ID based on time and plate number
        const formattedDate = date.toLocaleDateString();
        const timeIn = date.toLocaleTimeString();

        if (!status) {
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

            // Insert into the Firestore collection `vehiclesIn`
            await admin.firestore().collection('vehiclesIn').add(vehicleInData);
            res.status(201).json({ message: 'Vehicle checked in successfully', data: vehicleInData });
        } else {
            // Vehicle exit (out) logic
            const vehicleOutData = {
                transactionId,
                plateNumber,
                vehicleOwner,
                contactNumber,
                userType,
                vehicleType,
                vehicleColor,
                date: formattedDate,
                timeOut: timeIn // Assuming timeIn is used here for time out, you can get a new time if necessary
            };

            // Insert into the Firestore collection `vehiclesOut`
            await admin.firestore().collection('vehiclesOut').add(vehicleOutData);
            res.status(201).json({ message: 'Vehicle checked out successfully', data: vehicleOutData });
        }

    } catch (error) {
        console.error('Error handling vehicle entry:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
