// Background 3D Scene for Projects Page
async function initBackground() {
  // Import Three.js with error handling
  let THREE;
  let GLTFLoader;

  try {
    // Use local Three.js files to avoid CDN issues
    const threeModule = await import('./three.module.js');
    THREE = threeModule;
    console.log('Three.js loaded successfully for background');
    
    // Import GLTFLoader from local file
    const gltfLoaderModule = await import('./GLTFLoader.js');
    GLTFLoader = gltfLoaderModule.GLTFLoader;
    console.log('GLTFLoader loaded successfully for background');
    
  } catch (error) {
    console.error('Failed to load Three.js or GLTFLoader for background:', error);
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
  
  // Set up the scene
  scene.background = new THREE.Color(0xf8f9fa); // Light grey background

  console.log('Background canvas element:', document.getElementById('backgroundWebgl'));
  console.log('Background renderer created:', renderer);

  // Load the background cloud model
  const cloudModelUrl = './assets/models/xr_lower_austria_sculpture__winter_point_cloud/scene.gltf';
  console.log('Attempting to load cloud model from:', cloudModelUrl);

  // Load the background cloud model
  const loader = new GLTFLoader();
  loader.load(
    cloudModelUrl,
    function (gltf) {
      const cloudModel = gltf.scene;
      console.log('Cloud model loaded successfully for background:', cloudModel);
      
      // Position the cloud model in the background
      cloudModel.position.set(0, -270, -100);
      cloudModel.scale.set(80, 80, 80);
      
      // Make it semi-transparent
      cloudModel.traverse((child) => {
        if (child.isMesh) {
          child.material.transparent = true;
          child.material.opacity = 0.3;
          child.material.color.setHex(0xffffff);
        }
      });
      
      scene.add(cloudModel);
      console.log('Cloud model added to background scene');
    },
    function (progress) {
      console.log('Loading cloud model progress:', (progress.loaded / progress.total * 100) + '%');
    },
    function (error) {
      console.error('Error loading cloud model for background:', error);
    }
  );

  // Add ambient light for overall illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 12.0);
  scene.add(ambientLight);

  // Add directional light for shadows and depth
  const light = new THREE.DirectionalLight(0xffffff, 15.0);
  light.position.set(5, 5, 5).normalize();
  scene.add(light);

  camera.position.z = 50;

  console.log('Starting background animation loop');

  function animate() {
    requestAnimationFrame(animate);
    
    // Rotate the cloud model around different axes
    const cloudModel = scene.children.find(child => child.type === 'Group');
    if (cloudModel) {
      // Rotate around different axes based on time
      const time = Date.now() * 0.001;
      cloudModel.rotation.x = Math.sin(time * 0.3) * 0.1; // Gentle X rotation
      cloudModel.rotation.y += 0.002; // Reduced from 0.005 to 0.002 for slower rotation
      cloudModel.rotation.z = Math.cos(time * 0.2) * 0.05; // Gentle Z rotation
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