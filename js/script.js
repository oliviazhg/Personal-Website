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
      
      document.getElementById('loading').style.display = 'none';
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
  
  // Set up the scene
  scene.background = new THREE.Color(0xf8f9fa); // Light grey background

  console.log('Canvas element:', document.getElementById('webgl'));
  console.log('Renderer created:', renderer);

  // Function to load GLTF model
  function loadModel(modelUrl) {
    console.log(`Loading GLTF model from:`, modelUrl);
    
    const gltfLoader = new GLTFLoader();
    console.log('GLTFLoader created, starting load...');
    console.log('GLTFLoader instance:', gltfLoader);
    
    gltfLoader.load(
      modelUrl,
      function (gltf) {
        console.log('GLTF model loaded successfully:', gltf);
        console.log('GLTF scene:', gltf.scene);
        console.log('GLTF animations:', gltf.animations);
        console.log('GLTF cameras:', gltf.cameras);
        
        const model = gltf.scene;
        console.log('Model scene:', model);
        console.log('Model children:', model.children);
        
        // Debug: Check what's actually in the model
        console.log('Model children details:');
        model.children.forEach((child, index) => {
          console.log(`Child ${index}:`, child);
          console.log(`Child ${index} type:`, child.type);
          console.log(`Child ${index} visible:`, child.visible);
          if (child.geometry) {
            console.log(`Child ${index} geometry:`, child.geometry);
          }
          if (child.material) {
            console.log(`Child ${index} material:`, child.material);
          }
        });
        
        // Adjust scale and position for better visibility
        model.traverse((child) => {
          if (child.isMesh) {
            console.log('Found mesh:', child);
            console.log('Mesh geometry:', child.geometry);
            console.log('Mesh bounding box:', child.geometry.boundingBox);
            
            // Get the actual bounding box dimensions
            if (child.geometry.boundingBox) {
              const box = child.geometry.boundingBox;
              console.log('Bounding box min:', box.min);
              console.log('Bounding box max:', box.max);
              console.log('Bounding box size:', {
                x: box.max.x - box.min.x,
                y: box.max.y - box.min.y,
                z: box.max.z - box.min.z
              });
            }
            
            console.log('Mesh position:', child.position);
            console.log('Mesh vertices count:', child.geometry.attributes.position.count);
            console.log('Mesh indices count:', child.geometry.index ? child.geometry.index.count : 'No indices');
            
            // Use a wireframe mesh material with grayscale gradient
            const gradientMaterial = new THREE.ShaderMaterial({
              uniforms: {
                time: { value: 0 }
              },
              vertexShader: `
                varying vec3 vPosition;
                void main() {
                  vPosition = position;
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
              `,
              fragmentShader: `
                uniform float time;
                varying vec3 vPosition;
                
                // Simple noise function for random gradients
                float noise(vec3 p) {
                  return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
                }
                
                void main() {
                  // Create multiple gradient patterns
                  float gradient1 = (vPosition.y + 1.0) * 0.5; // Vertical gradient
                  float gradient2 = (vPosition.x + 1.0) * 0.5; // Horizontal gradient
                  float gradient3 = (vPosition.z + 1.0) * 0.5; // Depth gradient
                  
                  // Add radial gradient for center highlight
                  float distanceFromCenter = length(vPosition.xy);
                  float radialGradient = 1.0 - smoothstep(0.0, 1.0, distanceFromCenter);
                  
                  // Add noise-based random gradients
                  float noiseGradient1 = noise(vPosition * 2.0 + time * 0.1);
                  float noiseGradient2 = noise(vPosition * 3.0 - time * 0.15);
                  float noiseGradient3 = noise(vPosition * 1.5 + time * 0.2);
                  
                  // Combine gradients with different weights
                  float combinedGradient = (
                    gradient1 * 0.25 +
                    gradient2 * 0.15 +
                    gradient3 * 0.1 +
                    radialGradient * 0.2 +
                    noiseGradient1 * 0.1 +
                    noiseGradient2 * 0.1 +
                    noiseGradient3 * 0.1
                  );
                  
                  // Add subtle animation
                  float animatedGradient = combinedGradient + sin(time * 0.5) * 0.05;
                  animatedGradient = clamp(animatedGradient, 0.0, 1.0);
                  
                  // Convert to grayscale color with lighter grey range
                  // Map 0.0-1.0 to 0.5-0.9 to use slightly lighter greys
                  float adjustedGradient = 0.5 + (animatedGradient * 0.4);
                  
                  // Super subtle blue tinge
                  vec3 color = vec3(adjustedGradient * 0.98, adjustedGradient * 0.99, adjustedGradient);
                  
                  gl_FragColor = vec4(color, 0.8);
                }
              `,
              wireframe: true,
              transparent: true,
              opacity: 0.8
            });
            
            child.material = gradientMaterial;
            console.log('Replaced material for:', child);
          }
        });
        
        // Don't center the model - just use the original position
        console.log('Model original position:', model.position);
        console.log('Model scale:', model.scale);
        
        // Increase the size of the head model
        model.scale.set(6, 6, 6); // Scale up the head model to make it larger
        
        // Center the head model in the middle of the page
        model.position.set(0, -14, 0); // Moved down to Y = -8
        
        // Ensure camera is positioned to center the view
        camera.position.set(0, 0, 50); // Center camera position
        
        scene.add(model);
        document.getElementById('loading').style.display = 'none';
        console.log('Model added to scene successfully');
        console.log('Scene children count:', scene.children.length);
        console.log('Model position:', model.position);
        console.log('Model scale:', model.scale);
        console.log('Total scene children:', scene.children.length);
        
        // Additional debugging for the mannequin
        console.log('Male head model details:');
        console.log('Model visible:', model.visible);
        console.log('Model children count:', model.children.length);
        model.children.forEach((child, index) => {
          console.log(`Male head child ${index}:`, child.type, child.visible);
        });
      },
      function (progress) {
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
      },
      function (error) {
        console.error('Error loading GLTF model:', error);
        console.error('Error details:', {
          message: error.message,
          type: error.type,
          target: error.target,
          stack: error.stack
        });
        document.getElementById('error').style.display = 'block';
        document.getElementById('loading').style.display = 'none';
      }
    );
  }

  // Load a model - change the URL and format as needed
  const modelUrl = './assets/models/male_head/scene.gltf';
  // Try with absolute path as fallback
  const modelUrlAbsolute = '/assets/models/male_head/scene.gltf';

  console.log('Attempting to load model from:', modelUrl);

  // Try loading the model, with fallback to simple cube
  loadModel(modelUrl);

  // Load the background cloud model
  const cloudModelUrl = './assets/models/xr_lower_austria_sculpture__winter_point_cloud/scene.gltf';
  console.log('Attempting to load cloud model from:', cloudModelUrl);

  // Load the background cloud model
  let cloudModel = null; // Store reference to cloud model globally
  const loader = new GLTFLoader();
  loader.load(
    cloudModelUrl,
    function (gltf) {
      cloudModel = gltf.scene;
      console.log('Cloud model loaded successfully:', cloudModel);
      
      // Position the cloud model in the background
      cloudModel.position.set(0, -270, -100); // Moved a tiny bit down (Y = -270)
      cloudModel.scale.set(80, 80, 80); // Increased scale from 50 to 80
      
      // Make it semi-transparent
      cloudModel.traverse((child) => {
        if (child.isMesh) {
          child.material.transparent = true;
          child.material.opacity = 0.3; // Back to original opacity
          child.material.color.setHex(0xffffff); // Make it white
        }
      });
      
      scene.add(cloudModel);
      console.log('Cloud model added to scene');
    },
    function (progress) {
      console.log('Loading cloud model progress:', (progress.loaded / progress.total * 100) + '%');
    },
    function (error) {
      console.error('Error loading cloud model:', error);
    }
  );

  // Mouse position for cloud rotation
  let mouseX = 0;
  let mouseY = 0;
  let mouseInfluenceX = 0;
  let mouseInfluenceY = 0;
  let mouseMoving = false;
  let lastMouseMoveTime = 0;
  const MOUSE_INFLUENCE_DECAY = 0.07; // Lower decay for a more gradual, smooth return
  const MOUSE_INFLUENCE_AMOUNT_X = 0.02; // Max radians to influence X (reduced)
  const MOUSE_INFLUENCE_AMOUNT_Y = 0.03; // Max radians to influence Y (reduced)

  // Add event listener for mouse movement to rotate cloud
  window.addEventListener('mousemove', function(event) {
    // Normalize mouse position to range [-1, 1]
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    // Target influence based on mouse movement
    mouseTargetInfluenceY = mouseX * MOUSE_INFLUENCE_AMOUNT_Y;
    mouseTargetInfluenceX = mouseY * MOUSE_INFLUENCE_AMOUNT_X;
    mouseMoving = true;
    lastMouseMoveTime = Date.now();
  });
  // Initialize target influence variables
  let mouseTargetInfluenceX = 0;
  let mouseTargetInfluenceY = 0;

  // Fallback: if model fails to load, create a simple cube after 5 seconds
  setTimeout(() => {
    if (document.getElementById('loading').style.display !== 'none') {
      console.log('Model loading taking too long, creating fallback scene...');
      createFallbackScene();
    }
  }, 3000); // Reduced to 3 seconds

  // Add ambient light for overall illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 12.0); // Much brighter ambient light
  scene.add(ambientLight);

  // Add directional light for shadows and depth
  const light = new THREE.DirectionalLight(0xffffff, 15.0); // Much brighter directional light
  light.position.set(5, 5, 5).normalize();
  scene.add(light);

  // Add mouse interaction for head rotation
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let isRotatingHead = false;
  let headModel = null;
  let previousMousePosition = { x: 0, y: 0 };
  
  // Mouse event handlers for head rotation
  function onMouseDown(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    // Check if we clicked on the head model
    for (let intersect of intersects) {
      if (intersect.object.name === 'Sketchfab_Scene' || 
          intersect.object.parent?.name === 'Sketchfab_Scene' ||
          intersect.object.parent?.parent?.name === 'Sketchfab_Scene') {
        isRotatingHead = true;
        headModel = scene.children.find(child => child.name === 'Sketchfab_Scene');
        previousMousePosition = { x: event.clientX, y: event.clientY };
        break;
      }
    }
  }
  
  function onMouseMove(event) {
    if (isRotatingHead && headModel) {
      const deltaX = event.clientX - previousMousePosition.x;
      const deltaY = event.clientY - previousMousePosition.y;
      
      // Rotate the head based on mouse movement
      headModel.rotation.y += deltaX * 0.01;
      headModel.rotation.x += deltaY * 0.01;
      
      previousMousePosition = { x: event.clientX, y: event.clientY };
    }
  }
  
  function onMouseUp() {
    isRotatingHead = false;
    headModel = null;
  }
  
  // Add event listeners for head rotation
  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

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
    
    // Update shader time uniform for gradient animation
    scene.traverse((child) => {
      if (child.isMesh && child.material && child.material.uniforms && child.material.uniforms.time) {
        child.material.uniforms.time.value = Date.now() * 0.001;
      }
    });
    
    // Gradually interpolate mouse influence toward the target (lerp)
    mouseInfluenceX += (mouseTargetInfluenceX - mouseInfluenceX) * 0.08;
    mouseInfluenceY += (mouseTargetInfluenceY - mouseInfluenceY) * 0.08;
    
    // Restore original cloud model animation, add subtle mouse influence only while moving
    if (cloudModel) {
      const time = Date.now() * 0.001;
      // Base animation
      const baseX = Math.sin(time * 0.3) * 0.1;
      const baseZ = Math.cos(time * 0.2) * 0.05;
      // Y rotation accumulates
      cloudModel.rotation.y += 0.005;

      // If mouse is moving, apply influence
      let influenceX = 0;
      let influenceY = 0;
      if (mouseMoving) {
        influenceX = mouseInfluenceX;
        influenceY = mouseInfluenceY;
        // If no mousemove for 100ms, start fading influence
        if (Date.now() - lastMouseMoveTime > 100) {
          mouseMoving = false;
        }
      } else {
        // Fade out influence smoothly
        mouseInfluenceX *= (1 - MOUSE_INFLUENCE_DECAY);
        mouseInfluenceY *= (1 - MOUSE_INFLUENCE_DECAY);
        influenceX = mouseInfluenceX;
        influenceY = mouseInfluenceY;
      }

      cloudModel.rotation.x = baseX + influenceX;
      cloudModel.rotation.z = baseZ;
      cloudModel.rotation.y += influenceY; // Add a little to Y for subtle effect
    }
    
    renderer.render(scene, camera);
  }
  animate();
}

// Fallback scene function
function createFallbackScene() {
  console.log('Creating fallback scene...');
  document.getElementById('loading').style.display = 'none';
  
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
  document.getElementById('loading').style.display = 'none';
  
  console.log('Fallback scene created');
}

// Start the application
init().catch(error => {
  console.error('Failed to initialize:', error);
  createFallbackScene();
});
