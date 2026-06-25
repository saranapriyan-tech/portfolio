// ===== ADMIN PAGE: ADD / EDIT / DELETE PROJECTS =====

const API_URL = 'https://saran-portfolio-backend.onrender.com/api/projects';

// Ask for the admin password once when the page loads.
// This gets sent with every add/edit/delete request so the server can verify it.
const adminPassword = prompt('Enter admin password:');

const form = document.querySelector('#projectForm');
const status = document.querySelector('#status');
const formTitle = document.querySelector('#formTitle');
const submitBtn = document.querySelector('#submitBtn');
const editingIdField = document.querySelector('#editingId');
const existingProjectsContainer = document.querySelector('#existingProjects');

// ----- LOAD AND DISPLAY EXISTING PROJECTS (with Edit/Delete buttons) -----
async function loadExistingProjects() {
  try {
    const response = await fetch(API_URL);
    const projects = await response.json();

    existingProjectsContainer.innerHTML = '';

    if (projects.length === 0) {
      existingProjectsContainer.innerHTML = '<p>No projects yet.</p>';
      return;
    }

    projects.forEach((project) => {
      const div = document.createElement('div');
      div.classList.add('existing-project');

      div.innerHTML = `
        ${project.imageUrl ? `<img src="${project.imageUrl}" alt="${project.title}">` : ''}
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <p><strong>Tech:</strong> ${project.tech.join(', ')}</p>
        <div class="actions">
          <button class="edit-btn" data-id="${project._id}">Edit</button>
          <button class="delete-btn" data-id="${project._id}">Delete</button>
        </div>
      `;

      existingProjectsContainer.appendChild(div);
    });

    // Wire up Edit buttons
    document.querySelectorAll('.edit-btn').forEach((btn) => {
      btn.addEventListener('click', () => startEditing(btn.dataset.id, projects));
    });

    // Wire up Delete buttons
    document.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.addEventListener('click', () => deleteProject(btn.dataset.id));
    });

  } catch (error) {
    existingProjectsContainer.innerHTML = '<p>Failed to load projects.</p>';
    console.error(error);
  }
}

// ----- FILL THE FORM WITH AN EXISTING PROJECT'S DATA, FOR EDITING -----
function startEditing(id, projects) {
  const project = projects.find(p => p._id === id);
  if (!project) return;

  document.querySelector('#title').value = project.title;
  document.querySelector('#description').value = project.description;
  document.querySelector('#tech').value = project.tech.join(', ');
  document.querySelector('#liveLink').value = project.liveLink || '';
  document.querySelector('#githubLink').value = project.githubLink || '';

  editingIdField.value = id;
  formTitle.textContent = 'Edit Project';
  submitBtn.textContent = 'Save Changes';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----- DELETE A PROJECT -----
async function deleteProject(id) {
  const confirmed = confirm('Delete this project? This cannot be undone.');
  if (!confirmed) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': adminPassword }
    });
    if (!response.ok) throw new Error('Delete failed');

    loadExistingProjects(); // refresh the list
  } catch (error) {
    alert('Failed to delete project.');
    console.error(error);
  }
}

// ----- HANDLE FORM SUBMIT (covers BOTH adding new AND saving edits) -----
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // FormData lets us send both text fields AND a file in one request
  const formData = new FormData();
  formData.append('title', document.querySelector('#title').value);
  formData.append('description', document.querySelector('#description').value);
  formData.append('tech', document.querySelector('#tech').value);
  formData.append('liveLink', document.querySelector('#liveLink').value);
  formData.append('githubLink', document.querySelector('#githubLink').value);

  const imageFile = document.querySelector('#image').files[0];
  if (imageFile) {
    formData.append('image', imageFile); // field name "image" must match upload.single('image') on the server
  }

  const editingId = editingIdField.value;
  const isEditing = editingId !== '';

  try {
    const response = await fetch(
      isEditing ? `${API_URL}/${editingId}` : API_URL,
      {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'x-admin-password': adminPassword },
        body: formData // NOTE: no Content-Type header here — the browser sets it automatically for FormData
      }
    );

    if (!response.ok) throw new Error('Server responded with an error');

    status.textContent = isEditing ? 'Project updated!' : 'Project added!';
    status.style.color = 'green';

    // Reset the form back to "Add" mode
    form.reset();
    editingIdField.value = '';
    formTitle.textContent = 'Add New Project';
    submitBtn.textContent = 'Add Project';

    loadExistingProjects(); // refresh the list below

  } catch (error) {
    status.textContent = 'Something went wrong. Check the console.';
    status.style.color = 'red';
    console.error(error);
  }
});

// Load the list as soon as the admin page opens
loadExistingProjects();
