// Show scrollbar when scrolling or hovering near scrollbar area
(function() {
  let scrollTimer;
  let hoverTimer;
  const body = document.body;

  // Show scrollbar when scrolling
  window.addEventListener('scroll', function() {
    body.classList.add('show-scrollbar');
    clearTimeout(scrollTimer);

    // Hide scrollbar 1 second after scrolling stops
    scrollTimer = setTimeout(function() {
      body.classList.remove('show-scrollbar');
    }, 1000);
  }, { passive: true });

  // Show scrollbar when mouse is near the right edge (scrollbar area)
  document.addEventListener('mousemove', function(e) {
    const windowWidth = window.innerWidth;
    const distanceFromRight = windowWidth - e.clientX;

    // Show scrollbar if mouse is within 50px of right edge
    if (distanceFromRight < 50) {
      body.classList.add('show-scrollbar');
      clearTimeout(hoverTimer);

      // Hide after mouse leaves area for 500ms
      hoverTimer = setTimeout(function() {
        body.classList.remove('show-scrollbar');
      }, 500);
    }
  }, { passive: true });
})();
