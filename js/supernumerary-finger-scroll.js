// Navigation visibility on scroll for Somatic Bloom page
(function() {
  const nav = document.querySelector('.top-nav-project');
  let lastScrollTop = 0;
  let scrollTimeout;

  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // Clear any existing timeout
    clearTimeout(scrollTimeout);

    // If scrolling down and past 100px, hide nav
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      nav.classList.add('hidden');
    }
    // If scrolling up, show nav
    else if (scrollTop < lastScrollTop) {
      nav.classList.remove('hidden');
    }

    // Always show nav when at top
    if (scrollTop <= 100) {
      nav.classList.remove('hidden');
    }

    lastScrollTop = scrollTop;

    // Show nav again after 2 seconds of no scrolling
    scrollTimeout = setTimeout(function() {
      nav.classList.remove('hidden');
    }, 2000);
  }, { passive: true });
})();
