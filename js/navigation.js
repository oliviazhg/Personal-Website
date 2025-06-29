// Mobile navigation functionality
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close mobile menu when clicking on a link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', function(event) {
    if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});

// Menu functionality
document.addEventListener('DOMContentLoaded', function() {
  const menuIcon = document.getElementById('menuIcon');
  const dropdownMenu = document.getElementById('dropdownMenu');
  const menuOverlay = document.getElementById('menuOverlay');

  // Toggle menu
  function toggleMenu() {
    menuIcon.classList.toggle('active');
    dropdownMenu.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (dropdownMenu.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  // Close menu
  function closeMenu() {
    menuIcon.classList.remove('active');
    dropdownMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  // Event listeners
  menuIcon.addEventListener('click', toggleMenu);
  menuOverlay.addEventListener('click', closeMenu);

  // Close menu when clicking on a menu link
  const menuLinks = document.querySelectorAll('.menu-link');
  menuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  // Close menu on window resize
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
}); 