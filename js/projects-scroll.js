// Handle scroll-based menu hiding for Projects page
let lastScrollTop = 0;
const nav = document.querySelector('.top-nav-projects');
const scrollThreshold = 100; // Minimum scroll distance to trigger hide/show

window.addEventListener('scroll', function() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  // Only hide/show if scrolled past threshold
  if (scrollTop > scrollThreshold) {
    if (scrollTop > lastScrollTop) {
      // Scrolling down - hide nav
      nav.classList.add('hidden');
    } else {
      // Scrolling up - show nav
      nav.classList.remove('hidden');
    }
  } else {
    // Near top of page - always show nav
    nav.classList.remove('hidden');
  }

  lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, false);
