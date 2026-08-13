document.addEventListener('DOMContentLoaded', () => {

  // ─────────────────────────────────────────────
  // 0. AUDIO SETUP — Instant Autoplay
  // ─────────────────────────────────────────────
  const startupAudio = new Audio('startup.mpeg');
  startupAudio.volume = 0.65;
  startupAudio.preload = 'auto';

  const projectAudio = new Audio('lala.mpeg');
  projectAudio.volume = 0.7;
  projectAudio.preload = 'auto';

  // Attempt instant autoplay — plays silently if browser allows
  startupAudio.play().catch(() => {
    // If blocked, try again on first user interaction
    const tryOnInteraction = () => {
      startupAudio.play().catch(() => {});
      document.removeEventListener('click', tryOnInteraction);
      document.removeEventListener('scroll', tryOnInteraction);
    };
    document.addEventListener('click', tryOnInteraction);
    document.addEventListener('scroll', tryOnInteraction);
  });

  // 1. Dynamic Typing Effect
  const roles = [
    "DevOps Engineer",
    "Java Full Stack Developer",
    "AWS Solution Architect"
  ];
  
  const typingText = document.getElementById('typing-text');
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 100;

  function typeEffect() {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
      typingText.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 50;
    } else {
      typingText.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 100;
    }

    if (!isDeleting && charIndex === currentRole.length) {
      isDeleting = true;
      typeSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      typeSpeed = 500; // Pause before next word
    }

    setTimeout(typeEffect, typeSpeed);
  }

  typeEffect();

  // 2. Scroll Reveal Animations (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          
          // Trigger counter animation if hero stats inside
          const statNumbers = entry.target.querySelectorAll('.stat-number');
          if (statNumbers.length > 0) {
            animateCounters(statNumbers);
          }
        }
      });
    }, {
      threshold: 0.02,
      rootMargin: '0px 0px 50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach(el => el.classList.add('active'));
  }

  // 3. Stats Counter Animation
  let animated = false;
  function animateCounters(counters) {
    if (animated) return;
    animated = true;

    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const duration = 2000;
      const stepTime = 30;
      const steps = duration / stepTime;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          counter.textContent = target;
          clearInterval(timer);
        } else {
          counter.textContent = Math.ceil(current);
        }
      }, stepTime);
    });
  }

  // 4. Mouse-Move Parallax — orbs only, hero stage does NOT tilt
  const orb1 = document.getElementById('orb1');
  const orb2 = document.getElementById('orb2');
  const orb3 = document.getElementById('orb3');

  window.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth - 0.5;
    const mouseY = e.clientY / window.innerHeight - 0.5;

    if (orb1) orb1.style.transform = `translate(${mouseX * 40}px, ${mouseY * 40}px)`;
    if (orb2) orb2.style.transform = `translate(${mouseX * -30}px, ${mouseY * -30}px)`;
    if (orb3) orb3.style.transform = `translate(${mouseX * 20}px, ${mouseY * -20}px)`;
  });

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // Parallax scroll shift
    if (orb1) orb1.style.top = `${10 + scrollY * 0.05}%`;
    if (orb2) orb2.style.bottom = `${10 - scrollY * 0.03}%`;

    // Active Navigation Highlight
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      if (scrollY >= sectionTop) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });

  // 5. Mobile Navigation Menu Toggle
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });
  }

  // 6. Dynamic Year in Footer
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});

