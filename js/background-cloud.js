// Background Cloud Animation for Projects Page
document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('backgroundCanvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Cloud particles
  const particles = [];
  const particleCount = 20;
  
  // Create particles
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 15 + 10, // Much larger particles
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.6 + 0.4 // Much more visible opacity
    });
  }
  
  // Animation loop
  function animate() {
    // Clear canvas with light grey background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    particles.forEach(particle => {
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // Wrap around edges
      if (particle.x < 0) particle.x = canvas.width;
      if (particle.x > canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = canvas.height;
      if (particle.y > canvas.height) particle.y = 0;
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 100, 100, ${particle.opacity})`; // Much darker grey
      ctx.fill();
    });
    
    requestAnimationFrame(animate);
  }
  
  // Start animation
  animate();
  
  // Debug: Log to console to ensure script is running
  console.log('Background cloud script loaded and running');
  console.log('Canvas size:', canvas.width, 'x', canvas.height);
  console.log('Particles created:', particles.length);
}); 