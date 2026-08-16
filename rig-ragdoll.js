(() => {
  const canvas = document.querySelector('[data-rig-ragdoll]');
  if (!canvas) return;

  const container = canvas.parentElement;
  const ctx = canvas.getContext('2d');

  const jointDefs = {
    head:  { x: .51, y: .17, r: 11 },
    neck:  { x: .50, y: .27, r: 4 },
    chest: { x: .50, y: .39, r: 5 },
    pelvis:{ x: .50, y: .56, r: 5 },
    lElbow:{ x: .35, y: .39, r: 4 },
    lHand: { x: .24, y: .49, r: 4 },
    rElbow:{ x: .65, y: .37, r: 4 },
    rHand: { x: .76, y: .46, r: 4 },
    lKnee: { x: .42, y: .73, r: 4 },
    lFoot: { x: .36, y: .90, r: 4 },
    rKnee: { x: .59, y: .73, r: 4 },
    rFoot: { x: .65, y: .90, r: 4 }
  };

  const bonePairs = [
    ['head','neck'], ['neck','chest'], ['chest','pelvis'],
    ['chest','lElbow'], ['lElbow','lHand'],
    ['chest','rElbow'], ['rElbow','rHand'],
    ['pelvis','lKnee'], ['lKnee','lFoot'],
    ['pelvis','rKnee'], ['rKnee','rFoot'],
    // A few structural braces keep the ragdoll readable without making it rigid.
    ['lElbow','rElbow'], ['lKnee','rKnee']
  ];

  const joints = {};
  const constraints = [];
  let width = 1;
  let height = 1;
  let floorY = 1;
  let initialized = false;
  let visible = true;
  let lastTime = performance.now();
  let lastDisturbance = -Infinity;
  let recovery = 1;

  const pointer = {
    x: -999,
    y: -999,
    px: -999,
    py: -999,
    vx: 0,
    vy: 0,
    inside: false
  };

  function fitCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    floorY = height - Math.max(20, height * .035);

    const pixelWidth = Math.max(1, Math.round(width * dpr));
    const pixelHeight = Math.max(1, Math.round(height * dpr));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initialized = false;
    } else {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  function targetFor(name, time = 0) {
    const def = jointDefs[name];
    const sway = recovery > .7 ? Math.sin(time * .0012) * width * .006 : 0;
    const upper = ['head','neck','chest','lElbow','lHand','rElbow','rHand'].includes(name);
    const phase = name.startsWith('l') ? -1 : name.startsWith('r') ? 1 : 0;
    return {
      x: def.x * width + sway * (upper ? 1 : .35) + phase * Math.sin(time * .0016) * recovery * 1.6,
      y: def.y * height + Math.sin(time * .0018 + phase) * recovery * (upper ? 1.5 : .6)
    };
  }

  function resetRagdoll() {
    Object.keys(jointDefs).forEach((name) => {
      const target = targetFor(name, 0);
      joints[name] = {
        name,
        x: target.x,
        y: target.y,
        px: target.x,
        py: target.y,
        r: jointDefs[name].r
      };
    });

    constraints.length = 0;
    bonePairs.forEach(([a, b]) => {
      const ja = joints[a];
      const jb = joints[b];
      constraints.push({
        a,
        b,
        length: Math.hypot(jb.x - ja.x, jb.y - ja.y),
        brace: (a === 'lElbow' && b === 'rElbow') || (a === 'lKnee' && b === 'rKnee')
      });
    });

    recovery = 1;
    initialized = true;
  }

  function localPointer(event) {
    const rect = container.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * width,
      y: ((event.clientY - rect.top) / rect.height) * height
    };
  }

  container.addEventListener('pointerenter', (event) => {
    const p = localPointer(event);
    pointer.x = pointer.px = p.x;
    pointer.y = pointer.py = p.y;
    pointer.vx = pointer.vy = 0;
    pointer.inside = true;
  }, { passive: true });

  container.addEventListener('pointermove', (event) => {
    const p = localPointer(event);
    pointer.px = pointer.x;
    pointer.py = pointer.y;
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.vx = Math.max(-38, Math.min(38, pointer.x - pointer.px));
    pointer.vy = Math.max(-38, Math.min(38, pointer.y - pointer.py));
    pointer.inside = true;
  }, { passive: true });

  container.addEventListener('pointerleave', () => {
    pointer.inside = false;
    pointer.vx = pointer.vy = 0;
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { rootMargin: '120px' }).observe(container);
  }

  function disturbWithPointer(now) {
    if (!pointer.inside) return;

    const radius = Math.min(width, height) * .19;
    let touched = false;

    Object.values(joints).forEach((joint) => {
      const dx = joint.x - pointer.x;
      const dy = joint.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance >= radius) return;

      const falloff = 1 - distance / radius;
      const strength = falloff * falloff;
      const safeDistance = Math.max(distance, .001);
      const nx = dx / safeDistance;
      const ny = dy / safeDistance;

      // Stationary cursor repels the body; moving cursor also throws it in the swipe direction.
      const shove = 4.6 * strength;
      const throwX = pointer.vx * .72 * strength;
      const throwY = pointer.vy * .72 * strength;

      joint.x += nx * shove;
      joint.y += ny * shove;
      joint.px -= nx * shove * .75 + throwX;
      joint.py -= ny * shove * .75 + throwY;
      touched = true;
    });

    if (touched) {
      lastDisturbance = now;
      recovery = Math.max(0, recovery - .22);
    }

    pointer.vx *= .72;
    pointer.vy *= .72;
  }

  function integrate(step, now) {
    const idleFor = now - lastDisturbance;
    const targetRecovery = idleFor > 1150 ? Math.min(1, (idleFor - 1150) / 1500) : 0;
    recovery += (targetRecovery - recovery) * .055;

    const gravity = .48 * (1 - recovery * .82) * step * step;
    const damping = .989;

    Object.entries(joints).forEach(([name, joint]) => {
      let vx = (joint.x - joint.px) * damping;
      let vy = (joint.y - joint.py) * damping;

      joint.px = joint.x;
      joint.py = joint.y;
      joint.x += vx;
      joint.y += vy + gravity;

      if (recovery > .001) {
        const target = targetFor(name, now);
        const muscle = .012 + recovery * .034;
        joint.x += (target.x - joint.x) * muscle * step;
        joint.y += (target.y - joint.y) * muscle * step;
      }
    });
  }

  function solveConstraints() {
    for (let iteration = 0; iteration < 8; iteration += 1) {
      constraints.forEach((constraint) => {
        const a = joints[constraint.a];
        const b = joints[constraint.b];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.max(.001, Math.hypot(dx, dy));
        const stiffness = constraint.brace ? .17 : .52;
        const correction = ((dist - constraint.length) / dist) * .5 * stiffness;
        const cx = dx * correction;
        const cy = dy * correction;
        a.x += cx;
        a.y += cy;
        b.x -= cx;
        b.y -= cy;
      });

      Object.values(joints).forEach((joint) => {
        const margin = Math.max(8, joint.r + 2);
        if (joint.x < margin) {
          joint.x = margin;
          joint.px = joint.x + (joint.x - joint.px) * .24;
        } else if (joint.x > width - margin) {
          joint.x = width - margin;
          joint.px = joint.x + (joint.x - joint.px) * .24;
        }

        if (joint.y < margin) {
          joint.y = margin;
          joint.py = joint.y + (joint.y - joint.py) * .18;
        }

        if (joint.y > floorY - joint.r) {
          joint.y = floorY - joint.r;
          const vx = joint.x - joint.px;
          const vy = joint.y - joint.py;
          joint.px = joint.x - vx * .72;
          joint.py = joint.y + vy * .18;
        }
      });
    }
  }

  function drawBone(aName, bName, alpha = 1) {
    const a = joints[aName];
    const b = joints[bName];
    const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
    grad.addColorStop(0, `rgba(101,229,209,${.30 * alpha})`);
    grad.addColorStop(1, `rgba(200,255,77,${.88 * alpha})`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.15;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  function draw(now) {
    ctx.clearRect(0, 0, width, height);

    // Floor / collision boundary.
    const floorGrad = ctx.createLinearGradient(0, floorY, width, floorY);
    floorGrad.addColorStop(0, 'rgba(101,229,209,0)');
    floorGrad.addColorStop(.5, 'rgba(101,229,209,.22)');
    floorGrad.addColorStop(1, 'rgba(101,229,209,0)');
    ctx.strokeStyle = floorGrad;
    ctx.lineWidth = .8;
    ctx.beginPath();
    ctx.moveTo(width * .08, floorY + .5);
    ctx.lineTo(width * .92, floorY + .5);
    ctx.stroke();

    bonePairs.slice(0, 11).forEach(([a, b]) => drawBone(a, b));

    // Gentle control rings around a few joints preserve the original rig-study language.
    ['head','chest','pelvis','lHand','rHand'].forEach((name, index) => {
      const joint = joints[name];
      ctx.strokeStyle = `rgba(101,229,209,${.08 + (index % 2) * .03})`;
      ctx.lineWidth = .7;
      ctx.beginPath();
      ctx.arc(joint.x, joint.y, 13 + Math.sin(now * .002 + index) * 2, 0, Math.PI * 2);
      ctx.stroke();
    });

    Object.values(joints).forEach((joint) => {
      ctx.beginPath();
      ctx.arc(joint.x, joint.y, joint.r, 0, Math.PI * 2);
      ctx.fillStyle = joint.name === 'head' ? 'rgba(200,255,77,.15)' : '#c8ff4d';
      ctx.fill();

      if (joint.name === 'head') {
        ctx.strokeStyle = 'rgba(200,255,77,.78)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    if (pointer.inside) {
      const radius = Math.min(width, height) * .19;
      const halo = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);
      halo.addColorStop(0, 'rgba(200,255,77,.095)');
      halo.addColorStop(.4, 'rgba(101,229,209,.035)');
      halo.addColorStop(1, 'rgba(101,229,209,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(pointer.x - radius, pointer.y - radius, radius * 2, radius * 2);

      ctx.strokeStyle = 'rgba(200,255,77,.24)';
      ctx.lineWidth = .7;
      ctx.beginPath();
      ctx.arc(pointer.x, pointer.y, 15, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function frame(now) {
    fitCanvas();
    if (!initialized) resetRagdoll();

    const delta = Math.min(34, Math.max(8, now - lastTime));
    lastTime = now;
    const step = delta / 16.6667;

    if (visible && !document.hidden) {
      disturbWithPointer(now);
      integrate(step, now);
      solveConstraints();
      draw(now);
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