// 7. Project Modal Data & Dynamic Popup Handlers
const projectData = {
  afsha: {
    title: "Afsha Enterprises",
    clientTag: "E-Commerce Client Website",
    url: "https://www.afshaenterprises.com/",
    imageSrc: "afsha.png",
    category: "E-Commerce Platform",
    description: "A comprehensive, high-conversion E-Commerce web application developed for Afsha Enterprises. The platform specializes in premium electric body massagers, handheld therapy devices, and personal wellness equipment with nationwide delivery integration.",
    features: [
      "Integrated Razorpay secure payment gateway for instant online checkouts.",
      "Custom product catalog management with responsive grid layouts.",
      "Cart workflow & order calculation with live shipping logic.",
      "Optimized for high performance, fast initial page load times, and SEO ranking."
    ],
    techStack: ["Java", "Spring Boot", "React JS", "Razorpay API", "MySQL", "CSS3 / HTML5"]
  },
  programmingwala: {
    title: "ProgrammingWala",
    clientTag: "LMS & Education System",
    url: "https://www.programmingwala.com/",
    imageSrc: "programmingwala.png",
    category: "Learning Management System (MERN Stack)",
    description: "An end-to-end Learning Management System (LMS) engineered for ProgrammingWala (Appletree Infotech coaching institute). Built on the MERN stack to deliver interactive coding courses, student portals, and video lecture series.",
    features: [
      "Architected using MERN Stack (MongoDB, Express, React, Node.js).",
      "Interactive student portal with enrollment tracking and course modules.",
      "Responsive video player integration and coding practice resources.",
      "REST API backend managing authentication, student data, and course content."
    ],
    techStack: ["MERN Stack", "MongoDB", "Express.js", "React JS", "Node.js", "REST APIs"]
  },
  rancom: {
    title: "Rancom Technologies",
    clientTag: "Enterprise Company Website",
    url: "https://www.rancomtechnologies.com/",
    imageSrc: "rancomtechnologies.png",
    category: "Enterprise Corporate Web Portal",
    description: "Official corporate website for Rancom Technologies Pvt Ltd (a software development company in Noida, India, part of the Appletree Infotech group). Showcases enterprise software development, HRMS, ERP systems, and mobile application services.",
    features: [
      "Enterprise software showcase detailing custom IT, HRMS, and ERP solutions.",
      "Full-stack web architecture integrated with cloud-ready deployment infrastructure.",
      "Responsive corporate design system with smooth navigation and contact funnels.",
      "SEO-optimized metadata and high-performance loading across mobile & desktop."
    ],
    techStack: ["Java", "MERN Stack", "AWS Cloud", "React JS", "Full Stack Architecture"]
  }
};

function openProjectModal(projectId) {
  const modal = document.getElementById('projectModal');
  const modalBody = document.getElementById('modalBody');
  const project = projectData[projectId];

  if (!project) return;

  const techBadgeHTML = project.techStack
    .map(tech => `<span class="skill-tag" style="font-size: 0.8rem; padding: 6px 14px;">${tech}</span>`)
    .join('');

  const featuresHTML = project.features
    .map(feat => `<li><i class="fa-solid fa-check-circle"></i> <span>${feat}</span></li>`)
    .join('');

  modalBody.innerHTML = `
    <div style="border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 24px; box-shadow: 0 15px 35px rgba(0,0,0,0.5);">
      <img src="${project.imageSrc}" alt="${project.title} Screenshot" style="width: 100%; height: auto; max-height: 340px; object-fit: cover; object-position: top center; display: block;">
    </div>

    <h2 class="modal-title">${project.title}</h2>
    <p class="modal-subtitle"><i class="fa-solid fa-link"></i> <a href="${project.url}" target="_blank" rel="noopener noreferrer" style="color: var(--accent-color); text-decoration: underline;">${project.url}</a></p>

    <div class="modal-section-title">Overview & Architecture</div>
    <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px;">${project.description}</p>

    <div class="modal-section-title">Key Highlights & Features</div>
    <ul class="modal-features-list">
      ${featuresHTML}
    </ul>

    <div class="modal-section-title">Technology Stack</div>
    <div class="skills-list" style="margin-bottom: 24px;">
      ${techBadgeHTML}
    </div>

    <div class="modal-actions">
      <a href="${project.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
        Visit Live Website <i class="fa-solid fa-arrow-up-right-from-square"></i>
      </a>
      <button class="btn btn-secondary" onclick="closeProjectModal()">Close</button>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Play project audio
  projectAudio.currentTime = 0;
  projectAudio.play().catch(() => {});
}

function closeProjectModal() {
  const modal = document.getElementById('projectModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    // Stop project audio
    projectAudio.pause();
    projectAudio.currentTime = 0;
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeProjectModal();
});

document.addEventListener('click', (e) => {
  const modal = document.getElementById('projectModal');
  if (e.target === modal) closeProjectModal();
});

// Form Submission Handler
function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const button = form.querySelector('button[type="submit"]');
  
  const originalText = button.innerHTML;
  button.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
  button.disabled = true;

  setTimeout(() => {
    button.innerHTML = 'Message Sent! <i class="fa-solid fa-check"></i>';
    button.style.background = '#28a745';
    form.reset();

    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.background = '';
      button.disabled = false;
    }, 3000);
  }, 1200);
}
