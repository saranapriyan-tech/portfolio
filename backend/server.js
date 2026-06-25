require('dotenv').config(); // loads variables from .env into process.env

const express = require('express');
const mongoose = require('mongoose');
const Project = require('./Project'); // the schema/model we made
const upload = require('./upload');   // the Cloudinary/multer setup we just made

const app = express();
const PORT = 3000;

// Allow the frontend to call this API, and allow JSON in request bodies
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});
app.use(express.json()); // lets the server read JSON sent in requests

// ===== CONNECT TO MONGODB =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// A basic test route
app.get('/', (req, res) => {
  res.send('Backend is alive!');
});

// ===== GET all projects from the database =====
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// ===== POST a new project (with optional file upload) =====
// upload.single('image') = expect ONE file, sent under the field name "image"
app.post('/api/projects', upload.single('image'), async (req, res) => {
  try {
    const projectData = req.body;

    // If a file was uploaded, multer-storage-cloudinary already sent it to
    // Cloudinary by this point, and req.file.path is the resulting URL
    if (req.file) {
      projectData.imageUrl = req.file.path;
    }

    // Tech arrives as a comma-separated string from the form; convert to array
    if (typeof projectData.tech === 'string') {
      projectData.tech = projectData.tech.split(',').map(t => t.trim());
    }

    const newProject = new Project(projectData);
    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save project' });
  }
});

// ===== PUT (edit) an existing project by its ID =====
app.put('/api/projects/:id', upload.single('image'), async (req, res) => {
  try {
    const projectData = req.body;

    if (req.file) {
      projectData.imageUrl = req.file.path;
    }

    if (typeof projectData.tech === 'string') {
      projectData.tech = projectData.tech.split(',').map(t => t.trim());
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,   // which project to update
      projectData,      // the new data
      { new: true }     // return the UPDATED version, not the old one
    );

    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(updatedProject);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// ===== DELETE a project by its ID =====
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);

    if (!deletedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted', deletedProject });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
