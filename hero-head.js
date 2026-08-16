import * as THREE from 'https://esm.sh/three@0.180.0';
import { GLTFLoader } from 'https://esm.sh/three@0.180.0/examples/jsm/loaders/GLTFLoader.js';

const canvas = document.querySelector('[data-head-canvas]');
const stage = document.querySelector('[data-sculpture-stage]');

if (canvas && stage) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionScale = reduceMotion ? 0.45 : 1;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
  camera.position.set(0, 0, 8.2);

  const headGroup = new THREE.Group();
  scene.add(headGroup);

  const ambient = new THREE.HemisphereLight(0xdfffc1, 0x08100a, 1.4);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xc8ff4d, 3.4);
  key.position.set(3.5, 4.5, 5.5);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x65e5d1, 2.2);
  rim.position.set(-4, 1.5, -2.5);
  scene.add(rim);

  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2(9, 9);
  const pointerTarget = new THREE.Vector2(0, 0);
  const pointerLook = new THREE.Vector2(0, 0);
  const pointerLookTarget = new THREE.Vector2(0, 0);
  const localImpact = new THREE.Vector3();
  const tempImpact = new THREE.Vector3();
  const tempVertex = new THREE.Vector3();
  const tempDirection = new THREE.Vector3();

  let pointerInside = false;
  let impactStrength = 0;
  let targetImpactStrength = 0;
  let headMesh = null;
  let geometry = null;
  let basePositions = null;
  let baseNormals = null;
  let vertexColors = null;
  let deformationRadius = 0.5;
  let deformationAmount = 0.18;
  let loaded = false;

  const baseColor = new THREE.Color(0xdcebd5);
  const hotColor = new THREE.Color(0xc8ff4d);
  const coolColor = new THREE.Color(0x65e5d1);
  const mixedColor = new THREE.Color();

  function resizeRenderer() {
    const rect = stage.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (renderer.domElement.width !== Math.round(width * dpr) || renderer.domElement.height !== Math.round(height * dpr)) {
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  }

  function setPointerFromEvent(event) {
    const rect = stage.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    pointerTarget.set(nx, ny);
    pointerLookTarget.set(nx, ny);
    pointerInside = true;
  }

  stage.addEventListener('pointerenter', setPointerFromEvent, { passive: true });
  stage.addEventListener('pointermove', setPointerFromEvent, { passive: true });
  stage.addEventListener('pointerleave', () => {
    pointerInside = false;
    targetImpactStrength = 0;
    pointerLookTarget.set(0, 0);
  });

  const loader = new GLTFLoader();
  loader.load(
    'https://raw.githubusercontent.com/mrdoob/three.js/r180/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb',
    (gltf) => {
      let sourceMesh = null;
      gltf.scene.traverse((child) => {
        if (!sourceMesh && child.isMesh && child.geometry) sourceMesh = child;
      });

      if (!sourceMesh) return;

      geometry = sourceMesh.geometry.clone();
      geometry.deleteAttribute('uv');
      geometry.computeVertexNormals();
      geometry.center();

      const box = new THREE.Box3().setFromBufferAttribute(geometry.getAttribute('position'));
      const size = new THREE.Vector3();
      box.getSize(size);
      const targetHeight = 4.65;
      const scale = targetHeight / Math.max(size.y, 0.001);
      headGroup.scale.setScalar(scale);
      headGroup.position.y = -0.15;
      headGroup.rotation.y = -0.03;

      deformationRadius = size.y * 0.18;
      deformationAmount = size.y * 0.11;

      const position = geometry.getAttribute('position');
      const normal = geometry.getAttribute('normal');
      basePositions = new Float32Array(position.array);
      baseNormals = new Float32Array(normal.array);

      vertexColors = new Float32Array(position.count * 3);
      for (let i = 0; i < position.count; i += 1) {
        const i3 = i * 3;
        vertexColors[i3] = baseColor.r;
        vertexColors[i3 + 1] = baseColor.g;
        vertexColors[i3 + 2] = baseColor.b;
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(vertexColors, 3));

      const shadowMaterial = new THREE.MeshPhongMaterial({
        color: 0x0c130d,
        emissive: 0x061009,
        specular: 0x395a32,
        shininess: 22,
        transparent: true,
        opacity: 0.32,
        side: THREE.DoubleSide,
        depthWrite: true
      });

      const wireMaterial = new THREE.MeshBasicMaterial({
        color: 0x91aa8b,
        vertexColors: true,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
        depthWrite: false
      });

      const pointMaterial = new THREE.PointsMaterial({
        size: 0.03,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.96,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });

      const solid = new THREE.Mesh(geometry, shadowMaterial);
      const wire = new THREE.Mesh(geometry, wireMaterial);
      const points = new THREE.Points(geometry, pointMaterial);

      headMesh = solid;
      headGroup.add(solid, wire, points);
      loaded = true;
    },
    undefined,
    (error) => {
      console.error('Hero head failed to load:', error);
    }
  );

  function updateImpact() {
    pointerNdc.lerp(pointerTarget, 0.24);
    pointerLook.lerp(pointerLookTarget, 0.1);

    if (!loaded || !headMesh || !pointerInside) {
      targetImpactStrength = 0;
      impactStrength += (targetImpactStrength - impactStrength) * 0.13;
      return;
    }

    headGroup.updateMatrixWorld(true);
    raycaster.setFromCamera(pointerNdc, camera);
    const hit = raycaster.intersectObject(headMesh, false)[0];

    if (hit) {
      tempImpact.copy(hit.point);
      headGroup.worldToLocal(tempImpact);
      localImpact.lerp(tempImpact, 0.45);
      targetImpactStrength = 1;
    } else {
      targetImpactStrength = 0;
    }

    impactStrength += (targetImpactStrength - impactStrength) * 0.2;
  }

  function deformGeometry(time) {
    if (!geometry || !basePositions || !baseNormals) return;

    const position = geometry.getAttribute('position');
    const color = geometry.getAttribute('color');
    const arr = position.array;
    const colorArr = color.array;
    const count = position.count;
    const pulse = Math.sin(time * 0.0017) * 0.0045 * motionScale;

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      const ox = basePositions[i3];
      const oy = basePositions[i3 + 1];
      const oz = basePositions[i3 + 2];
      const nx = baseNormals[i3];
      const ny = baseNormals[i3 + 1];
      const nz = baseNormals[i3 + 2];

      let targetX = ox + nx * pulse;
      let targetY = oy + ny * pulse;
      let targetZ = oz + nz * pulse;
      let influence = 0;

      if (impactStrength > 0.002) {
        tempVertex.set(ox, oy, oz);
        const distance = tempVertex.distanceTo(localImpact);

        if (distance < deformationRadius) {
          const falloff = 1 - distance / deformationRadius;
          influence = falloff * falloff * (3 - 2 * falloff) * impactStrength;

          tempDirection.set(ox - localImpact.x, oy - localImpact.y, oz - localImpact.z);
          if (tempDirection.lengthSq() < 0.000001) tempDirection.set(nx, ny, nz);
          tempDirection.normalize();
          tempDirection.x = tempDirection.x * 0.48 + nx * 0.52;
          tempDirection.y = tempDirection.y * 0.48 + ny * 0.52;
          tempDirection.z = tempDirection.z * 0.48 + nz * 0.52;
          tempDirection.normalize();

          const push = deformationAmount * influence;
          targetX += tempDirection.x * push;
          targetY += tempDirection.y * push;
          targetZ += tempDirection.z * push;
        }
      }

      const spring = influence > 0.001 ? 0.38 : 0.1;
      arr[i3] += (targetX - arr[i3]) * spring;
      arr[i3 + 1] += (targetY - arr[i3 + 1]) * spring;
      arr[i3 + 2] += (targetZ - arr[i3 + 2]) * spring;

      if (influence > 0.001) {
        mixedColor.copy(coolColor).lerp(hotColor, Math.min(1, influence * 1.5));
      } else {
        const frontBias = Math.max(0, nz) * 0.18;
        mixedColor.copy(baseColor).lerp(coolColor, frontBias);
      }

      colorArr[i3] += (mixedColor.r - colorArr[i3]) * 0.2;
      colorArr[i3 + 1] += (mixedColor.g - colorArr[i3 + 1]) * 0.2;
      colorArr[i3 + 2] += (mixedColor.b - colorArr[i3 + 2]) * 0.2;
    }

    position.needsUpdate = true;
    color.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.getAttribute('normal').needsUpdate = true;
    geometry.computeBoundingSphere();
  }

  function animate(time = 0) {
    resizeRenderer();
    updateImpact();
    deformGeometry(time);

    // Deliberately obvious continuous motion so the sculpture never reads as a still render.
    headGroup.rotation.y = Math.sin(time * 0.00065) * (0.46 * motionScale) + pointerLook.x * 0.24;
    headGroup.rotation.x = -0.035 + Math.sin(time * 0.00047) * (0.075 * motionScale) - pointerLook.y * 0.11;
    headGroup.rotation.z = Math.sin(time * 0.00031) * (0.035 * motionScale);
    headGroup.position.y = -0.15 + Math.sin(time * 0.0011) * (0.075 * motionScale);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}
