const express = require('express');
const { Worker } = require('worker_threads');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const app = express();
app.use(bodyParser.json());

// Firebase setup
const serviceAccount = require('./config/serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://intellipark-db283.firebaseapp.com"
});

const MAX_SLOTS = 50;

// Function to run in a worker thread
function runWorker(workerData) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./worker.js', {
            workerData
        });

        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
}

// POST endpoint for vehicle validation
app.post('/api/validate', async (req, res) => {
    const { docId } = req.body;

    try {
        const result = await runWorker({ docId, action: 'validate' });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error validating vehicle:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST endpoint for vehicle entry
app.post('/api/vehicle-entry', async (req, res) => {
    const vehicleData = req.body;

    try {
        const result = await runWorker({ vehicleData, action: 'vehicle-entry' });
        res.status(201).json(result);
    } catch (error) {
        console.error('Error handling vehicle entry:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST endpoint for vehicle exit
app.post('/api/vehicle-exit', async (req, res) => {
    const vehicleData = req.body;

    try {
        const result = await runWorker({ vehicleData, action: 'vehicle-exit' });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error handling vehicle exit:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET endpoint for vehicle history
app.get('/api/vehicle-history', async (req, res) => {
    const { date } = req.query;

    try {
        const result = await runWorker({ date, action: 'vehicle-history' });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error retrieving vehicle history:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
