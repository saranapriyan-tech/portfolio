// ===== FETCH PROJECTS FROM BACKEND =====

async function loadProjects() {
  const grid = document.querySelector('#projectsGrid');

  try {
    const response = await fetch('https://saran-portfolio-backend.onrender.com/api/projects');
    const projects = await response.json();

    grid.innerHTML = '';

    if (projects.length === 0) {
      grid.innerHTML = '<div class="projects-empty">No projects posted yet — check back soon.</div>';
      return;
    }

    // Build one card per project, dynamically
    projects.forEach((project) => {
      const card = document.createElement('div');
      card.classList.add('project-card');

      const techChips = project.tech.map(t => `<span class="tech-chip">${t}</span>`).join('');

      card.innerHTML = `
        ${project.imageUrl ? `<img src="${project.imageUrl}" alt="${project.title}">` : ''}
        <h3>${project.title}</h3>
        <p>${project.description || ''}</p>
        <div class="project-tech">${techChips}</div>
        <div class="project-links">
          ${project.liveLink ? `<a href="${project.liveLink}" target="_blank">Live demo →</a>` : ''}
          ${project.githubLink ? `<a href="${project.githubLink}" target="_blank">Source →</a>` : ''}
        </div>
      `;

      grid.appendChild(card);
    });

  } catch (error) {
    grid.innerHTML = '<div class="projects-empty">Couldn\'t load projects right now — try refreshing.</div>';
    console.error('Failed to load projects:', error);
  }
}

loadProjects(); // run it once the page loads

// ===== ACTIVE NAV LINK ON SCROLL =====

const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let currentSectionId = '';

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 120;
    const sectionHeight = section.offsetHeight;

    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      currentSectionId = section.getAttribute('id');
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSectionId}`) {
      link.classList.add('active');
    }
  });
});

// ===== MOBILE NAV TOGGLE =====

const navToggle = document.querySelector('#navToggle');
const navLinksList = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinksList.classList.toggle('open');
});

// Close the mobile menu after clicking a link
navLinksList.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinksList.classList.remove('open');
  });
});
