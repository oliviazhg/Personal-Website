// Art Gallery page functionality
document.addEventListener('DOMContentLoaded', function() {
  const categoryTabs = document.querySelectorAll('.category-tab');
  const artItems = document.querySelectorAll('.art-item');

  // Add click event listeners to category tabs
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const selectedCategory = this.getAttribute('data-category');
      
      // Update active tab
      categoryTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Filter art items
      filterArtItems(selectedCategory);
    });
  });

  function filterArtItems(category) {
    artItems.forEach(item => {
      const itemCategory = item.getAttribute('data-category');
      
      if (category === 'all' || itemCategory === category) {
        item.classList.remove('hidden');
        item.style.display = 'block';
      } else {
        item.classList.add('hidden');
        setTimeout(() => {
          item.style.display = 'none';
        }, 300);
      }
    });
  }

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

  // Observe art items for animation
  artItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(30px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    item.style.transitionDelay = `${index * 0.1}s`;
    observer.observe(item);
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

  // Add click to expand art details
  artItems.forEach(item => {
    item.addEventListener('click', function() {
      const overlay = this.querySelector('.art-overlay');
      const isExpanded = overlay.style.transform === 'translateY(0px)';
      
      if (isExpanded) {
        overlay.style.transform = 'translateY(100%)';
      } else {
        overlay.style.transform = 'translateY(0)';
      }
    });
  });

  // Add hover effects with parallax
  artItems.forEach(item => {
    const image = item.querySelector('.art-image');
    const placeholder = item.querySelector('.art-placeholder');
    
    item.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const moveX = (x - centerX) / centerX * 10;
      const moveY = (y - centerY) / centerY * 10;
      
      placeholder.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.1)`;
    });
    
    item.addEventListener('mouseleave', function() {
      placeholder.style.transform = 'translate(0, 0) scale(1)';
    });
  });

  // Add masonry-like layout effect
  function adjustLayout() {
    const container = document.querySelector('.gallery-container');
    const items = container.querySelectorAll('.art-item');
    
    // Reset heights
    items.forEach(item => {
      item.style.height = 'auto';
    });
    
    // Simple masonry effect
    const columns = Math.floor(container.offsetWidth / 320);
    if (columns > 1) {
      const heights = new Array(columns).fill(0);
      
      items.forEach((item, index) => {
        const shortestColumn = heights.indexOf(Math.min(...heights));
        item.style.order = shortestColumn;
        heights[shortestColumn] += item.offsetHeight;
      });
    }
  }

  // Adjust layout on window resize
  window.addEventListener('resize', adjustLayout);
  
  // Initial layout adjustment
  setTimeout(adjustLayout, 1000);

  // Add loading animation for art items
  artItems.forEach((item, index) => {
    const placeholder = item.querySelector('.art-placeholder');
    
    // Simulate loading delay
    setTimeout(() => {
      placeholder.style.animation = 'fadeInArt 0.8s ease forwards';
    }, index * 100);
  });

  // Add CSS animation for art loading
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInArt {
      from {
        opacity: 0;
        transform: scale(0.8) rotate(-5deg);
      }
      to {
        opacity: 0.8;
        transform: scale(1) rotate(0deg);
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

  // Add featured work animation
  const featuredItem = document.querySelector('.featured-item');
  if (featuredItem) {
    const featuredObserver = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px'
    });
    
    featuredItem.style.opacity = '0';
    featuredItem.style.transform = 'translateY(50px)';
    featuredItem.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    featuredObserver.observe(featuredItem);
  }
}); 