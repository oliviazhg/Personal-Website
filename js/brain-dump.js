// Brain Dump page functionality
document.addEventListener('DOMContentLoaded', function() {
  // Add reading progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress';
  progressBar.innerHTML = '<div class="reading-progress-bar"></div>';
  document.body.appendChild(progressBar);

  // Update reading progress
  function updateReadingProgress() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    
    const progressBarElement = document.querySelector('.reading-progress-bar');
    if (progressBarElement) {
      progressBarElement.style.width = scrollPercent + '%';
    }
  }

  window.addEventListener('scroll', updateReadingProgress);

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

  // Observe posts for animation
  const posts = document.querySelectorAll('.post');
  posts.forEach((post, index) => {
    post.style.opacity = '0';
    post.style.transform = 'translateY(30px)';
    post.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    post.style.transitionDelay = `${index * 0.2}s`;
    observer.observe(post);
  });

  // Observe sidebar widgets for animation
  const sidebarWidgets = document.querySelectorAll('.sidebar-widget');
  sidebarWidgets.forEach((widget, index) => {
    widget.style.opacity = '0';
    widget.style.transform = 'translateX(30px)';
    widget.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    widget.style.transitionDelay = `${index * 0.3}s`;
    observer.observe(widget);
  });

  // Add hover effects to posts
  posts.forEach(post => {
    post.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px) scale(1.02)';
    });
    
    post.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Add click to expand post content
  posts.forEach(post => {
    const content = post.querySelector('.post-content');
    const paragraphs = content.querySelectorAll('p');
    
    // If post has more than 2 paragraphs, add expand functionality
    if (paragraphs.length > 2) {
      const firstTwoParagraphs = Array.from(paragraphs).slice(0, 2);
      const remainingParagraphs = Array.from(paragraphs).slice(2);
      
      // Hide remaining paragraphs initially
      remainingParagraphs.forEach(p => {
        p.style.display = 'none';
      });
      
      // Add expand button
      const expandButton = document.createElement('button');
      expandButton.textContent = 'Read More';
      expandButton.className = 'expand-button';
      expandButton.style.cssText = `
        background: #007bff;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 1rem;
        font-weight: 500;
        transition: all 0.3s ease;
      `;
      
      content.appendChild(expandButton);
      
      let isExpanded = false;
      expandButton.addEventListener('click', function() {
        if (isExpanded) {
          remainingParagraphs.forEach(p => {
            p.style.display = 'none';
          });
          this.textContent = 'Read More';
          isExpanded = false;
        } else {
          remainingParagraphs.forEach(p => {
            p.style.display = 'block';
          });
          this.textContent = 'Read Less';
          isExpanded = true;
        }
      });
    }
  });

  // Add tag filtering functionality
  const tags = document.querySelectorAll('.tag');
  tags.forEach(tag => {
    tag.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all tags
      tags.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tag
      this.classList.add('active');
      
      const tagText = this.textContent.toLowerCase();
      
      // Filter posts based on tag
      posts.forEach(post => {
        const postTags = Array.from(post.querySelectorAll('.tag')).map(t => t.textContent.toLowerCase());
        
        if (tagText === 'all' || postTags.includes(tagText)) {
          post.style.display = 'block';
          post.style.opacity = '1';
        } else {
          post.style.opacity = '0';
          setTimeout(() => {
            post.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // Add category filtering
  const categoryLinks = document.querySelectorAll('.category-link');
  categoryLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all category links
      categoryLinks.forEach(l => l.classList.remove('active'));
      
      // Add active class to clicked link
      this.classList.add('active');
      
      const category = this.textContent.split('(')[0].trim().toLowerCase();
      
      // Filter posts based on category
      posts.forEach(post => {
        const postCategory = post.querySelector('.post-category').textContent.toLowerCase();
        
        if (category === 'all' || postCategory === category) {
          post.style.display = 'block';
          post.style.opacity = '1';
        } else {
          post.style.opacity = '0';
          setTimeout(() => {
            post.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // Add smooth scrolling for anchor links
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

  // Add typing effect to featured post title
  const featuredPostTitle = document.querySelector('.featured-post h2');
  if (featuredPostTitle) {
    const originalText = featuredPostTitle.textContent;
    featuredPostTitle.textContent = '';
    
    let i = 0;
    const typeWriter = () => {
      if (i < originalText.length) {
        featuredPostTitle.textContent += originalText.charAt(i);
        i++;
        setTimeout(typeWriter, 50);
      }
    };
    
    // Start typing effect when post comes into view
    const titleObserver = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          typeWriter();
          titleObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    titleObserver.observe(featuredPostTitle);
  }

  // Add parallax effect for page hero
  window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.page-hero');
    
    if (hero) {
      const rate = scrolled * -0.5;
      hero.style.transform = `translateY(${rate}px)`;
    }
  });

  // Add word count to posts
  posts.forEach(post => {
    const content = post.querySelector('.post-content');
    const wordCount = content.textContent.split(' ').length;
    
    const wordCountElement = document.createElement('div');
    wordCountElement.className = 'word-count';
    wordCountElement.textContent = `${wordCount} words`;
    wordCountElement.style.cssText = `
      font-size: 0.8rem;
      color: #666;
      margin-top: 1rem;
      font-style: italic;
    `;
    
    content.appendChild(wordCountElement);
  });

  // Add CSS for active states
  const style = document.createElement('style');
  style.textContent = `
    .tag.active {
      background: #007bff !important;
      color: white !important;
    }
    
    .category-link.active {
      color: #007bff !important;
      font-weight: 600;
    }
    
    .expand-button:hover {
      background: #0056b3 !important;
      transform: translateY(-2px);
    }
  `;
  document.head.appendChild(style);
}); 