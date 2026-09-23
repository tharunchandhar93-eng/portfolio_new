/**
 * THARUN C - 3D WEBGL GRAPHICS ENGINE
 * Built with Three.js
 * 1. Background Interactive Constellation / Particle Field & Floating 3D Geometries
 * 2. Dedicated Interactive 3D Football Widget with Drag, Inertia, and Kick Physics
 */

// Global State
window.ThreeApp = {
  bgScene: null,
  bgCamera: null,
  bgRenderer: null,
  particles: null,
  floatingMeshes: [],
  mouseX: 0,
  mouseY: 0,
  targetMouseX: 0,
  targetMouseY: 0,
  footballApp: null
};

// Initialize Background WebGL Scene
function initBackgroundScene() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') {
    initCanvas2DFallback(canvas);
    return;
  }

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 80;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    window.ThreeApp.bgScene = scene;
    window.ThreeApp.bgCamera = camera;
    window.ThreeApp.bgRenderer = renderer;

    // 1. Particle Cloud
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cyan = new THREE.Color(0x00f2fe);
    const blue = new THREE.Color(0x3b82f6);
    const purple = new THREE.Color(0x8b5cf6);

    for (let i = 0; i < particleCount * 3; i += 3) {
      // Space distribution
      positions[i] = (Math.random() - 0.5) * 220;
      positions[i + 1] = (Math.random() - 0.5) * 220;
      positions[i + 2] = (Math.random() - 0.5) * 160;

      // Color interpolation
      const choice = Math.random();
      const color = choice < 0.45 ? cyan : choice < 0.8 ? blue : purple;
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Texture Generation via Canvas for crisp circular glows
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(0, 242, 254, 0.8)');
    grad.addColorStop(1, 'rgba(0, 242, 254, 0)');
    pCtx.fillStyle = grad;
    pCtx.fillRect(0, 0, 32, 32);

    const pTexture = new THREE.CanvasTexture(pCanvas);

    const material = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      map: pTexture,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    window.ThreeApp.particles = particles;

    // 2. Floating 3D Geometric Objects (Wireframe Nodes)
    const wireframeMatCyan = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });

    const wireframeMatPurple = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });

    // Shape 1: Icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(12, 1);
    const icoMesh = new THREE.Mesh(icoGeo, wireframeMatCyan);
    icoMesh.position.set(45, 15, -20);
    scene.add(icoMesh);
    window.ThreeApp.floatingMeshes.push({ mesh: icoMesh, rx: 0.003, ry: 0.005 });

    // Shape 2: Octahedron
    const octGeo = new THREE.OctahedronGeometry(9, 0);
    const octMesh = new THREE.Mesh(octGeo, wireframeMatPurple);
    octMesh.position.set(-50, -25, -15);
    scene.add(octMesh);
    window.ThreeApp.floatingMeshes.push({ mesh: octMesh, rx: -0.004, ry: 0.003 });

    // Shape 3: Torus
    const torusGeo = new THREE.TorusGeometry(8, 2.5, 12, 24);
    const torusMesh = new THREE.Mesh(torusGeo, wireframeMatCyan);
    torusMesh.position.set(-40, 35, -30);
    scene.add(torusMesh);
    window.ThreeApp.floatingMeshes.push({ mesh: torusMesh, rx: 0.005, ry: -0.004 });

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Mouse Tracking
    window.addEventListener('mousemove', (e) => {
      window.ThreeApp.targetMouseX = (e.clientX - window.innerWidth / 2) * 0.05;
      window.ThreeApp.targetMouseY = (e.clientY - window.innerHeight / 2) * 0.05;
    });

    // Resize Handler
    window.addEventListener('resize', () => {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation Loop
    let clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      window.ThreeApp.mouseX += (window.ThreeApp.targetMouseX - window.ThreeApp.mouseX) * 0.05;
      window.ThreeApp.mouseY += (window.ThreeApp.targetMouseY - window.ThreeApp.mouseY) * 0.05;

      camera.position.x = window.ThreeApp.mouseX * 0.3;
      camera.position.y = -window.ThreeApp.mouseY * 0.3;
      camera.lookAt(scene.position);

      // Rotate particle field slowly
      if (particles) {
        particles.rotation.y = elapsedTime * 0.04;
        particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.1;
      }

      // Rotate floating geometric wireframes
      window.ThreeApp.floatingMeshes.forEach(item => {
        item.mesh.rotation.x += item.rx;
        item.mesh.rotation.y += item.ry;
        item.mesh.position.y += Math.sin(elapsedTime * 1.5) * 0.03;
      });

      renderer.render(scene, camera);
    }
    animate();
  } catch (err) {
    console.warn("Three.js init warning:", err);
    initCanvas2DFallback(canvas);
  }
}

