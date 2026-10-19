import * as THREE from "three";
import { chart, galaxy, helix, network, portraitFromImage, solar } from "./shapes";
export { STAGES } from "./stages";


// Where each shape sits for each section (desktop): beside the text, not under it.
const LAYOUT = {
  x: [0, 1.6, -1.6, 1.75, 0, 0, 0],
  y: [0.42, 0, 0, 0.1, 0.1, 0, 0.5],
  scale: [0.82, 0.8, 0.85, 0.55, 0.82, 0.95, 0.72],
  // Phones: one centred column, so wide shapes shrink to fit the width.
  mobileScale: [0.6, 0.4, 0.5, 0.7, 0.38, 0.42, 0.56],
  // How much each shape slowly turns on its own (0 = faces you).
  spin: [0, 1, 1, 0.25, 0.15, 1, 0],
};

// The photo sits at the average depth of the particle portrait (face forward, shoulders back).
const PHOTO_DEPTH = 0.18;

/** How much of the real photo shows: after the intro on the first page, and on the last page. */
function photoAmount(stage: number, intro: number) {
  const ease = (x: number) => {
    const t = Math.min(1, Math.max(0, x));
    return t * t * (3 - 2 * t);
  };
  return ease((intro - 0.8) / 0.2) * Math.max(1 - ease(stage / 0.35), ease((stage - 5.65) / 0.35));
}

const vertexShader = /* glsl */ `
  uniform float uStage;
  uniform float uIntro;
  uniform float uTime;
  uniform float uSize;
  uniform float uPR;
  uniform float uMotion;
  uniform float uMouseOn;
  uniform float uPhoto;
  uniform vec3 uMouse;
  attribute vec3 aP1;
  attribute vec3 aP2;
  attribute vec3 aP3;
  attribute vec3 aP4;
  attribute vec3 aP5;
  attribute vec3 aColor;
  attribute vec4 aRand;
  varying vec3 vColor;
  varying float vAlpha;

  // Each particle starts its move a little later than others: the shape "flows" instead of snapping.
  float ease(float x, float d) { return smoothstep(d * 0.45, d * 0.45 + 0.55, clamp(x, 0.0, 1.0)); }

  vec3 palette(float t) {
    vec3 a = vec3(1.0, 0.45, 0.2);   // ember
    vec3 b = vec3(1.0, 0.28, 0.55);  // magenta
    vec3 c = vec3(0.6, 0.47, 1.0);   // violet
    return t < 0.5 ? mix(a, b, t * 2.0) : mix(b, c, (t - 0.5) * 2.0);
  }

  void main() {
    float d = aRand.x;
    vec3 portrait = position;
    vec3 p = mix(aP5, portrait, ease(uIntro, d)); // first load: galaxy -> you
    p = mix(p, aP1, ease(uStage, d));
    p = mix(p, aP2, ease(uStage - 1.0, d));
    p = mix(p, aP3, ease(uStage - 2.0, d));
    p = mix(p, aP4, ease(uStage - 3.0, d));
    p = mix(p, aP5, ease(uStage - 4.0, d));
    p = mix(p, portrait, ease(uStage - 5.0, d));

    // Swirl while travelling between shapes.
    float travel = max(sin(3.14159 * clamp(fract(uStage), 0.0, 1.0)), sin(3.14159 * uIntro));
    float ph = aRand.z * 6.2831;
    p += vec3(sin(uTime * 1.3 + ph + p.y * 3.0), cos(uTime * 1.1 + ph + p.x * 3.0), sin(uTime * 0.9 + ph + p.z * 3.0))
         * 0.22 * travel * (0.4 + aRand.y) * uMotion;
    // A faint shimmer at rest.
    p.y += sin(uTime * 2.0 + aRand.z * 40.0) * 0.004 * uMotion;

    // Particles move out of the cursor's way.
    vec2 dm = p.xy - uMouse.xy;
    float dist = length(dm);
    p.xy += normalize(dm + 1e-5) * uMouseOn * 0.32 * exp(-dist * dist * 7.0);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float isYou = max(1.0 - clamp(uStage, 0.0, 1.0), clamp(uStage - 5.0, 0.0, 1.0)) * uIntro;
    // Even dots for the portrait (detail), varied dots for the other shapes (sparkle).
    gl_PointSize = uSize * mix(0.55 + aRand.y * 0.9, 0.85 + aRand.y * 0.3, isYou) * uPR / -mv.z;
    vec3 pal = palette(fract(aRand.w + p.y * 0.12 + 0.5)) * (0.75 + aRand.y * 0.5);
    vColor = mix(pal, aColor, isYou);
    // While the real photo is on screen, the particle portrait fades to a faint sparkle around it.
    vAlpha = mix(0.85, 1.0 - uPhoto * 0.92, isYou);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vColor, smoothstep(0.5, 0.15, d) * vAlpha);
  }
`;

