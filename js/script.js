// Main function to initialize everything
async function init() {
  // Import Three.js with error handling
  let THREE;
  let GLTFLoader;

  try {
    // Use local Three.js files to avoid CDN issues
    const threeModule = await import('./three.module.js');
    THREE = threeModule;
    console.log('Three.js loaded successfully');
    
    // Import GLTFLoader from local file
    const gltfLoaderModule = await import('./GLTFLoader.js');
    GLTFLoader = gltfLoaderModule.GLTFLoader;
    console.log('GLTFLoader loaded successfully from local file');
    
  } catch (error) {
    console.error('Failed to load Three.js or GLTFLoader:', error);
    console.error('Error details:', error);
    
    // Try to create a simple Three.js scene without the loader
    try {
      console.log('Attempting to create simple Three.js scene...');
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl') });
      renderer.setSize(window.innerWidth, window.innerHeight);
      
      // Create a simple cube
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      
      camera.position.z = 5;
      
      function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
      }
      animate();
      
      // Loading element removed
      console.log('Simple Three.js scene created successfully');
      return;
      
    } catch (threeError) {
      console.error('Failed to create Three.js scene:', threeError);
      // Create a simple fallback scene without external dependencies
      createFallbackScene();
      return;
    }
  }

  console.log('Starting 3D scene setup...');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000); // Wider field of view
  camera.near = 0.01; // Very close near plane
  camera.far = 10000; // Very far far plane
  camera.updateProjectionMatrix(); // Update the camera
  const renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById('webgl'),
    antialias: true, // Enable antialiasing for better quality
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio); // Use high DPI for crisp rendering
  
  // Set up the scene with dark grey gradient background
  scene.background = new THREE.Color(0x2a2a2a); // Dark grey background

  console.log('Canvas element:', document.getElementById('webgl'));
  console.log('Renderer created:', renderer);

  // Global variables for point cloud and mouse interaction
  let pointCloud = null;
  let originalPositions = null;
  const mouse = new THREE.Vector2(-9999, -9999); // Initialize off-screen to prevent initial swirl
  const raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = 0.5; // Increase detection radius

  // Variables for drag rotation
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let rotation = { x: 0.314159, y: 0 }; // Start angled down 25 degrees

  // Load XYZ point cloud
  async function loadPointCloud(url) {
    console.log('Loading point cloud from:', url);

    try {
      const response = await fetch(url);
      const text = await response.text();
      const lines = text.trim().split('\n');

      const positions = [];
      const colors = [];

      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 3) {
          const x = parseFloat(parts[0]);
          const y = parseFloat(parts[1]);
          const z = parseFloat(parts[2]);

          positions.push(x, y, z);

          // Create smooth gradient blends using multiple sine waves
          // Use continuous functions instead of discrete regions
          const freq1 = 2.5, freq2 = 3.7, freq3 = 4.3;

          // Red channel - combination of position-based waves
          const r = (Math.sin(x * freq1 + y * 0.5) * 0.5 + 0.5) *
                    (Math.cos(z * freq2) * 0.3 + 0.7);

          // Green channel - different frequency combinations
          const g = (Math.sin(y * freq2 + z * 0.7) * 0.5 + 0.5) *
                    (Math.cos(x * freq3) * 0.3 + 0.7);

          // Blue channel - yet another combination
          const b = (Math.sin(z * freq3 + x * 0.3) * 0.5 + 0.5) *
                    (Math.cos(y * freq1) * 0.3 + 0.7);

          // Add some variation with combined position influence
          const variation = Math.sin(x * y * z * 10) * 0.1;

          colors.push(
            Math.max(0, Math.min(1, r + variation)),
            Math.max(0, Math.min(1, g + variation)),
            Math.max(0, Math.min(1, b + variation))
          );
        }
      });

      console.log(`Loaded ${positions.length / 3} points`);

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

      // Store original positions for animation
      originalPositions = new Float32Array(positions);

      const material = new THREE.PointsMaterial({
        size: 0.01,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
      });

      pointCloud = new THREE.Points(geometry, material);

      // Calculate bounding box to center the model
      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Center and scale the point cloud
      pointCloud.position.set(-center.x, -center.y - 7, -center.z); // Moved up from -10 to -5

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 30 / maxDim;
      pointCloud.scale.set(scale, scale, scale);

      scene.add(pointCloud);
      console.log('Point cloud added to scene');

    } catch (error) {
      console.error('Error loading point cloud:', error);
    }
  }

  // Load the point cloud model
  const modelUrl = `./assets/models/ptcloudtest.xyz?v=${Date.now()}`;
  loadPointCloud(modelUrl);

  // Load the background cloud point cloud
  const cloudModelUrl = './assets/models/xr_lower_austria_sculpture__winter_point_cloud/scene.xyz';
  console.log('Attempting to load cloud point cloud from:', cloudModelUrl);

  // Load the background cloud model
  let cloudModel = null; // Store reference globally

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


  // Fallback removed - loading element no longer exists

  // Add ambient light for overall illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 12.0); // Much brighter ambient light
  scene.add(ambientLight);

  // Add directional light for shadows and depth
  const light = new THREE.DirectionalLight(0xffffff, 15.0); // Much brighter directional light
  light.position.set(5, 5, 5).normalize();
  scene.add(light);

  // Mouse tracking for particle interaction and drag rotation
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);

  function onMouseMove(event) {
    // Convert mouse position to normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Handle drag rotation
    if (isDragging && pointCloud) {
      const deltaX = event.clientX - previousMousePosition.x;
      const deltaY = event.clientY - previousMousePosition.y;

      rotation.y += deltaX * 0.005; // Horizontal rotation
      rotation.x += deltaY * 0.005; // Vertical rotation

      previousMousePosition = {
        x: event.clientX,
        y: event.clientY
      };
    }
  }

  function onMouseDown(event) {
    isDragging = true;
    previousMousePosition = {
      x: event.clientX,
      y: event.clientY
    };
  }

  function onMouseUp(event) {
    isDragging = false;
  }

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

  camera.position.z = 50; // Move camera even further back

  console.log('Starting animation loop');

  function animate() {
    requestAnimationFrame(animate);

    // Apply drag rotation to point cloud
    if (pointCloud) {
      pointCloud.rotation.x = rotation.x;
      pointCloud.rotation.y = rotation.y;
    }

    // Rotate the cloud model around different axes (much slower)
    if (cloudModel) {
      const time = Date.now() * 0.001;
      cloudModel.rotation.x = Math.sin(time * 0.3) * 0.1; // Gentle X rotation
      cloudModel.rotation.y += 0.0005; // Much slower Y rotation
      cloudModel.rotation.z = Math.cos(time * 0.2) * 0.05; // Gentle Z rotation
    }

    // Apply swirl effect to point cloud based on mouse proximity
    if (pointCloud && originalPositions) {
      raycaster.setFromCamera(mouse, camera);

      const positions = pointCloud.geometry.attributes.position.array;
      const time = Date.now() * 0.001;

      // Create a plane at the point cloud's Z position for intersection
      const intersectPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersectPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(intersectPlane, intersectPoint);

      // Transform intersection point to point cloud's local space
      const localPoint = pointCloud.worldToLocal(intersectPoint.clone());

      const radius = 0.3;
      let needsUpdate = false;

      // Process all particles every frame
      for (let i = 0; i < positions.length; i += 3) {
        const x = originalPositions[i];
        const y = originalPositions[i + 1];
        const z = originalPositions[i + 2];

        // Calculate distance from mouse (in local space)
        const dx = x - localPoint.x;
        const dy = y - localPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Apply swirl effect within radius
        if (distance < radius) {
          needsUpdate = true;
          const influence = 1 - (distance / radius);
          const angle = influence * Math.PI * 2 * Math.sin(time * 2);
          const swirl = influence * 0.1;

          // Rotate particles around mouse position
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);

          const rotatedX = dx * cos - dy * sin;
          const rotatedY = dx * sin + dy * cos;

          positions[i] = localPoint.x + rotatedX + Math.sin(time * 3 + i) * swirl;
          positions[i + 1] = localPoint.y + rotatedY + Math.cos(time * 3 + i) * swirl;
          positions[i + 2] = z + Math.sin(time * 2 + i) * swirl * 0.5;
        } else {
          // Always return to original position
          const diffX = x - positions[i];
          const diffY = y - positions[i + 1];
          const diffZ = z - positions[i + 2];

          // Check if particle needs to move back
          if (Math.abs(diffX) > 0.0001 || Math.abs(diffY) > 0.0001 || Math.abs(diffZ) > 0.0001) {
            needsUpdate = true;
            positions[i] += diffX * 0.1;
            positions[i + 1] += diffY * 0.1;
            positions[i + 2] += diffZ * 0.1;
          }
        }
      }

      if (needsUpdate) {
        pointCloud.geometry.attributes.position.needsUpdate = true;
      }
    }

    renderer.render(scene, camera);
  }
  animate();
}

// Fallback scene function
function createFallbackScene() {
  console.log('Creating fallback scene...');

  // Hide the canvas
  const canvas = document.getElementById('webgl');
  canvas.style.display = 'none';

  // Create a simple 3D-looking scene with CSS
  const fallbackDiv = document.createElement('div');
  fallbackDiv.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 200px;
    background: linear-gradient(45deg, #00ff00, #008000);
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    animation: rotate 4s linear infinite;
  `;

  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes rotate {
      from { transform: translate(-50%, -50%) rotateY(0deg); }
      to { transform: translate(-50%, -50%) rotateY(360deg); }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(fallbackDiv);

  console.log('Fallback scene created');
}

// Start the application
init().catch(error => {
  console.error('Failed to initialize:', error);
  createFallbackScene();
});
