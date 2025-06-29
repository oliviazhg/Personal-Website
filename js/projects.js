// Project hover effects and image display functionality
document.addEventListener('DOMContentLoaded', function() {
  const projectItems = document.querySelectorAll('.project-item');
  const projectImageContainer = document.querySelector('.project-image-container');
  const projectImagePlaceholder = document.querySelector('.project-image-placeholder');

  // Project images data
  const projectImages = {
    'personal-website': {
      emoji: '🌐',
      description: 'Interactive 3D website with Three.js'
    },
    'responsive-dashboard': {
      emoji: '📱',
      description: 'Modern dashboard with data visualization'
    },
    '3d-head-model': {
      emoji: '🎭',
      description: 'Interactive 3D head model viewer'
    },
    'point-cloud': {
      emoji: '☁️',
      description: 'Animated point cloud visualization'
    },
    'generative-art': {
      emoji: '🎨',
      description: 'Algorithmic art generation'
    },
    'audio-visualizer': {
      emoji: '🎵',
      description: 'Real-time audio visualization'
    },
    'ai-text-generator': {
      emoji: '🧠',
      description: 'AI-powered text generation'
    },
    'ar-experience': {
      emoji: '🔮',
      description: 'Augmented reality experience'
    }
  };

  // Handle project item hover
  projectItems.forEach(item => {
    const projectId = item.getAttribute('data-project');
    const projectData = projectImages[projectId];

    item.addEventListener('mouseenter', function() {
      // Show project image/emoji
      if (projectData) {
        projectImagePlaceholder.innerHTML = `
          <div style="font-size: 6rem; margin-bottom: 1rem;">${projectData.emoji}</div>
          <div style="font-size: 1.2rem; font-weight: 500; color: #2c3e50;">${projectData.description}</div>
        `;
      }
      
      // Add hover class for styling
      this.classList.add('hovered');
    });

    item.addEventListener('mouseleave', function() {
      // Reset to placeholder
      projectImagePlaceholder.innerHTML = `
        <span>Hover over a project to see its preview</span>
      `;
      
      // Remove hover class
      this.classList.remove('hovered');
    });

    // Handle click to navigate to project detail page
    item.addEventListener('click', function() {
      const projectName = this.querySelector('.project-name').textContent;
      const projectSlug = projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Navigate to project detail page
      window.location.href = `project-${projectSlug}.html`;
    });
  });

  // Add intersection observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
      }
    });
  }, observerOptions);

  // Observe project items for animation
  projectItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-30px)';
    item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(item);
  });

  // Add smooth scroll for project navigation
  const smoothScrollToProject = (projectId) => {
    const projectElement = document.querySelector(`[data-project="${projectId}"]`);
    if (projectElement) {
      projectElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  // Keyboard navigation
  document.addEventListener('keydown', function(event) {
    const activeElement = document.activeElement;
    const projectItemsArray = Array.from(projectItems);
    const currentIndex = projectItemsArray.indexOf(activeElement);

    switch(event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (currentIndex < projectItemsArray.length - 1) {
          projectItemsArray[currentIndex + 1].focus();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (currentIndex > 0) {
          projectItemsArray[currentIndex - 1].focus();
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (activeElement.classList.contains('project-item')) {
          activeElement.click();
        }
        break;
    }
  });

  // Make project items focusable for keyboard navigation
  projectItems.forEach(item => {
    item.setAttribute('tabindex', '0');
  });
}); 