export type SceneInfo = { count: number };
/** Where the portrait is on screen (CSS pixels) and how much the real photo should show (0–1). */
export type PortraitFrame = { left: number; top: number; width: number; height: number; photo: number };

export function createScene(
  host: HTMLElement,
  opts: {
    getStage: () => number;
    onReady: (info: SceneInfo) => void;
    onFrame: (frame: PortraitFrame) => void;
    photo: string;
  },
) {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = matchMedia("(max-width: 900px)").matches;

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  host.appendChild(renderer.domElement);
  Object.assign(renderer.domElement.style, { width: "100%", height: "100%", display: "block" });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.set(0, 0, 6);
  const group = new THREE.Group();
  scene.add(group);

  const uniforms = {
    uStage: { value: 0 },
    uIntro: { value: reduceMotion ? 1 : 0 },
    uTime: { value: 0 },
    uSize: { value: small ? 20 : 17 },
    uPR: { value: renderer.getPixelRatio() },
    uMotion: { value: reduceMotion ? 0 : 1 },
    uMouseOn: { value: 0 },
    uPhoto: { value: 0 },
    uMouse: { value: new THREE.Vector3(99, 99, 0) },
  };

  let points: THREE.Points | null = null;
  // The portrait's half-size in world units (set once the photo is read), for placing the real photo.
  const half = { w: 0, h: 0 };
  let disposed = false;
  portraitFromImage(opts.photo, small ? 0.5 : 0.85).then(({ positions, colors, count, halfWidth, halfHeight }) => {
    if (disposed) return;
    half.w = halfWidth;
    half.h = halfHeight;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("aP1", new THREE.BufferAttribute(network(count), 3));
    geo.setAttribute("aP2", new THREE.BufferAttribute(helix(count), 3));
    geo.setAttribute("aP3", new THREE.BufferAttribute(solar(count), 3));
    geo.setAttribute("aP4", new THREE.BufferAttribute(chart(count), 3));
    geo.setAttribute("aP5", new THREE.BufferAttribute(galaxy(count), 3));
    const rand = new Float32Array(count * 4);
    for (let i = 0; i < rand.length; i++) rand[i] = Math.random();
    geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 4));
    const mat = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false });
    points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    group.add(points);
    opts.onReady({ count });
    if (!reduceMotion) {
      const start = performance.now();
      const intro = () => {
        const t = Math.min(1, (performance.now() - start) / 3200);
        uniforms.uIntro.value = 1 - Math.pow(1 - t, 3);
        if (t < 1 && !disposed) requestAnimationFrame(intro);
      };
      intro();
    }
  });

  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  // Pointer: leaning, dragging, and the "push" on particles.
  const ndc = new THREE.Vector2(0, 0);
  let lastMove = -1e9;
  let dragging = false;
  let dragX = 0;
  let spinVel = 0;
  const onMove = (e: PointerEvent) => {
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    lastMove = performance.now();
    if (dragging) {
      spinVel = (e.clientX - dragX) * 0.008;
      spin += spinVel;
      dragX = e.clientX;
    }
  };
  const onDown = (e: PointerEvent) => {
    // Only when the press lands on the scene itself, not on text or buttons.
    if ((e.target as HTMLElement).closest("a, button, [data-ui]")) return;
    dragging = true;
    dragX = e.clientX;
  };
  const onUp = () => (dragging = false);
  addEventListener("pointermove", onMove, { passive: true });
  addEventListener("pointerdown", onDown);
  addEventListener("pointerup", onUp);
  addEventListener("pointercancel", onUp);

  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  const lerpArr = (arr: number[], s: number) => {
    const i = Math.min(arr.length - 2, Math.floor(s));
    const t = s - i;
    const k = t * t * (3 - 2 * t);
    return arr[i] + (arr[i + 1] - arr[i]) * k;
  };

  let spin = 0;
  let stage = 0;
  let raf = 0;
  let last = performance.now();
  let visible = !document.hidden;
  const onVis = () => (visible = !document.hidden);
  document.addEventListener("visibilitychange", onVis);

  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (!visible) return;
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    uniforms.uTime.value += dt;

    // Follow the scroll smoothly.
    stage += (opts.getStage() - stage) * (reduceMotion ? 1 : Math.min(1, dt * 6));
    uniforms.uStage.value = stage;

    // Placement for this point of the story.
    const sx = small ? 0 : lerpArr(LAYOUT.x, stage);
    const sy = small ? (stage < 0.5 || stage > 5.5 ? 0.62 : 0.85) : lerpArr(LAYOUT.y, stage);
    const sc = small ? lerpArr(LAYOUT.mobileScale, stage) : lerpArr(LAYOUT.scale, stage);
    group.position.x += (sx - group.position.x) * 0.08;
    group.position.y += (sy - group.position.y) * 0.08;
    group.scale.setScalar(group.scale.x + (sc - group.scale.x) * 0.08);

    // Spin where the shape likes to turn; face the viewer when it is the portrait.
    const spinW = lerpArr(LAYOUT.spin, stage);
    if (!dragging) {
      spinVel *= 0.94;
      spin += spinVel + (reduceMotion ? 0 : 0.0035 * spinW);
      if (spinW < 0.5) {
        const home = Math.round(spin / (Math.PI * 2)) * Math.PI * 2;
        spin += (home - spin) * 0.04 * (1 - spinW);
      }
    }
    // The real photo is flat: hold the portrait still while it shows, so they line up.
    const photo = photoAmount(stage, uniforms.uIntro.value);
    uniforms.uPhoto.value = photo;
    const leanY = reduceMotion ? 0 : ndc.x * 0.35 * (1 - photo);
    const leanX = reduceMotion ? 0 : -ndc.y * 0.2 * (1 - photo);
    group.rotation.y += (spin + leanY - group.rotation.y) * 0.08;
    group.rotation.x += (leanX + (stage > 0.5 && stage < 5.5 ? 0.12 : 0) - group.rotation.x) * 0.06;

    // Cursor in the shape's own space, for the push.
    raycaster.setFromCamera(ndc, camera);
    if (raycaster.ray.intersectPlane(plane, hit)) uniforms.uMouse.value.copy(group.worldToLocal(hit.clone()));
    const active = now - lastMove < 1500 && !reduceMotion ? 1 : 0;
    uniforms.uMouseOn.value += (active - uniforms.uMouseOn.value) * 0.08;

    renderer.render(scene, camera);

    // Project the portrait's corners to the screen for the photo overlay.
    if (half.w) {
      group.updateMatrixWorld();
      const a = new THREE.Vector3(-half.w, half.h, PHOTO_DEPTH).applyMatrix4(group.matrixWorld).project(camera);
      const b = new THREE.Vector3(half.w, -half.h, PHOTO_DEPTH).applyMatrix4(group.matrixWorld).project(camera);
      const W = host.clientWidth;
      const H = host.clientHeight;
      const left = ((a.x + 1) / 2) * W;
      const top = ((1 - a.y) / 2) * H;
      opts.onFrame({ left, top, width: ((b.x + 1) / 2) * W - left, height: ((1 - b.y) / 2) * H - top, photo });
    }
  };
  tick();

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    document.removeEventListener("visibilitychange", onVis);
    removeEventListener("pointermove", onMove);
    removeEventListener("pointerdown", onDown);
    removeEventListener("pointerup", onUp);
    removeEventListener("pointercancel", onUp);
    if (points) {
      points.geometry.dispose();
      (points.material as THREE.Material).dispose();
    }
    renderer.dispose();
    renderer.domElement.remove();
  };
}
