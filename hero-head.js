(() => {
  const canvas = document.querySelector('[data-head-canvas]');
  const stage = document.querySelector('[data-sculpture-stage]');
  if (!canvas || !stage) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rows = 32;
  const cols = 42;
  const points = [];
  const edges = [];

  const gaussian = (value, spread) => Math.exp(-(value * value) / spread);

  function headSurface(x, y, front) {
    const frontWeight = Math.max(0, front);
    let depth = front * .82;

    // Human facial planes: brow, sockets, nose, cheeks, lips and chin.
    const nose = gaussian(x, .022) * gaussian(y - .03, .085) * .34;
    const leftEye = gaussian(x + .255, .022) * gaussian(y - .21, .022) * .14;
    const rightEye = gaussian(x - .255, .022) * gaussian(y - .21, .022) * .14;
    const brow = (gaussian(x + .25, .04) + gaussian(x - .25, .04)) * gaussian(y - .33, .018) * .055;
    const cheeks = (gaussian(x + .31, .055) + gaussian(x - .31, .055)) * gaussian(y + .01, .09) * .07;
    const lips = gaussian(x, .075) * gaussian(y + .285, .018) * .06;
    const chin = gaussian(x, .085) * gaussian(y + .70, .055) * .105;
    const philtrum = gaussian(x, .018) * gaussian(y + .19, .025) * .025;

    depth += frontWeight * frontWeight * (nose - leftEye - rightEye + brow + cheeks + lips + chin + philtrum);
    if (front < 0) depth *= 1.08; // fuller cranium at the back
    return depth;
  }

  // Deterministic UV head mesh. It is deliberately not random between page loads.
  for (let r = 0; r < rows; r += 1) {
    const v = (r + .5) / rows;
    const sphereY = Math.cos(v * Math.PI);
    const ringRadius = Math.sin(v * Math.PI);
    const y = sphereY;

    let width = .79 + gaussian(y - .05, .72) * .11;
    if (y > .52) width *= 1 - (y - .52) * .12;
    if (y < -.24) width *= 1 - Math.pow(Math.min(1, (-y - .24) / .76), 1.25) * .43;

    for (let c = 0; c < cols; c += 1) {
      const theta = (c / cols) * Math.PI * 2;
      const rawX = Math.sin(theta) * ringRadius;
      const front = Math.cos(theta) * ringRadius;
      const x = rawX * width;
      let shapedY = y * 1.24;

      // Slightly longer lower face and a compact crown.
      if (y < -.22) shapedY -= Math.pow((-y - .22) / .78, 1.3) * .09;
      if (y > .62) shapedY -= (y - .62) * .05;

      const z = headSurface(x, y, front);
      const seed = ((r * 73 + c * 37) % 211) / 211 * Math.PI * 2;
      points.push({ x, y: shapedY, z, row: r, col: c, seed });
    }
  }

  // Grid connections give the head a sculpted/wireframe read without an O(n²) pass every frame.
  const indexOf = (r, c) => r * cols + ((c + cols) % cols);
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (c % 2 === 0) edges.push([indexOf(r, c), indexOf(r, c + 1)]);
      if (r < rows - 1) edges.push([indexOf(r, c), indexOf(r + 1, c)]);
      if (r < rows - 1 && (r + c) % 4 === 0) edges.push([indexOf(r, c), indexOf(r + 1, c + 1)]);
    }
  }

  // Small feature curves sit just above the face surface so the form reads immediately as a head.
  const features = [];

  function addEye(cx) {
    const curve = [];
    for (let i = 0; i <= 18; i += 1) {
      const a = (i / 18) * Math.PI * 2;
      const x = cx + Math.cos(a) * .115;
      const y = .225 + Math.sin(a) * .052;
      const z = .79 + gaussian(x, .16) * .055;
      curve.push({ x, y, z });
    }
    features.push(curve);
  }

  addEye(-.245);
  addEye(.245);

  const noseBridge = [];
  for (let i = 0; i <= 16; i += 1) {
    const t = i / 16;
    const y = .34 - t * .43;
    const x = Math.sin(t * Math.PI) * .012;
    const z = .84 + Math.pow(t, 1.8) * .23;
    noseBridge.push({ x, y, z });
  }
  features.push(noseBridge);

  const mouth = [];
  for (let i = 0; i <= 22; i += 1) {
    const t = i / 22;
    const x = -.235 + t * .47;
    const y = -.315 + Math.cos((t - .5) * Math.PI * 2) * .012;
    const z = .835 + gaussian(x, .10) * .045;
    mouth.push({ x, y, z });
  }
  features.push(mouth);

  let pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false };
  let visible = true;

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { rootMargin: '160px' }).observe(stage);
  }

  stage.addEventListener('pointermove', (event) => {
    const rect = stage.getBoundingClientRect();
    pointer.tx = ((event.clientX - rect.left) / rect.width - .5) * 2;
    pointer.ty = ((event.clientY - rect.top) / rect.height - .5) * 2;
    pointer.active = true;
  }, { passive: true });

  stage.addEventListener('pointerleave', () => {
    pointer.tx = 0;
    pointer.ty = 0;
    pointer.active = false;
  });

  function fitCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.max(1, Math.round(rect.width * dpr));
    const pixelHeight = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width: rect.width, height: rect.height };
  }

  function rotatePoint(point, yaw, pitch, roll, breath) {
    let x = point.x * breath;
    let y = point.y * breath;
    let z = point.z * breath;

    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const rx = x * cy - z * sy;
    const rz = x * sy + z * cy;
    x = rx;
    z = rz;

    const cx = Math.cos(pitch);
    const sx = Math.sin(pitch);
    const ry = y * cx - z * sx;
    const rz2 = y * sx + z * cx;
    y = ry;
    z = rz2;

    const cz = Math.cos(roll);
    const sz = Math.sin(roll);
    const finalX = x * cz - y * sz;
    const finalY = x * sz + y * cz;

    return { x: finalX, y: finalY, z };
  }

  function project(point, width, height, yaw, pitch, roll, breath, mouseStrength = 1) {
    const rotated = rotatePoint(point, yaw, pitch, roll, breath);
    const perspective = 1 / (2.05 - rotated.z * .30);
    const scale = Math.min(width, height) * .46;
    let x = width * .5 + rotated.x * scale * perspective;
    let y = height * .51 - rotated.y * scale * perspective;

    let influence = 0;
    if (pointer.active && !reduceMotion) {
      const cursorX = width * (.5 + pointer.x * .5);
      const cursorY = height * (.5 + pointer.y * .5);
      const dx = x - cursorX;
      const dy = y - cursorY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const radius = Math.min(width, height) * .19;
      influence = Math.max(0, 1 - distance / radius);
      influence = influence * influence;
      if (distance > .001 && influence > 0) {
        const force = 38 * mouseStrength * influence;
        x += (dx / distance) * force;
        y += (dy / distance) * force;
      }
    }

    return { x, y, z: rotated.z, influence };
  }

  function draw(time = 0) {
    if ((!visible || document.hidden) && !reduceMotion) {
      requestAnimationFrame(draw);
      return;
    }

    const { ctx, width, height } = fitCanvas();
    ctx.clearRect(0, 0, width, height);

    pointer.x += (pointer.tx - pointer.x) * .075;
    pointer.y += (pointer.ty - pointer.y) * .075;

    const t = reduceMotion ? 0 : time;
    const idleYaw = Math.sin(t * .00034) * .30;
    const idlePitch = -.035 + Math.sin(t * .00021) * .045;
    const yaw = idleYaw + pointer.x * .22;
    const pitch = idlePitch - pointer.y * .11;
    const roll = Math.sin(t * .00017) * .025;
    const breath = 1 + Math.sin(t * .00125) * .007;

    const projected = points.map((point) => {
      // Tiny deterministic surface motion keeps the form living without melting the anatomy.
      const micro = reduceMotion ? 1 : 1 + Math.sin(t * .00105 + point.seed) * .0028;
      return project(
        { x: point.x * micro, y: point.y * micro, z: point.z * micro },
        width,
        height,
        yaw,
        pitch,
        roll,
        breath,
        1
      );
    });

    // Mouse field: a soft halo makes the interaction obvious before the viewer notices individual vertices move.
    if (pointer.active && !reduceMotion) {
      const cursorX = width * (.5 + pointer.x * .5);
      const cursorY = height * (.5 + pointer.y * .5);
      const halo = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, Math.min(width, height) * .20);
      halo.addColorStop(0, 'rgba(200,255,77,.09)');
      halo.addColorStop(.45, 'rgba(101,229,209,.035)');
      halo.addColorStop(1, 'rgba(101,229,209,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);
    }

    // Mesh lines.
    ctx.lineWidth = .62;
    for (const [aIndex, bIndex] of edges) {
      const a = projected[aIndex];
      const b = projected[bIndex];
      const depth = Math.max(0, Math.min(1, (a.z + b.z + 1.5) / 3));
      const cursorBoost = Math.max(a.influence, b.influence);
      ctx.strokeStyle = cursorBoost > .05
        ? `rgba(200,255,77,${.12 + cursorBoost * .50})`
        : `rgba(190,231,177,${.025 + depth * .12})`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // Facial feature curves.
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    features.forEach((curve, curveIndex) => {
      const screen = curve.map((point) => project(point, width, height, yaw, pitch, roll, breath, .55));
      ctx.strokeStyle = curveIndex === 2
        ? 'rgba(200,255,77,.72)'
        : 'rgba(228,242,217,.38)';
      ctx.lineWidth = curveIndex === 2 ? 1.05 : .78;
      ctx.beginPath();
      screen.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });

    // Vertices, depth sorted so the face feels volumetric.
    const ordered = projected.map((p, index) => ({ ...p, index })).sort((a, b) => a.z - b.z);
    ordered.forEach((point) => {
      const depth = Math.max(0, Math.min(1, (point.z + 1.4) / 2.8));
      const cursorBoost = point.influence;
      const landmark = point.index % 71 === 0;
      const radius = landmark ? 2.1 : .45 + depth * .9 + cursorBoost * 1.7;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      if (cursorBoost > .04) {
        ctx.fillStyle = `rgba(200,255,77,${.42 + cursorBoost * .5})`;
      } else if (landmark) {
        ctx.fillStyle = 'rgba(101,229,209,.82)';
      } else {
        ctx.fillStyle = `rgba(231,241,224,${.11 + depth * .64})`;
      }
      ctx.fill();
    });

    if (!reduceMotion) requestAnimationFrame(draw);
  }

  draw();
})();