// 2D Canvas Fallback if WebGL/Three.js fails
function initCanvas2DFallback(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const dots = Array.from({ length: 90 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    r: Math.random() * 2 + 1
  }));

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(0, 242, 254, 0.6)';
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.08)';

    dots.forEach((d, i) => {
      d.x += d.vx;
      d.y += d.vy;
      if (d.x < 0 || d.x > width) d.vx *= -1;
      if (d.y < 0 || d.y > height) d.vy *= -1;

      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < dots.length; j++) {
        const d2 = dots[j];
        const dist = Math.hypot(d.x - d2.x, d.y - d2.y);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d2.x, d2.y);
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ===================================================================
// 3D FOOTBALL WIDGET SIMULATION
// ===================================================================
function initFootballWidget() {
  const container = document.getElementById('football-canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth || 400;
  const height = container.clientHeight || 420;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 1.2, 5.5);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Lighting
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x111827, 1.2);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0x00f2fe, 1.5);
  dirLight.position.set(5, 10, 7);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const purpleLight = new THREE.PointLight(0x8b5cf6, 2, 20);
  purpleLight.position.set(-4, -2, 3);
  scene.add(purpleLight);

  // High-Resolution Procedural Football Texture
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = 1024;
  textureCanvas.height = 512;
  const tCtx = textureCanvas.getContext('2d');

  // Base white leather
  tCtx.fillStyle = '#f8fafc';
  tCtx.fillRect(0, 0, 1024, 512);

  // Draw classic black pentagon pattern tiles
  tCtx.fillStyle = '#0f172a';
  tCtx.strokeStyle = '#cbd5e1';
  tCtx.lineWidth = 4;

  const pentagons = [
    { x: 256, y: 128 }, { x: 768, y: 128 },
    { x: 512, y: 256 }, { x: 0, y: 256 }, { x: 1024, y: 256 },
    { x: 256, y: 384 }, { x: 768, y: 384 },
    { x: 128, y: 64 }, { x: 640, y: 64 },
    { x: 384, y: 448 }, { x: 896, y: 448 }
  ];

  function drawPentagon(cx, cy, r) {
    tCtx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) tCtx.moveTo(x, y);
      else tCtx.lineTo(x, y);
    }
    tCtx.closePath();
    tCtx.fill();
    tCtx.stroke();
  }

  pentagons.forEach(p => drawPentagon(p.x, p.y, 44));

  // Cyber styling accents (Cyan energy seams)
  tCtx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
  tCtx.lineWidth = 2;
  for (let x = 0; x < 1024; x += 128) {
    tCtx.beginPath();
    tCtx.moveTo(x, 0);
    tCtx.lineTo(x, 512);
    tCtx.stroke();
  }

  const ballTexture = new THREE.CanvasTexture(textureCanvas);
  ballTexture.wrapS = THREE.RepeatWrapping;
  ballTexture.wrapT = THREE.RepeatWrapping;

  // Ball Mesh
  const ballGeo = new THREE.SphereGeometry(1.4, 64, 64);
  const ballMat = new THREE.MeshStandardMaterial({
    map: ballTexture,
    roughness: 0.35,
    metalness: 0.15,
  });

  const ballGroup = new THREE.Group();
  const ballMesh = new THREE.Mesh(ballGeo, ballMat);
  ballMesh.castShadow = true;
  ballMesh.receiveShadow = true;
  ballGroup.add(ballMesh);

  // Ground shadow disc
  const shadowGeo = new THREE.CircleGeometry(1.6, 32);
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.45
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = -1.6;
  ballGroup.add(shadowMesh);

  scene.add(ballGroup);

  // Interactive Variables
  let isDragging = false;
  let prevMouseX = 0;
  let prevMouseY = 0;
  let rotVelX = 0.005;
  let rotVelY = 0.01;

  // Bounce / Kick Physics State
  let isKicking = false;
  let ballPosY = 0;
  let ballVelY = 0;
  let gravity = -0.018;

  // Event Listeners for Drag Rotation
  const dom = renderer.domElement;
  dom.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  dom.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevMouseX;
    const deltaY = e.clientY - prevMouseY;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;

    rotVelY = deltaX * 0.008;
    rotVelX = deltaY * 0.008;
    ballMesh.rotation.y += rotVelY;
    ballMesh.rotation.x += rotVelX;
  });

  // Touch Support for Mobile
  dom.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    }
  });

  dom.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - prevMouseX;
    const deltaY = e.touches[0].clientY - prevMouseY;
    prevMouseX = e.touches[0].clientX;
    prevMouseY = e.touches[0].clientY;

    rotVelY = deltaX * 0.008;
    rotVelX = deltaY * 0.008;
    ballMesh.rotation.y += rotVelY;
    ballMesh.rotation.x += rotVelX;
  });

  dom.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Click on ball triggers kick
  dom.addEventListener('click', () => {
    triggerKick();
  });

  // Kick Button Action
  const kickBtn = document.getElementById('kick-ball-btn');
  if (kickBtn) {
    kickBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerKick();
    });
  }

  function triggerKick() {
    ballVelY = 0.38;
    rotVelY = (Math.random() - 0.5) * 0.15;
    rotVelX = 0.12;
    isKicking = true;
    if (window.AudioController) {
      window.AudioController.playKick();
    }
  }

  // Animation Loop
  function animateFootball() {
    requestAnimationFrame(animateFootball);

    // Apply inertia rotation
    if (!isDragging) {
      ballMesh.rotation.y += rotVelY;
      ballMesh.rotation.x += rotVelX;
      rotVelY *= 0.96;
      rotVelX *= 0.96;
      if (Math.abs(rotVelY) < 0.002) rotVelY = 0.004; // Keep subtle idle spin
    }

    // Handle vertical bounce physics
    if (isKicking) {
      ballPosY += ballVelY;
      ballVelY += gravity;

      if (ballPosY <= 0) {
        ballPosY = 0;
        ballVelY = -ballVelY * 0.65; // restitution coefficient
        if (Math.abs(ballVelY) < 0.03) {
          ballVelY = 0;
          isKicking = false;
        }
      }

      ballMesh.position.y = ballPosY;
      // Adjust shadow size & opacity based on height
      const scale = Math.max(0.4, 1 - ballPosY * 0.25);
      shadowMesh.scale.set(scale, scale, 1);
      shadowMat.opacity = Math.max(0.1, 0.45 - ballPosY * 0.15);
    }

    renderer.render(scene, camera);
  }
  animateFootball();

  // Resize handling
  window.addEventListener('resize', () => {
    const newW = container.clientWidth;
    const newH = container.clientHeight;
    if (newW > 0 && newH > 0) {
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    }
  });

  window.ThreeApp.footballApp = {
    triggerKick: triggerKick
  };
}

// Global hook
document.addEventListener('DOMContentLoaded', () => {
  initBackgroundScene();
  setTimeout(() => {
    initFootballWidget();
  }, 100);
});
