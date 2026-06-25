const mongoose = require('mongoose');

// This defines the "shape" every project document must follow in the database
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tech: [String],          // an array of strings, e.g. ["HTML", "CSS", "JS"]
  liveLink: String,
  githubLink: String,
  imageUrl: String,        // the Cloudinary URL of the uploaded image, if any
  createdAt: { type: Date, default: Date.now }
});

// "Project" becomes a model — basically a tool for creating/reading/updating
// documents in the "projects" collection in MongoDB
const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
