const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const path = require("path");

const port = 3000
mongoose.connect('mongodb://localhost:27017/university', { useNewUrlParser: true, useUnifiedTopology: true })
app.set("view engine", "ejs")
app.use(bodyParser.json()); // Добавим обработку JSON

const db = mongoose.connection;

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

db.once('open', () => {
    console.log('Connected to MongoDB');
});

const StudentsSchema = mongoose.Schema({
    id: String,
    name: String,
    surname: String,
    Grade: Number,
    GPA: Number
})
const Student = mongoose.model("students",StudentsSchema)

// Получение списка студентов
app.get('/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Ошибка при получении студентов' });
    }
});

// Получение страницы со списком студентов
app.getX509Certificate('/students_list', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.delete('/students/:id', async (req, res) => {
    const studentId = req.params.id;

    try {
        const deletedStudent = await Student.findByIdAndDelete(studentId);
        if (deletedStudent) {
            console.log(`Student with ID ${studentId} deleted successfully`);
            res.status(200).json({ message: 'Student deleted successfully' });
        } else {
            console.error(`Student with ID ${studentId} not found`);
            res.status(404).json({ error: 'Student not found' });
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/students/:id', async (req, res) => {
    const studentId = req.params.id;
    const { name, surname, Grade, GPA } = req.body;

    try {
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            { name, surname, Grade, GPA },
            { new: true }
        );

        if (updatedStudent) {
            console.log(`Student with ID ${studentId} updated successfully`);
            res.status(200).json({ message: 'Student updated successfully' });
        } else {
            console.error(`Student with ID ${studentId} not found`);
            res.status(404).json({ error: 'Student not found' });
        }
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/students', async (req, res) => {
    const { name, surname, Grade, GPA } = req.body;

    try {
        const newStudent = new Student({ name, surname, Grade, GPA });
        const savedStudent = await newStudent.save();
        console.log('Student created successfully:', savedStudent);
        res.status(201).json(savedStudent);
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(port, () => {
    console.log("Server is Running on port " + port)
});