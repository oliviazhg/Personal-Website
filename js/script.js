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
  
  // Set up the scene with image background
  const textureLoader = new THREE.TextureLoader();
  const backgroundTexture = textureLoader.load(
    './assets/bg_pics/4.jpg',
    function(texture) {
      console.log('Background image loaded successfully');
    },
    undefined,
    function(error) {
      console.error('Error loading background image:', error);
      // Fallback to gradient background
      const canvas = document.createElement('canvas');
      canvas.width = 2;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 256);
      gradient.addColorStop(0, '#DDDCEC');
      gradient.addColorStop(1, '#DEE4E4');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 2, 256);
      const fallbackTexture = new THREE.CanvasTexture(canvas);
      scene.background = fallbackTexture;
    }
  );
  scene.background = backgroundTexture;

  console.log('Canvas element:', document.getElementById('webgl'));
  console.log('Renderer created:', renderer);

  // Global variables for point cloud and mouse interaction
  let pointCloud = null;
  let originalPositions = null;
  const mouse = new THREE.Vector2(-9999, -9999); // Initialize off-screen to prevent initial swirl
  const raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = 0.5; // Increase detection radius
  let textSprites = []; // Store text sprites for orbiting text

  // Variables for drag rotation
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let rotation = { x: 0.0872665, y: 0 }; // Start angled down 5 degrees

  // Variables for random orbit angle changes (reduced to -2 to +2 degrees to keep letters on screen)
  const maxAngle = (2 * Math.PI) / 180; // 2 degrees in radians
  let orbitRotationX = (Math.random() * 2 - 1) * maxAngle;
  let orbitRotationY = (Math.random() * 2 - 1) * maxAngle;
  let orbitRotationZ = (Math.random() * 2 - 1) * maxAngle;
  let targetOrbitRotationX = orbitRotationX;
  let targetOrbitRotationY = orbitRotationY;
  let targetOrbitRotationZ = orbitRotationZ;
  let lastAngleChange = Date.now();

  // Variables for animated wavy circle
  let wavePhase = 0; // Phase offset for the wave animation
  let waveSpeed = 0.0002; // How fast the wave pattern shifts

  // Variables for dynamic circle radius
  const minRadius = 20; // Current radius (minimum)
  const maxRadius = 25; // Maximum radius
  let currentRadius = minRadius;
  let targetRadius = minRadius + Math.random() * (maxRadius - minRadius);
  let lastRadiusChange = Date.now();

  // Circle center position (independent of point cloud)
  const circleCenter = { x: 0, y: 10, z: 0 }; // Y=10 to position it higher on screen

  // Function to create orbiting text sprites
  function createOrbitingText() {
    const text = "hello! i'm olivia, an engineer & creative technologist. welcome to my website! ";
    const repeatCount = 4; // Repeat the sentence 8 times to fill the circle
    const fullText = text.repeat(repeatCount);
    const chars = Array.from(fullText).reverse(); // Reverse so text reads correctly when facing outward
    const angleStep = (Math.PI * 2) / chars.length;

    console.log('Creating text sprites for characters:', chars.length);

    chars.forEach((char, index) => {
      // Skip pure whitespace for cleaner look
      if (char.trim() === '') return;

      const word = char; // Treat each character as a "word"
      // Create canvas for text
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 256;

      // Clear canvas to fully transparent
      context.clearRect(0, 0, 512, 256);

      // Draw text with transparent background
      context.fillStyle = '#FFFFFF';
      context.font = '500 64px "JetBrains Mono", "Courier New", monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(word, 256, 128);

      console.log(`Drawing word: "${word}" at index ${index}`);

      // Measure text to create tight-fitting canvas
      context.font = '500 64px "JetBrains Mono", "Courier New", monospace';
      const metrics = context.measureText(word);
      const textWidth = metrics.width;
      const textHeight = 64;

      // Create smaller canvas that fits the text exactly
      const tightCanvas = document.createElement('canvas');
      const tightContext = tightCanvas.getContext('2d');
      const padding = 10;
      tightCanvas.width = textWidth + padding * 2;
      tightCanvas.height = textHeight + padding * 2;

      // Clear and draw text on tight canvas
      tightContext.clearRect(0, 0, tightCanvas.width, tightCanvas.height);
      tightContext.fillStyle = '#FFFFFF';
      tightContext.font = '500 64px "JetBrains Mono", "Courier New", monospace';
      tightContext.textAlign = 'center';
      tightContext.textBaseline = 'middle';
      tightContext.fillText(word, tightCanvas.width / 2, tightCanvas.height / 2);

      // Create texture from tight canvas
      const texture = new THREE.CanvasTexture(tightCanvas);
      texture.premultiplyAlpha = false;

      // Use Mesh with PlaneGeometry instead of Sprite so we can control rotation
      const aspectRatio = tightCanvas.width / tightCanvas.height;
      const planeGeometry = new THREE.PlaneGeometry(1 * aspectRatio, 1);
      const planeMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
        depthTest: true,
        alphaTest: 0.1 // Don't render pixels below 10% opacity
      });
      const textMesh = new THREE.Mesh(planeGeometry, planeMaterial);

      // Store initial angle for this mesh
      textMesh.userData.angle = index * angleStep;
      textMesh.userData.index = index;

      scene.add(textMesh);
      textSprites.push(textMesh); // Still using same array name for compatibility
    });

    console.log(`Created ${textSprites.length} text sprites`);
  }

  // Load XYZ point cloud
  async function loadPointCloud(url) {
    console.log('Loading point cloud from:', url);

    try {
      const response = await fetch(url);
      const text = await response.text();
      const lines = text.trim().split('\n');

      const positions = [];
      const colors = [];

      // Define the color palette
      const palette = [
        { r: 0xFF/255, g: 0xFD/255, b: 0xFF/255 }, // FFFDFF
        { r: 0xF0/255, g: 0xFF/255, b: 0xFF/255 }, // F0FFFF
        { r: 0xD5/255, g: 0xE6/255, b: 0xF0/255 }, // D5E6F0
        { r: 0xDB/255, g: 0xEB/255, b: 0xF7/255 }, // DBEBF7
        { r: 0x93/255, g: 0x98/255, b: 0x9B/255 }, // 93989B
        { r: 0xA6/255, g: 0x9C/255, b: 0x99/255 }, // A69C99
        { r: 0xDD/255, g: 0xDC/255, b: 0xEC/255 }, // DDDCEC
        { r: 0xDF/255, g: 0xE5/255, b: 0xE5/255 }  // DFE5E5
      ];

      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 3) {
          const x = parseFloat(parts[0]);
          const y = parseFloat(parts[1]);
          const z = parseFloat(parts[2]);

          positions.push(x, y, z);

          // Use position-based noise to select colors with emphasis on greys for depth/contrast
          const freq = 2.5;
          const noise1 = Math.sin(x * freq) * Math.cos(y * freq);
          const noise2 = Math.sin(y * freq + 2.5) * Math.cos(z * freq);
          const noise3 = Math.sin(z * freq + 5.0) * Math.cos(x * freq);

          // Combine noise to create a selector value
          const selector = (noise1 + noise2 + noise3 + 3) / 6; // Normalize to 0-1

          // Use depth (z) to bias towards grey colors for recessed areas
          const depthBias = Math.abs(z * 0.5); // Use absolute value and reduce multiplier
          let biasedSelector = (selector + depthBias) % 1.0;

          // Ensure selector is in valid range
          if (biasedSelector < 0) biasedSelector += 1.0;

          // Pick primary and secondary colors based on biased selector
          const index = biasedSelector * 7; // 0-7 range (8 colors)
          const primaryIdx = Math.min(Math.floor(index), 7);
          const secondaryIdx = Math.min(primaryIdx + 1, 7);
          const blend = Math.max(0, Math.min(1, index - primaryIdx)); // Clamp blend

          // Blend between two adjacent colors in the palette
          const primary = palette[primaryIdx];
          const secondary = palette[secondaryIdx];

          const r = primary.r * (1 - blend) + secondary.r * blend;
          const g = primary.g * (1 - blend) + secondary.g * blend;
          const b = primary.b * (1 - blend) + secondary.b * blend;

          colors.push(r, g, b);
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

      // Create orbiting text around the point cloud
      console.log('About to call createOrbitingText...');
      try {
        createOrbitingText();
        console.log('createOrbitingText completed');
      } catch (textError) {
        console.error('Error creating orbiting text:', textError);
      }

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

      rotation.y += deltaX * 0.005; // Horizontal rotation (unrestricted)
      rotation.x += deltaY * 0.005; // Vertical rotation (unrestricted for head model)

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

    // Apply drag rotation to point cloud and sync text orbit angles
    if (pointCloud) {
      pointCloud.rotation.x = rotation.x;
      pointCloud.rotation.y = rotation.y;

      // Sync orbit rotation with point cloud rotation when dragging, but constrain to ±2 degrees
      if (isDragging) {
        const pitchLimit = (2 * Math.PI) / 180; // 2 degrees in radians
        targetOrbitRotationX = Math.max(-pitchLimit, Math.min(pitchLimit, rotation.x));
        targetOrbitRotationY = rotation.y; // Y rotation (yaw) can follow freely
      }
    }

    // Rotate the cloud model around different axes (much slower)
    if (cloudModel) {
      const time = Date.now() * 0.001;
      cloudModel.rotation.x = Math.sin(time * 0.3) * 0.1; // Gentle X rotation
      cloudModel.rotation.y += 0.0005; // Much slower Y rotation
      cloudModel.rotation.z = Math.cos(time * 0.2) * 0.05; // Gentle Z rotation
    }

    // Animate orbiting text sprites in 3D with random angle changes
    if (pointCloud && textSprites.length > 0) {
      const time = Date.now() * 0.001;
      const currentTime = Date.now();
      const orbitSpeed = 0.1; // Much slower rotation speed

      // Animate the wave phase continuously
      wavePhase += waveSpeed;

      // Change target orbit angles randomly every 10-15 seconds (but not when dragging)
      if (!isDragging && currentTime - lastAngleChange > 10000 + Math.random() * 5000) {
        targetOrbitRotationX = (Math.random() * 2 - 1) * maxAngle;
        targetOrbitRotationY = (Math.random() * 2 - 1) * maxAngle;
        targetOrbitRotationZ = (Math.random() * 2 - 1) * maxAngle;
        lastAngleChange = currentTime;
      }

      // Change target radius randomly every 8-12 seconds
      if (currentTime - lastRadiusChange > 8000 + Math.random() * 4000) {
        targetRadius = minRadius + Math.random() * (maxRadius - minRadius);
        lastRadiusChange = currentTime;
      }

      // Very slowly interpolate to target angles (faster when dragging)
      const interpolationSpeed = isDragging ? 0.1 : 0.005;
      orbitRotationX += (targetOrbitRotationX - orbitRotationX) * interpolationSpeed;
      orbitRotationY += (targetOrbitRotationY - orbitRotationY) * interpolationSpeed;
      orbitRotationZ += (targetOrbitRotationZ - orbitRotationZ) * interpolationSpeed;

      // Gradually interpolate radius
      currentRadius += (targetRadius - currentRadius) * 0.002;

      textSprites.forEach((sprite) => {
        const angle = sprite.userData.angle + time * orbitSpeed;

        // Position sprites in 3D circle with vertical variation (animated wave)
        let x = Math.cos(angle) * currentRadius;
        let y = Math.sin(angle * 2 + wavePhase) * 0.5; // Add vertical movement (height variation) with animated phase - reduced amplitude
        let z = Math.sin(angle) * currentRadius;

        // Apply rotation transformations for random orbit angles
        // Rotate around X axis
        let y1 = y * Math.cos(orbitRotationX) - z * Math.sin(orbitRotationX);
        let z1 = y * Math.sin(orbitRotationX) + z * Math.cos(orbitRotationX);

        // Rotate around Y axis
        let x2 = x * Math.cos(orbitRotationY) + z1 * Math.sin(orbitRotationY);
        let z2 = -x * Math.sin(orbitRotationY) + z1 * Math.cos(orbitRotationY);

        // Rotate around Z axis
        let x3 = x2 * Math.cos(orbitRotationZ) - y1 * Math.sin(orbitRotationZ);
        let y3 = x2 * Math.sin(orbitRotationZ) + y1 * Math.cos(orbitRotationZ);

        // Calculate final position using circleCenter instead of pointCloud position
        const finalX = circleCenter.x + x3;
        const finalY = circleCenter.y + y3;
        const finalZ = circleCenter.z + z2;

        // Convert 3D position to screen space to check mouse proximity
        const spritePosition = new THREE.Vector3(finalX, finalY, finalZ);
        spritePosition.project(camera);

        // Calculate distance from mouse in screen space
        const dx = spritePosition.x - mouse.x;
        const dy = spritePosition.y - mouse.y;
        const distanceToMouse = Math.sqrt(dx * dx + dy * dy);

        // Apply displacement if mouse is close
        const displacementRadius = 0.2; // Screen space radius for mouse interaction
        let displacement = 0;
        if (distanceToMouse < displacementRadius) {
          const influence = 1 - (distanceToMouse / displacementRadius);
          displacement = influence * 5; // Larger displacement amount
        }

        // Apply displacement in the direction away from mouse
        sprite.position.x = finalX + dx * displacement;
        sprite.position.y = finalY + dy * displacement;
        sprite.position.z = finalZ;

        // Calculate tangent direction at this point on the wavy path
        // Take a small step forward along the path
        const deltaAngle = 0.05;
        const nextAngle = angle + deltaAngle;

        // Calculate next position on the path (before transformations) using animated wave
        const nextX = Math.cos(nextAngle) * currentRadius;
        const nextY = Math.sin(nextAngle * 2 + wavePhase) * 0.5; // Reduced amplitude
        const nextZ = Math.sin(nextAngle) * currentRadius;

        // Apply same rotation transformations to next position
        let nextY1 = nextY * Math.cos(orbitRotationX) - nextZ * Math.sin(orbitRotationX);
        let nextZ1 = nextY * Math.sin(orbitRotationX) + nextZ * Math.cos(orbitRotationX);
        let nextX2 = nextX * Math.cos(orbitRotationY) + nextZ1 * Math.sin(orbitRotationY);
        let nextZ2 = -nextX * Math.sin(orbitRotationY) + nextZ1 * Math.cos(orbitRotationY);
        let nextX3 = nextX2 * Math.cos(orbitRotationZ) - nextY1 * Math.sin(orbitRotationZ);
        let nextY3 = nextX2 * Math.sin(orbitRotationZ) + nextY1 * Math.cos(orbitRotationZ);

        // Calculate world position of next point using circleCenter
        const nextWorldX = circleCenter.x + nextX3;
        const nextWorldY = circleCenter.y + nextY3;
        const nextWorldZ = circleCenter.z + nextZ2;

        // Tangent vector = direction from current position to next position
        const tangentX = nextWorldX - sprite.position.x;
        const tangentY = nextWorldY - sprite.position.y;
        const tangentZ = nextWorldZ - sprite.position.z;

        // Normalize tangent
        const tangentLength = Math.sqrt(tangentX * tangentX + tangentY * tangentY + tangentZ * tangentZ);
        const normTangentX = tangentX / tangentLength;
        const normTangentY = tangentY / tangentLength;
        const normTangentZ = tangentZ / tangentLength;

        // Calculate the normal vector (pointing outward from the curve)
        // The normal is perpendicular to the tangent
        // For a circular path, the outward normal points from center to the letter position
        const normalX = sprite.position.x - circleCenter.x;
        const normalY = sprite.position.y - circleCenter.y;
        const normalZ = sprite.position.z - circleCenter.z;

        // Normalize the normal vector
        const normalLength = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ);
        const normNormalX = normalX / normalLength;
        const normNormalY = normalY / normalLength;
        const normNormalZ = normalZ / normalLength;

        // Orient the letter to face outward along the normal
        // Calculate yaw (Y-axis rotation) - direction in XZ plane
        const yaw = Math.atan2(normNormalX, normNormalZ);

        // Calculate pitch (X-axis rotation) - vertical tilt
        const horizontalLength = Math.sqrt(normNormalX * normNormalX + normNormalZ * normNormalZ);
        const pitch = Math.atan2(normNormalY, horizontalLength);

        // Calculate roll (Z-axis rotation) to align letter's vertical with the tangent
        // Use the tangent vector to determine how the letter should be rotated around the normal
        const roll = Math.atan2(normTangentY, Math.sqrt(normTangentX * normTangentX + normTangentZ * normTangentZ));

        // Apply rotations (using negative roll)
        sprite.rotation.y = yaw;
        sprite.rotation.x = -pitch;
        sprite.rotation.z = -roll;
      });
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
