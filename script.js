// ===== FETCH PROJECTS FROM BACKEND =====

async function loadProjects() {
  const projectsContainer = document.querySelector('#projects');

  try {
    const response = await fetch('https://saran-portfolio-backend.onrender.com/api/projects'); // wait for server reply
    const projects = await response.json(); // wait for it to convert to JSON

    // Clear out the old hardcoded heading/content except the <h2> title
    const heading = projectsContainer.querySelector('h2');
    projectsContainer.innerHTML = '';
    projectsContainer.appendChild(heading);

    // Build one card per project, dynamically
    projects.forEach((project) => {
      const card = document.createElement('div');
      card.classList.add('project-card');

      card.innerHTML = `
        ${project.imageUrl ? `<img src="${project.imageUrl}" alt="${project.title}" style="width:100%; border-radius:6px; margin-bottom:0.8rem;">` : ''}
        <h3>${project.title}</h3>
        <p>${project.description || ''}</p>
        <p><strong>Tech:</strong> ${project.tech.join(', ')}</p>
        <div class="project-links">
          ${project.liveLink ? `<a href="${project.liveLink}" target="_blank">Live Demo</a>` : ''}
          ${project.githubLink ? `<a href="${project.githubLink}" target="_blank">GitHub</a>` : ''}
        </div>
      `;

      projectsContainer.appendChild(card);
    });

  } catch (error) {
    console.error('Failed to load projects:', error);
  }
}

loadProjects(); // run it once the page loads

// ===== ACTIVE NAV LINK ON SCROLL =====

// Grab every <section> on the page, and every nav <a> link
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

// This runs every time the user scrolls
window.addEventListener('scroll', () => {
  let currentSectionId = '';

  // Loop through each section to find which one is currently in view
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 120; // small offset so it switches a bit early (accounts for fixed header)
    const sectionHeight = section.offsetHeight;

    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      currentSectionId = section.getAttribute('id');
    }
  });

  // Loop through each nav link and toggle the "active" class
  navLinks.forEach((link) => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSectionId}`) {
      link.classList.add('active');
    }
  });
});
