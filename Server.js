const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/trainingDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Define schemas
const trainerSchema = new mongoose.Schema({
    name: String,
    empId: String,
    subject: String
});

const subjectSchema = new mongoose.Schema({
    subjectId: String,
    name: String,
    trainers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' }]
});

const Trainer = mongoose.model('Trainer', trainerSchema);
const Subject = mongoose.model('Subject', subjectSchema);

// API Endpoints
// 1. Add a new trainer
app.post('/trainer', async (req, res) => {
    console.log('Received trainer data:', req.body); // 🔍 Add this line
    const trainer = new Trainer(req.body);
    try {
        await trainer.save();
        res.send(trainer);
    } catch (err) {
        res.status(400).send(err.message);
    }
});


// 2. Get all trainers
app.get('/trainer', async (req, res) => {
    try {
        const trainers = await Trainer.find().exec();
        res.send(trainers);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 3. Delete a trainer
app.delete('/trainer', async (req, res) => {
    const empId = req.body.empId;
    try {
        await Trainer.findOneAndDelete({ empId });
        res.send(`Trainer with empId ${empId} deleted`);
    } catch (err) {
        res.status(404).send(err.message);
    }
});

// 4. Get a trainer by ID
app.get('/trainer/:id', async (req, res) => {
    try {
        const trainer = await Trainer.findOne({ empId: req.params.id });
        if (!trainer) return res.status(404).send('Trainer not found');
        res.send(trainer);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 5. Get trainers by subject
app.get('/trainer/:subject/topic', async (req, res) => {
    try {
        const trainers = await Trainer.find({ subject: req.params.subject });
        res.send(trainers);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 6. Add a new subject
app.post('/subject', async (req, res) => {
    const subject = new Subject(req.body);
    try {
        await subject.save();
        res.send(subject);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// 7. Get all subjects
app.get('/subject', async (req, res) => {
    try {
        const subjects = await Subject.find().exec();
        res.send(subjects);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// 8. Get a subject with trainers
app.get('/subject/:id', async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id).populate('trainers');
        if (!subject) return res.status(404).send('Subject not found');
        res.send(subject);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
