// Experience page functionality
document.addEventListener('DOMContentLoaded', function() {
  // Animate skill bars on scroll
  const skillBars = document.querySelectorAll('.skill-progress');
  
  const skillObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const progressBar = entry.target;
        const width = progressBar.style.width;
        
        // Reset width to 0 and animate to target width
        progressBar.style.width = '0%';
        setTimeout(() => {
          progressBar.style.width = width;
        }, 100);
        
        skillObserver.unobserve(progressBar);
      }
    });
  }, {
    threshold: 0.5,
    rootMargin: '0px 0px -50px 0px'
  });

  skillBars.forEach(bar => {
    skillObserver.observe(bar);
  });

  // Animate timeline items on scroll
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  const timelineObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '0px 0px -100px 0px'
  });

  timelineItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = index % 2 === 0 ? 'translateX(-50px)' : 'translateX(50px)';
    item.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    item.style.transitionDelay = `${index * 0.2}s`;
    timelineObserver.observe(item);
  });

  // Animate education cards on scroll
  const educationCards = document.querySelectorAll('.education-card');
  
  const educationObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.3,
    rootMargin: '0px 0px -50px 0px'
  });

  educationCards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    card.style.transitionDelay = `${index * 0.2}s`;
    educationObserver.observe(card);
  });

  // Add hover effects to timeline items
  timelineItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.02)';
    });
    
    item.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
    });
  });

  // Add click to expand timeline content
  timelineItems.forEach(item => {
    const content = item.querySelector('.timeline-content');
    const achievements = item.querySelector('.timeline-achievements');
    
    if (achievements) {
      achievements.style.maxHeight = '0';
      achievements.style.overflow = 'hidden';
      achievements.style.transition = 'max-height 0.3s ease';
      
      content.addEventListener('click', function() {
        if (achievements.style.maxHeight === '0px') {
          achievements.style.maxHeight = achievements.scrollHeight + 'px';
        } else {
          achievements.style.maxHeight = '0';
        }
      });
      
      content.style.cursor = 'pointer';
    }
  });

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