// Every shape is the same N particles placed differently, so the GPU can morph one into the next.
// Coordinates are in "world units": the camera sees about 3.8 units top to bottom.

export type Shape = Float32Array; // x, y, z for each particle

/** Small seeded random generator, so shapes look the same on every visit. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());

export type Portrait = { positions: Shape; colors: Float32Array; count: number };

/**
 * Turns the cut-out photo into points: each visible pixel becomes a particle with its colour.
 * Depth comes from a soft body curve plus brightness, so the portrait has relief when it turns.
 */
export async function portraitFromImage(url: string, keep: number): Promise<Portrait> {
  const img = new Image();
  img.src = url;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);
  const r = rng(7);
  const pos: number[] = [];
  const col: number[] = [];
  const H = 3.0; // world height of the portrait
  const scale = H / height;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] < 140 || r() > keep) continue;
      const R = data[i] / 255;
      const G = data[i + 1] / 255;
      const B = data[i + 2] / 255;
      const lum = 0.299 * R + 0.587 * G + 0.114 * B;
      const wx = (x - width / 2) * scale;
      const wy = (height / 2 - y) * scale;
      const nx = wx / ((width / 2) * scale);
      const body = Math.sqrt(Math.max(0, 1 - nx * nx)) * 0.45;
      // The head sits in the upper half: give it an extra dome.
      const hx = wx / 0.55;
      const hy = (wy - 0.55) / 0.75;
      const head = Math.sqrt(Math.max(0, 1 - hx * hx - hy * hy)) * 0.35;
      pos.push(wx + (r() - 0.5) * scale * 0.6, wy + (r() - 0.5) * scale * 0.6, body + head + lum * 0.12 - 0.3);
      // Lift the darkest tones (black jumper) so they still read on a black page.
      col.push(R * 0.9 + 0.07, G * 0.9 + 0.07, B * 0.9 + 0.08);
    }
  }
  return { positions: new Float32Array(pos), colors: new Float32Array(col), count: pos.length / 3 };
}

/** A small neural network: layers of nodes, and particles flowing along the connections. */
export function network(n: number): Shape {
  const r = rng(11);
  const layers = [5, 9, 12, 9, 4];
  const nodes: [number, number, number][][] = layers.map((count, l) => {
    const x = -2.1 + (4.2 * l) / (layers.length - 1);
    const radius = 0.45 + count * 0.075;
    return Array.from({ length: count }, (_, k) => {
      const a = (k / count) * Math.PI * 2 + l * 0.6;
      return [x, Math.cos(a) * radius, Math.sin(a) * radius];
    });
  });
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    let p: [number, number, number];
    if (r() < 0.38) {
      const layer = nodes[Math.floor(r() * nodes.length)];
      const c = layer[Math.floor(r() * layer.length)];
      const s = 0.055;
      p = [c[0] + gauss(r) * s, c[1] + gauss(r) * s, c[2] + gauss(r) * s];
    } else {
      const l = Math.floor(r() * (nodes.length - 1));
      const a = nodes[l][Math.floor(r() * nodes[l].length)];
      const b = nodes[l + 1][Math.floor(r() * nodes[l + 1].length)];
      const t = r();
      p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + gauss(r) * 0.006, a[2] + (b[2] - a[2]) * t + gauss(r) * 0.006];
    }
    out.set(p, i * 3);
  }
  return out;
}

