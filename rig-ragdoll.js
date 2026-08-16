(() => {
  const canvas = document.querySelector('[data-rig-ragdoll]');
  if (!canvas) return;

  const container = canvas.parentElement;
  const ctx = canvas.getContext('2d');

  // A slightly fuller armature gives the ragdoll shoulders and hips to articulate from,
  // rather than making every limb hinge directly from one central point.
  const standPose = {
    head:      { x: .50, y: .16, r: 11 },
    neck:      { x: .50, y: .25, r: 4 },
    chest:     { x: .50, y: .36, r: 5 },
    lShoulder: { x: .42, y: .37, r: 4 },
    rShoulder: { x: .58, y: .37, r: 4 },
    lElbow:    { x: .33, y: .47, r: 4 },
    rElbow:    { x: .67, y: .47, r: 4 },
    lHand:     { x: .26, y: .58, r: 4 },
    rHand:     { x: .74, y: .58, r: 4 },
    pelvis:    { x: .50, y: .56, r: 5 },
    lHip:      { x: .46, y: .59, r: 4 },
    rHip:      { x: .54, y: .59, r: 4 },
    lKnee:     { x: .43, y: .75, r: 4 },
    rKnee:     { x: .57, y: .75, r: 4 },
    lFoot:     { x: .39, y: .91, r: 4 },
    rFoot:     { x: .61, y: .91, r: 4 }
  };

  const bonePairs = [
    ['head', 'neck'], ['neck', 'chest'], ['chest', 'pelvis'],
    ['chest', 'lShoulder'], ['lShoulder', 'lElbow'], ['lElbow', 'lHand'],
    ['chest', 'rShoulder'], ['rShoulder', 'rElbow'], ['rElbow', 'rHand'],
    ['pelvis', 'lHip'], ['lHip', 'lKnee'], ['lKnee', 'lFoot'],
    ['pelvis', 'rHip'], ['rHip', 'rKnee'], ['rKnee', 'rFoot']
  ];

  // These constraints are not drawn. They simply keep the ribcage and pelvis from
  // folding into impossible shapes while the visible bones remain free to ragdoll.
  const structuralPairs = [
    ['lShoulder', 'rShoulder'],
    ['lHip', 'rHip'],
    ['lShoulder', 'lHip'],
    ['rShoulder', 'rHip'],
    ['lShoulder', 'rHip'],
    ['rShoulder', 'lHip']
  ];

  const getUpPoses = {
    brace: {
      head: [.48, .55], neck: [.49, .61], chest: [.50, .67], pelvis: [.52, .78],
      lShoulder: [.43, .68], rShoulder: [.57, .68], lElbow: [.37, .76], rElbow: [.63, .76],
      lHand: [.35, .88], rHand: [.65, .88], lHip: [.47, .80], rHip: [.57, .80],
      lKnee: [.42, .88], rKnee: [.60, .88], lFoot: [.35, .94], rFoot: [.67, .94]
    },
    kneel: {
      head: [.50, .32], neck: [.50, .40], chest: [.50, .50], pelvis: [.50, .67],
      lShoulder: [.42, .51], rShoulder: [.58, .51], lElbow: [.37, .63], rElbow: [.63, .63],
      lHand: [.39, .76], rHand: [.61, .76], lHip: [.46, .70], rHip: [.54, .70],
      lKnee: [.42, .84], rKnee: [.58, .84], lFoot: [.36, .94], rFoot: [.64, .94]
    }
  };

  const joints = {};
  const constraints = [];
  let width = 1;
  let height = 1;
  let floorY = 1;
  let initialized = false;
  let visible = true;
  let lastTime = performance.now();
  let lastInteraction = -Infinity;
  let mode = 'standing'; // standing | ragdoll | recovery
  let recoveryStart = 0;
  let hoveredJoint = null;
  let grabbedJoint = null;

  const pointer = {
    x: -999,
    y: -999,
    px: -999,
    py: -999,
    vx: 0,
    vy: 0,
    inside: false,
    down: false
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
      initialized = false;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function posePoint(name, pose = standPose) {
    const def = pose[name];
    if (Array.isArray(def)) return { x: def[0] * width, y: def[1] * height };
    return { x: def.x * width, y: def.y * height };
  }

  function resetRagdoll() {
    Object.keys(standPose).forEach((name) => {
      const target = posePoint(name);
      joints[name] = {
        name,
        x: target.x,
        y: target.y,
        px: target.x,
        py: target.y,
        r: standPose[name].r
      };
    });

    constraints.length = 0;
    [...bonePairs.map((pair) => [...pair, false]), ...structuralPairs.map((pair) => [...pair, true])]
      .forEach(([a, b, structural]) => {
        const ja = joints[a];
        const jb = joints[b];
        constraints.push({
          a,
          b,
          structural,
          length: Math.hypot(jb.x - ja.x, jb.y - ja.y)
        });
      });

    mode = 'standing';
    grabbedJoint = null;
    hoveredJoint = null;
    initialized = true;
  }

  function localPointer(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * width,
      y: ((event.clientY - rect.top) / rect.height) * height
    };
  }

  function nearestJoint(x, y, maxDistance = 20) {
    let best = null;
    let bestDistance = maxDistance;
    Object.values(joints).forEach((joint) => {
      const distance = Math.hypot(joint.x - x, joint.y - y);
      if (distance < bestDistance) {
        best = joint;
        bestDistance = distance;
      }
    });
    return best;
  }

  canvas.addEventListener('pointerenter', (event) => {
    const p = localPointer(event);
    pointer.x = pointer.px = p.x;
    pointer.y = pointer.py = p.y;
    pointer.vx = pointer.vy = 0;
    pointer.inside = true;
    hoveredJoint = initialized ? nearestJoint(p.x, p.y, 22) : null;
    canvas.style.cursor = hoveredJoint ? 'grab' : 'default';
  }, { passive: true });

  canvas.addEventListener('pointermove', (event) => {
    const p = localPointer(event);
    pointer.px = pointer.x;
    pointer.py = pointer.y;
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.vx = Math.max(-55, Math.min(55, pointer.x - pointer.px));
    pointer.vy = Math.max(-55, Math.min(55, pointer.y - pointer.py));
    pointer.inside = true;

    if (grabbedJoint) {
      event.stopPropagation();
      hoveredJoint = grabbedJoint;
      canvas.style.cursor = 'grabbing';
    } else {
      hoveredJoint = nearestJoint(pointer.x, pointer.y, 22);
      canvas.style.cursor = hoveredJoint ? 'grab' : 'default';
    }
  }, { passive: true });

  canvas.addEventListener('pointerdown', (event) => {
    const p = localPointer(event);
    pointer.x = pointer.px = p.x;
    pointer.y = pointer.py = p.y;
    pointer.vx = pointer.vy = 0;
    pointer.down = true;
    pointer.inside = true;

    const hit = nearestJoint(p.x, p.y, 24);
    if (!hit) return;

    event.preventDefault();
    event.stopPropagation();
    grabbedJoint = hit;
    hoveredJoint = hit;
    mode = 'ragdoll';
    lastInteraction = performance.now();
    canvas.style.cursor = 'grabbing';
    try { canvas.setPointerCapture(event.pointerId); } catch (_) {}
  });

  function releaseJoint(event) {
    if (!grabbedJoint) return;

    // Preserve the final drag velocity so releasing a fast swipe genuinely throws the body.
    grabbedJoint.px = grabbedJoint.x - pointer.vx * .95;
    grabbedJoint.py = grabbedJoint.y - pointer.vy * .95;
    lastInteraction = performance.now();
    mode = 'ragdoll';
    grabbedJoint = null;
    pointer.down = false;

    try {
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    } catch (_) {}

    hoveredJoint = pointer.inside ? nearestJoint(pointer.x, pointer.y, 22) : null;
    canvas.style.cursor = hoveredJoint ? 'grab' : 'default';
  }

  canvas.addEventListener('pointerup', releaseJoint);
  canvas.addEventListener('pointercancel', releaseJoint);

  canvas.addEventListener('pointerleave', () => {
    pointer.inside = false;
    hoveredJoint = null;
    if (!grabbedJoint) canvas.style.cursor = 'default';
    // Deliberately do not reset or recover here. The body keeps whatever physical
    // state it had when the pointer left the card.
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { rootMargin: '120px' }).observe(container);
  }

  function blendPose(a, b, t, name) {
    const pa = posePoint(name, a);
    const pb = posePoint(name, b);
    const eased = t * t * (3 - 2 * t);
    return {
      x: pa.x + (pb.x - pa.x) * eased,
      y: pa.y + (pb.y - pa.y) * eased
    };
  }

  function recoveryTarget(name, progress) {
    if (progress < .34) {
      return blendPose(getUpPoses.brace, getUpPoses.kneel, progress / .34, name);
    }
    if (progress < .72) {
      return blendPose(getUpPoses.kneel, standPose, (progress - .34) / .38, name);
    }
    return posePoint(name, standPose);
  }

  function integrate(step, now) {
    if (mode === 'ragdoll' && !grabbedJoint && now - lastInteraction > 1700) {
      mode = 'recovery';
      recoveryStart = now;
    }

    const recoveryProgress = mode === 'recovery'
      ? Math.min(1, (now - recoveryStart) / 3000)
      : (mode === 'standing' ? 1 : 0);

    if (mode === 'recovery' && recoveryProgress >= 1) mode = 'standing';

    const gravityScale = mode === 'standing' ? .06 : mode === 'recovery' ? (1 - recoveryProgress) * .24 : 1;
    const gravity = .50 * gravityScale * step * step;
    const damping = mode === 'standing' ? .82 : .986;

    Object.entries(joints).forEach(([name, joint]) => {
      if (joint === grabbedJoint) {
        joint.x = pointer.x;
        joint.y = pointer.y;
        joint.px = pointer.x - pointer.vx * .45;
        joint.py = pointer.y - pointer.vy * .45;
        return;
      }

      const vx = (joint.x - joint.px) * damping;
      const vy = (joint.y - joint.py) * damping;
      joint.px = joint.x;
      joint.py = joint.y;
      joint.x += vx;
      joint.y += vy + gravity;

      if (mode === 'standing') {
        const target = posePoint(name, standPose);
        const sway = Math.sin(now * .00125) * width * .0035;
        const upper = ['head','neck','chest','lShoulder','rShoulder','lElbow','rElbow','lHand','rHand'].includes(name);
        target.x += sway * (upper ? 1 : .35);
        joint.x += (target.x - joint.x) * .08 * step;
        joint.y += (target.y - joint.y) * .08 * step;
      } else if (mode === 'recovery') {
        const target = recoveryTarget(name, recoveryProgress);
        // Start gently, then let the armature visibly take its own weight as it kneels and stands.
        const muscle = .018 + recoveryProgress * .075;
        joint.x += (target.x - joint.x) * muscle * step;
        joint.y += (target.y - joint.y) * muscle * step;
      }
    });
  }

  function constrainDistance(constraint) {
    const a = joints[constraint.a];
    const b = joints[constraint.b];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.max(.001, Math.hypot(dx, dy));
    const stiffness = constraint.structural ? .22 : .62;
    const correction = ((dist - constraint.length) / dist) * .5 * stiffness;
    const cx = dx * correction;
    const cy = dy * correction;

    if (a !== grabbedJoint) { a.x += cx; a.y += cy; }
    if (b !== grabbedJoint) { b.x -= cx; b.y -= cy; }
  }

  function signedAngle(ax, ay, bx, by) {
    return Math.atan2(ax * by - ay * bx, ax * bx + ay * by);
  }

  function enforceHinge(parentName, hingeName, childName, minDeg, maxDeg) {
    const parent = joints[parentName];
    const hinge = joints[hingeName];
    const child = joints[childName];
    if (!parent || !hinge || !child || child === grabbedJoint) return;

    const pax = parent.x - hinge.x;
    const pay = parent.y - hinge.y;
    const cbx = child.x - hinge.x;
    const cby = child.y - hinge.y;
    const parentLen = Math.max(.001, Math.hypot(pax, pay));
    const childLen = Math.max(.001, Math.hypot(cbx, cby));
    const dot = Math.max(-1, Math.min(1, (pax * cbx + pay * cby) / (parentLen * childLen)));
    let angle = Math.acos(dot);
    const min = minDeg * Math.PI / 180;
    const max = maxDeg * Math.PI / 180;

    if (angle >= min && angle <= max) return;
    const targetAngle = Math.max(min, Math.min(max, angle));
    const baseAngle = Math.atan2(pay, pax);
    const sign = signedAngle(pax, pay, cbx, cby) >= 0 ? 1 : -1;
    const desired = baseAngle + sign * targetAngle;
    const tx = hinge.x + Math.cos(desired) * childLen;
    const ty = hinge.y + Math.sin(desired) * childLen;
    child.x += (tx - child.x) * .48;
    child.y += (ty - child.y) * .48;
  }

  function keepTorsoSensible() {
    // Human-like hinge ranges: elbows and knees can fold, but cannot invert through themselves.
    enforceHinge('lShoulder', 'lElbow', 'lHand', 22, 172);
    enforceHinge('rShoulder', 'rElbow', 'rHand', 22, 172);
    enforceHinge('lHip', 'lKnee', 'lFoot', 18, 174);
    enforceHinge('rHip', 'rKnee', 'rFoot', 18, 174);
    enforceHinge('head', 'neck', 'chest', 135, 180);
  }

  function collideWithBounds(joint) {
    const margin = Math.max(8, joint.r + 2);

    if (joint.x < margin) {
      joint.x = margin;
      joint.px = joint.x + (joint.x - joint.px) * .28;
    } else if (joint.x > width - margin) {
      joint.x = width - margin;
      joint.px = joint.x + (joint.x - joint.px) * .28;
    }

    if (joint.y < margin) {
      joint.y = margin;
      joint.py = joint.y + (joint.y - joint.py) * .22;
    }

    if (joint.y > floorY - joint.r) {
      joint.y = floorY - joint.r;
      const vx = joint.x - joint.px;
      const vy = joint.y - joint.py;
      joint.px = joint.x - vx * .70;
      joint.py = joint.y + vy * .14;
    }
  }

  function solveConstraints() {
    for (let iteration = 0; iteration < 10; iteration += 1) {
      constraints.forEach(constrainDistance);
      keepTorsoSensible();
      Object.values(joints).forEach(collideWithBounds);

      if (grabbedJoint) {
        grabbedJoint.x = pointer.x;
        grabbedJoint.y = pointer.y;
      }
    }
  }

  function drawOctaBone(aName, bName, alpha = 1) {
    const a = joints[aName];
    const b = joints[bName];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const nx = -dy / len;
    const ny = dx / len;
    const ux = dx / len;
    const uy = dy / len;
    const widthBase = Math.max(4.2, Math.min(10, len * .12));

    const p1 = { x: a.x, y: a.y };
    const p2 = { x: a.x + dx * .38 + nx * widthBase, y: a.y + dy * .38 + ny * widthBase };
    const p3 = { x: a.x + dx * .58 + nx * widthBase * .46, y: a.y + dy * .58 + ny * widthBase * .46 };
    const p4 = { x: b.x, y: b.y };
    const p5 = { x: a.x + dx * .58 - nx * widthBase * .46, y: a.y + dy * .58 - ny * widthBase * .46 };
    const p6 = { x: a.x + dx * .38 - nx * widthBase, y: a.y + dy * .38 - ny * widthBase };
    const ridge = { x: a.x + dx * .42 - nx * widthBase * .12, y: a.y + dy * .42 - ny * widthBase * .12 };

    // Dark under-facet gives the flat canvas bone a clear pseudo-3D silhouette.
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.lineTo(p5.x, p5.y);
    ctx.lineTo(p6.x, p6.y);
    ctx.closePath();
    ctx.fillStyle = `rgba(78,112,45,${.44 * alpha})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(200,255,77,${.92 * alpha})`;
    ctx.lineWidth = 1.05;
    ctx.stroke();

    // Lit facet.
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.lineTo(ridge.x, ridge.y);
    ctx.closePath();
    ctx.fillStyle = `rgba(200,255,77,${.24 * alpha})`;
    ctx.fill();

    // Cyan ridge/edge sells the same technical 3D language used elsewhere on the site.
    ctx.strokeStyle = `rgba(101,229,209,${.48 * alpha})`;
    ctx.lineWidth = .75;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(ridge.x, ridge.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.stroke();

    // Blender-like head and tail points.
    [a, b].forEach((joint, index) => {
      ctx.beginPath();
      ctx.arc(joint.x, joint.y, index === 0 ? 2.4 : 2.1, 0, Math.PI * 2);
      ctx.fillStyle = '#c8ff4d';
      ctx.fill();
      ctx.strokeStyle = 'rgba(7,12,8,.9)';
      ctx.lineWidth = .75;
      ctx.stroke();
    });
  }

  function drawJoint(joint) {
    const active = joint === grabbedJoint;
    const hover = joint === hoveredJoint;
    const radius = joint.name === 'head' ? 7.5 : (active ? 6.5 : hover ? 5.8 : 4.2);

    if (hover || active) {
      ctx.beginPath();
      ctx.arc(joint.x, joint.y, radius + 7, 0, Math.PI * 2);
      ctx.strokeStyle = active ? 'rgba(200,255,77,.72)' : 'rgba(101,229,209,.42)';
      ctx.lineWidth = .8;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(joint.x, joint.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = active ? '#f1f3e9' : '#c8ff4d';
    ctx.fill();
    ctx.strokeStyle = active ? '#c8ff4d' : 'rgba(7,12,8,.85)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function draw(now) {
    ctx.clearRect(0, 0, width, height);

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

    bonePairs.forEach(([a, b]) => drawOctaBone(a, b));

    Object.values(joints).forEach(drawJoint);

    // Very restrained joint-guide rings: enough to suggest a rigging viewport without
    // competing with the new octahedral bones.
    ['head', 'chest', 'pelvis'].forEach((name, index) => {
      const joint = joints[name];
      ctx.strokeStyle = `rgba(101,229,209,${.08 + index * .025})`;
      ctx.lineWidth = .65;
      ctx.beginPath();
      ctx.arc(joint.x, joint.y, 13 + Math.sin(now * .002 + index) * 1.5, 0, Math.PI * 2);
      ctx.stroke();
    });

    if (grabbedJoint) {
      ctx.strokeStyle = 'rgba(200,255,77,.28)';
      ctx.setLineDash([3, 5]);
      ctx.lineWidth = .7;
      ctx.beginPath();
      ctx.moveTo(grabbedJoint.x, grabbedJoint.y);
      ctx.lineTo(pointer.x, pointer.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  function frame(now) {
    fitCanvas();
    if (!initialized) resetRagdoll();

    const delta = Math.min(34, Math.max(8, now - lastTime));
    lastTime = now;
    const step = delta / 16.6667;

    if (visible && !document.hidden) {
      integrate(step, now);
      solveConstraints();
      draw(now);
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();