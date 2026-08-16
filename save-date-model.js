import * as THREE from 'https://esm.sh/three@0.180.0';
import { GLTFLoader } from 'https://esm.sh/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';

const generatedCanvas = document.querySelector('[data-project-canvas="world"]');
let canvas = null;

if (generatedCanvas) {
  canvas = document.createElement('canvas');
  canvas.setAttribute('data-save-date-model', '');
  canvas.setAttribute('aria-label', 'Slowly rotating 3D character model from Save the Date');
  generatedCanvas.replaceWith(canvas);
}

if (canvas) {
  canvas.style.pointerEvents = 'none';

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 20);
  camera.position.set(0, 0.03, 3.2);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.HemisphereLight(0xf2f4e8, 0x10140f, 2.15));

  const key = new THREE.DirectionalLight(0xffffff, 2.25);
  key.position.set(2.5, 3.5, 4.5);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0xc8ff4d, 1.05);
  rim.position.set(-3.5, 1.5, -2.5);
  scene.add(rim);

  const turntable = new THREE.Group();
  turntable.rotation.y = Math.PI;
  scene.add(turntable);

  let visible = true;
  let loaded = false;

  const resize = () => {
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetWidth = Math.round(width * dpr);
    const targetHeight = Math.round(height * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  };

  new ResizeObserver(resize).observe(canvas);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { rootMargin: '160px' }).observe(canvas);
  }

  const chunkUrls = [
    '/assets/save-date-v1/part0.b64?v=20260817-0240',
    '/assets/save-date-v1/part1.b64?v=20260817-0240',
    '/assets/save-date-v1/part2.b64?v=20260817-0240'
  ];

  const loadModel = async () => {
    const parts = await Promise.all(chunkUrls.map(async (url) => {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status} loading ${url}`);
      return response.text();
    }));

    const base64 = parts.join('').replace(/\s/g, '');
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

    const gltf = await new Promise((resolve, reject) => {
      new GLTFLoader().parse(bytes.buffer, '', resolve, reject);
    });

    const model = gltf.scene;
    model.traverse((child) => {
      if (!child.isMesh) return;
      if (!child.geometry.getAttribute('normal')) child.geometry.computeVertexNormals();
      child.frustumCulled = false;

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (!material) return;
        if (material.color) material.color.set(0xffffff);
        if ('metalness' in material) material.metalness = 0;
        if ('roughness' in material) material.roughness = 0.82;
      });
    });

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = 1.75 / Math.max(size.y, size.x * 0.82);

    model.scale.setScalar(scale);
    model.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    turntable.add(model);
    loaded = true;
    resize();
  };

  loadModel().catch((error) => console.warn('Save the Date model failed to load:', error));

  const clock = new THREE.Clock();
  const animate = () => {
    requestAnimationFrame(animate);
    if (!visible || document.hidden) return;

    const delta = Math.min(clock.getDelta(), 0.05);
    if (loaded) turntable.rotation.y += delta * 0.22;
    renderer.render(scene, camera);
  };

  resize();
  animate();
}