/** Two strands and their rungs: the "journey" helix. */
export function helix(n: number): Shape {
  const r = rng(23);
  const out = new Float32Array(n * 3);
  const turns = 2.6;
  const rad = 0.75;
  const len = 3.4;
  for (let i = 0; i < n; i++) {
    let x: number, y: number, z: number;
    if (r() < 0.72) {
      const t = r();
      const strand = r() < 0.5 ? 0 : Math.PI;
      const a = t * turns * Math.PI * 2 + strand;
      y = (t - 0.5) * len;
      x = Math.cos(a) * rad + gauss(r) * 0.025;
      z = Math.sin(a) * rad + gauss(r) * 0.025;
    } else {
      const rung = Math.floor(r() * 28);
      const t = (rung + 0.5) / 28;
      const a = t * turns * Math.PI * 2;
      const u = r() * 2 - 1;
      y = (t - 0.5) * len + gauss(r) * 0.008;
      x = Math.cos(a) * rad * u;
      z = Math.sin(a) * rad * u;
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

/** A tilted array of solar panels with their cell grid, and the sun above. */
export function solar(n: number): Shape {
  const r = rng(31);
  const out = new Float32Array(n * 3);
  const cols = 3;
  const rows = 2;
  const pw = 1.25;
  const ph = 0.82;
  const gap = 0.14;
  const tilt = -1.0;
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);
  for (let i = 0; i < n; i++) {
    let x: number, y: number, z: number;
    if (r() < 0.06) {
      // The sun: a bright ball up and to the right.
      const v = [gauss(r), gauss(r), gauss(r)];
      const m = Math.hypot(v[0], v[1], v[2]) || 1;
      const s = 0.32 * Math.cbrt(r());
      x = 1.75 + (v[0] / m) * s;
      y = 1.25 + (v[1] / m) * s;
      z = -0.6 + (v[2] / m) * s;
    } else {
      const c = Math.floor(r() * cols);
      const row = Math.floor(r() * rows);
      // 6 × 4 cells per panel, with thin gaps between cells.
      const cx = Math.floor(r() * 6);
      const cy = Math.floor(r() * 4);
      const u = (cx + 0.08 + r() * 0.84) / 6;
      const v = (cy + 0.08 + r() * 0.84) / 4;
      const px = (c - (cols - 1) / 2) * (pw + gap) + (u - 0.5) * pw;
      const py = (row - (rows - 1) / 2) * (ph + gap) + (v - 0.5) * ph;
      x = px;
      y = py * cosT - 0.35;
      z = py * sinT;
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

/** A 3D price chart: a line, candlesticks and a dotted floor. */
export function chart(n: number): Shape {
  const r = rng(43);
  const steps = 64;
  const line: number[] = [];
  let v = 0;
  for (let i = 0; i < steps; i++) {
    v += gauss(r) * 0.11 + 0.018;
    line.push(v);
  }
  const min = Math.min(...line);
  const max = Math.max(...line);
  const yOf = (k: number) => -0.9 + ((line[k] - min) / (max - min)) * 2.0;
  const xOf = (k: number) => -2.3 + (4.6 * k) / (steps - 1);
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const pick = r();
    let x: number, y: number, z: number;
    if (pick < 0.42) {
      const t = r() * (steps - 1);
      const k = Math.floor(t);
      const f = t - k;
      x = xOf(k) + (xOf(k + 1 < steps ? k + 1 : k) - xOf(k)) * f;
      y = yOf(k) + (yOf(k + 1 < steps ? k + 1 : k) - yOf(k)) * f + gauss(r) * 0.012;
      z = gauss(r) * 0.012;
    } else if (pick < 0.75) {
      const k = Math.floor(r() * steps);
      const hi = yOf(k) + 0.08 + r() * 0.05;
      const lo = yOf(k) - 0.18 - r() * 0.12;
      x = xOf(k) + (r() - 0.5) * 0.035;
      y = lo + r() * (hi - lo);
      z = (r() - 0.5) * 0.035 - 0.25;
    } else {
      // Floor grid: dots on lines every 0.3 units.
      const along = r() < 0.5;
      const a = -2.4 + r() * 4.8;
      const b = Math.round((-1.2 + r() * 2.4) / 0.3) * 0.3;
      x = along ? a : b * 1.6;
      z = along ? b : (a / 4.8) * 2.4;
      y = -1.25;
    }
    out.set([x, y, z], i * 3);
  }
  return out;
}

/** A three-armed spiral galaxy. Also where the particles come from on the first load. */
export function galaxy(n: number): Shape {
  const r = rng(59);
  const out = new Float32Array(n * 3);
  const arms = 3;
  for (let i = 0; i < n; i++) {
    const rad = Math.pow(r(), 1.6) * 2.7;
    const arm = Math.floor(r() * arms);
    const a = rad * 2.1 + (arm * Math.PI * 2) / arms + (gauss(r) * 0.3) / (rad + 0.35);
    const x = Math.cos(a) * rad + gauss(r) * 0.04;
    const z = Math.sin(a) * rad + gauss(r) * 0.04;
    const y = gauss(r) * 0.11 * (1.1 - rad / 2.7);
    // Tip it towards the viewer so the arms show instead of a thin edge.
    const tilt = 1.05;
    out.set([x, y * Math.cos(tilt) - z * Math.sin(tilt), y * Math.sin(tilt) + z * Math.cos(tilt)], i * 3);
  }
  return out;
}
