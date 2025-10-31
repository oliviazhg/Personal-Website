// Background 3D Scene for Projects Page
async function initBackground() {
  // Import Three.js with error handling
  let THREE;

  try {
    // Use local Three.js files to avoid CDN issues
    const threeModule = await import('./three.module.js');
    THREE = threeModule;
    console.log('Three.js loaded successfully for background');

  } catch (error) {
    console.error('Failed to load Three.js for background:', error);
    return;
  }

  console.log('Starting background 3D scene setup...');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.near = 0.01;
  camera.far = 10000;
  camera.updateProjectionMatrix();

  const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('backgroundWebgl'),
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Make the renderer background transparent since we're using CSS background
  renderer.setClearColor(0x000000, 0);

  console.log('Background canvas element:', document.getElementById('backgroundWebgl'));
  console.log('Background renderer created:', renderer);

  // Load the background cloud point cloud
  const cloudModelUrl = './assets/models/xr_lower_austria_sculpture__winter_point_cloud/scene.xyz';
  console.log('Attempting to load cloud point cloud from:', cloudModelUrl);

  let cloudModel = null;

  async function loadBackgroundCloud(url) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      const lines = text.trim().split('\n');

      const positions = [];
      const colors = [];

      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 3) {
          positions.push(
            parseFloat(parts[0]),
            parseFloat(parts[1]),
            parseFloat(parts[2])
          );
          colors.push(1, 1, 1); // White
        }
      });

      console.log(`Loaded ${positions.length / 3} background cloud points`);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        transparent: true,
        opacity: 0.3
      });

      cloudModel = new THREE.Points(geometry, material);
      cloudModel.position.set(0, -270, -100);
      cloudModel.scale.set(80, 80, 80);

      scene.add(cloudModel);
      console.log('Background cloud point cloud added to scene');

    } catch (error) {
      console.error('Error loading background cloud:', error);
    }
  }

  loadBackgroundCloud(cloudModelUrl);

  // Add ambient light for overall illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); // Subtle ambient light
  scene.add(ambientLight);

  // Add directional light for shadows and depth
  const light = new THREE.DirectionalLight(0xffffff, 2.0); // Moderate directional light
  light.position.set(5, 5, 5).normalize();
  scene.add(light);

  camera.position.z = 50;

  console.log('Starting background animation loop');

  function animate() {
    requestAnimationFrame(animate);

    // Rotate the cloud model around different axes (slower than home page)
    if (cloudModel) {
      const time = Date.now() * 0.001;
      cloudModel.rotation.x = Math.sin(time * 0.15) * 0.1; // Half speed: 0.3 -> 0.15
      cloudModel.rotation.y += 0.00025; // Half speed: 0.0005 -> 0.00025
      cloudModel.rotation.z = Math.cos(time * 0.1) * 0.05; // Half speed: 0.2 -> 0.1
    }

    renderer.render(scene, camera);
  }
  animate();

  // Add window resize handler
  window.addEventListener('resize', onWindowResize);

  function onWindowResize() {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Update pixel ratio for high DPI displays
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
}

// Start the background application
initBackground().catch(error => {
  console.error('Failed to initialize background:', error);
});
