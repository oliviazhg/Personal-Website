// Loading Screen with animated text
(function() {
  // Determine which page we're on
  const currentPage = window.location.pathname;
  const isHomePage = currentPage.includes('index.html') || currentPage === '/' || currentPage.endsWith('/');

  console.log('Loading screen initialized. Page:', currentPage, 'Is home page:', isHomePage);

  const loadingTextElement = document.querySelector('.loading-text');
  const loadingStar = document.querySelector('.loading-star');
  let textAnimationComplete = false;
  let pageLoadComplete = false;
  let pointCloudLoadComplete = false;

  // All pages: hide text and rotate star
  loadingTextElement.style.display = 'none';
  loadingStar.classList.add('rotating');

  // Text animation is considered "complete" immediately since there's no text
  textAnimationComplete = true;

  // Listen for point cloud loaded event (only on home page)
  window.addEventListener('pointCloudLoaded', function() {
    console.log('Point cloud loaded event received');
    pointCloudLoadComplete = true;
    checkAndHideLoadingScreen();
  });

  // Hide loading screen when page is fully loaded
  window.addEventListener('load', function() {
    console.log('Page load event received');
    pageLoadComplete = true;
    checkAndHideLoadingScreen();
  });

  // Failsafe timeout - hide after 10 seconds regardless
  setTimeout(() => {
    console.log('Failsafe timeout triggered - forcing loading screen to hide');
    hideLoadingScreen();
  }, 10000);

  // Check if we can hide the loading screen
  function checkAndHideLoadingScreen() {
    // For non-home pages, we don't need to wait for point cloud
    const pointCloudReady = !isHomePage || pointCloudLoadComplete;

    console.log('Check hide conditions:', {
      textAnimationComplete,
      pageLoadComplete,
      pointCloudReady,
      isHomePage
    });

    // Only hide when: text animation is done AND page is loaded AND (point cloud is loaded OR not home page)
    if (textAnimationComplete && pageLoadComplete && pointCloudReady) {
      hideLoadingScreen();
    }
  }

  function hideLoadingScreen() {
    console.log('Hiding loading screen');
    setTimeout(function() {
      const loadingScreen = document.querySelector('.loading-screen');
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');

        // Remove from DOM after transition
        setTimeout(function() {
          loadingScreen.remove();
          // Re-enable scrolling
          document.body.classList.remove('no-scroll');
          document.documentElement.classList.remove('no-scroll');
        }, 500); // Match the CSS transition duration
      }
    }, 300); // Small delay to ensure smooth transition
  }
})();
