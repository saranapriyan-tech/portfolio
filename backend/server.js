require('dotenv').config(); // loads variables from .env into process.env

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Project = require('./Project'); // the schema/model we made
const upload = require('./upload');   // the Cloudinary/multer setup we just made

const app = express();
const PORT = 3000;

// Allow the frontend to call this API, including our custom admin password header
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-admin-password']
}));
app.use(express.json()); // lets the server read JSON sent in requests

// ===== SIMPLE ADMIN PASSWORD CHECK =====
// This runs before any route that can ADD, EDIT, or DELETE data.
// The client must send the correct password in a header called "x-admin-password".
function requireAdminPassword(req, res, next) {
  const submittedPassword = req.headers['x-admin-password'];

  if (submittedPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized: incorrect or missing admin password' });
  }

  next(); // password correct, continue to the actual route
}

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
app.post('/api/projects', requireAdminPassword, upload.single('image'), async (req, res) => {
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
app.put('/api/projects/:id', requireAdminPassword, upload.single('image'), async (req, res) => {
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
app.delete('/api/projects/:id', requireAdminPassword, async (req, res) => {
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
