// Bookshelf page functionality
document.addEventListener('DOMContentLoaded', function() {
  const categoryTabs = document.querySelectorAll('.category-tab');
  const bookCards = document.querySelectorAll('.book-card');

  // Add click event listeners to category tabs
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const selectedCategory = this.getAttribute('data-category');
      
      // Update active tab
      categoryTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Filter books
      filterBooks(selectedCategory);
    });
  });

  function filterBooks(category) {
    bookCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      
      if (category === 'all' || cardCategory === category) {
        card.classList.remove('hidden');
        card.style.display = 'block';
      } else {
        card.classList.add('hidden');
        setTimeout(() => {
          card.style.display = 'none';
        }, 300);
      }
    });
  }

  // Animate reading progress bar
  const progressFill = document.querySelector('.progress-fill');
  if (progressFill) {
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const width = entry.target.style.width;
          entry.target.style.width = '0%';
          setTimeout(() => {
            entry.target.style.width = width;
          }, 100);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '0px 0px -50px 0px'
    });
    
    observer.observe(progressFill);
  }

  // Add hover effects to book cards
  bookCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
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
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe book cards for animation
  bookCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    card.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(card);
  });

  // Observe stat cards for animation
  const statCards = document.querySelectorAll('.stat-card');
  statCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    card.style.transitionDelay = `${index * 0.2}s`;
    observer.observe(card);
  });

  // Add click to expand book details
  bookCards.forEach(card => {
    const content = card.querySelector('.book-content');
    const description = card.querySelector('.description');
    
    if (description) {
      const originalText = description.textContent;
      const shortText = originalText.length > 100 ? 
        originalText.substring(0, 100) + '...' : originalText;
      
      description.textContent = shortText;
      
      if (originalText.length > 100) {
        content.addEventListener('click', function() {
          if (description.textContent === shortText) {
            description.textContent = originalText;
          } else {
            description.textContent = shortText;
          }
        });
        
        content.style.cursor = 'pointer';
        content.title = 'Click to expand/collapse description';
      }
    }
  });

  // Animate star ratings
  const starRatings = document.querySelectorAll('.stars');
  starRatings.forEach(rating => {
    const stars = rating.textContent;
    rating.textContent = '';
    
    for (let i = 0; i < stars.length; i++) {
      const star = document.createElement('span');
      star.textContent = stars[i];
      star.style.opacity = '0';
      star.style.animationDelay = `${i * 0.1}s`;
      star.style.animation = 'fadeInStar 0.5s ease forwards';
      rating.appendChild(star);
    }
  });

  // Add CSS animation for stars
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInStar {
      from {
        opacity: 0;
        transform: scale(0.5);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `;
  document.head.appendChild(style);

  // Parallax effect for page hero
  window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.page-hero');
    
    if (hero) {
      const rate = scrolled * -0.5;
      hero.style.transform = `translateY(${rate}px)`;
    }
  });
}); 