import * as THREE from "three";
import { CSS2DObject } from "./vendor/CSS2DRenderer.js";
import { DEPT_TAGS } from "./config.js?v=plan1to1";

const PAL = {
  day: {
    clear: 0xf4f0e6,
    hemiSky: 0xfff8ef,
    hemiGround: 0xd9cbb6,
    hemi: 0.92,
    sun: 0xfff3e2,
    sunIntensity: 1.22,
    sunPos: [10, 38, 16],
    ambient: 0.5,
    exposure: 1.04,
    wall: 0xf7f2e8,
    wood: 0xd7b07a,
    woodDark: 0x8d643f,
    frame: 0x3c342c,
    glass: 0xe7eef2,
    olive: 0x6e754c,
    stone: 0xf7f4ee,
    stoneDark: 0xe3dcd0,
    water: 0xf0d08a,
    waterDeep: 0xdf9a48,
    foam: 0xfff8ea,
    ground: 0xf4f0e6,
    plinth: 0xe5dccb,
  },
  night: {
    clear: 0x1a1815,
    hemiSky: 0x8a7d68,
    hemiGround: 0x2a241c,
    hemi: 0.34,
    sun: 0xc4b89a,
    sunIntensity: 0.22,
    sunPos: [8, 24, 12],
    ambient: 0.14,
    exposure: 0.92,
    wall: 0xe4d9c8,
    wood: 0xb08958,
    woodDark: 0x6b4c30,
    frame: 0x2a2622,
    glass: 0xb7d0de,
    olive: 0x4e5438,
    stone: 0xd5cec2,
    stoneDark: 0xb3aa9c,
    water: 0xffe1a2,
    waterDeep: 0xf0b45e,
    foam: 0xfff6dd,
    ground: 0x221e1a,
    plinth: 0x3a342c,
  },
};

// Floor plan matched to the isometric concept: wings flank a gray-tile hall,
// semicircular olive CEO office to the north, fountain plaza in the middle,
// waiting sofa (温馨办公区) to the south. South face is a cutaway.
const B = {
  west: -15.2,
  east: 15.2,
  north: -11.6,
  south: 8.15,
  glassL: -5.85,
  glassR: 5.85,
  wsZ: -6.15,
  confZ: 0.35,
  rTopZ: -5.35,
  loungeZ: 1.05,
  serverX: -9.35,
  serverZ1: -4.5,
  ceoR: 4.6,
  ceoSideZ: -8.0,
  ceoBackZ: -11.6,
  fZ: 1.15,
  fR: 2.55,
  laneW: -5.2,
  laneE: 5.2,
  laneN: -2.15,
  laneS: 4.55,
  wallH: 1.22,
  outH: 2.08,
  ceoH: 2.18,
};

const PORTALS = {
  research: { x: -5.22, z: -8.9, via: [[-7.2, -8.9]] },
  server: { x: -5.22, z: -5.32, via: [[-7.05, -5.32]] },
  conference: { x: -5.22, z: -2.75, via: [[-7.2, -2.75]] },
  admin: { x: -5.22, z: 3.45, via: [[-7.2, 3.45]] },
  content: { x: 5.22, z: -8.5, via: [[7.2, -8.5]] },
  lounge: { x: 5.22, z: -2.1, via: [[7.2, -2.1]] },
  ops: { x: 5.22, z: 4.55, via: [[7.2, 4.55]] },
  ceo: { x: 0, z: -3.02, via: [[-2.35, -9.55], [-2.35, -4.9]] },
};

function makeTexture(draw, w = 512, h = 512) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function woodTexture() {
  return makeTexture((g, w, h) => {
    g.fillStyle = "#e7cfab";
    g.fillRect(0, 0, w, h);
    const rows = 6;
    const plankH = h / rows;
    for (let i = 0; i < rows; i++) {
      const y = i * plankH;
      const n = (i % 3) * 6;
      g.fillStyle = `rgb(${232 - n},${196 - n},${150 - n / 2})`;
      g.fillRect(0, y + 2, w, plankH - 4);
      g.strokeStyle = "rgba(120, 82, 42, 0.18)";
      g.strokeRect(0.5, y + 1, w - 1, plankH - 2);
    }
  });
}

function tileTexture() {
  return makeTexture((g, w, h) => {
    g.fillStyle = "#b7bcc2";
    g.fillRect(0, 0, w, h);
    const size = 128;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const alt = (x + y) % 2 === 0 ? 8 : 0;
        g.fillStyle = `rgb(${196 + alt},${200 + alt},${204 + alt})`;
        g.fillRect(x * size + 3, y * size + 3, size - 6, size - 6);
      }
    }
  });
}

function rugTexture() {
  return makeTexture((g, w, h) => {
    g.fillStyle = "#f3e6d2";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#b85a3c";
    g.lineWidth = 14;
    g.strokeRect(16, 16, w - 32, h - 32);
    g.strokeStyle = "#6e7354";
    g.lineWidth = 4;
    g.strokeRect(34, 34, w - 68, h - 68);
    for (let y = 64; y < h - 48; y += 42) {
      for (let x = 64; x < w - 48; x += 42) {
        g.fillStyle = (x / 42 + y / 42) % 2 === 0 ? "#c46b45" : "#6e7354";
        g.beginPath();
        g.moveTo(x, y - 10);
        g.lineTo(x + 10, y);
        g.lineTo(x, y + 10);
        g.lineTo(x - 10, y);
        g.closePath();
        g.fill();
      }
    }
  }, 256, 256);
}

function artTexture() {
  return makeTexture((g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#d5e4ea");
    sky.addColorStop(0.55, "#f4efe4");
    sky.addColorStop(1, "#e7d7bf");
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#f6edd0";
    g.beginPath();
    g.arc(w * 0.72, h * 0.28, 28, 0, Math.PI * 2);
    g.fill();
    const ridges = [
      ["#8ea090", 0.62, 0.22],
      ["#6d7a62", 0.7, 0.08],
      ["#c3b496", 0.78, -0.12],
    ];
    ridges.forEach(([color, base, shift], i) => {
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(0, h);
      g.lineTo(0, h * base);
      g.lineTo(w * (0.22 + i * 0.08), h * (0.34 + shift));
      g.lineTo(w * (0.48 + i * 0.06), h * (0.58 + shift * 0.3));
      g.lineTo(w * (0.74 + i * 0.04), h * (0.3 + shift));
      g.lineTo(w, h * (base - 0.04));
      g.lineTo(w, h);
      g.closePath();
      g.fill();
    });
  }, 512, 288);
}

function gardenTexture() {
  return makeTexture((g, w, h) => {
    const sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#d7e6ea");
    sky.addColorStop(0.45, "#e7f0dc");
    sky.addColorStop(1, "#8eaf72");
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#6f9a55";
    g.fillRect(0, h * 0.62, w, h * 0.38);
    g.fillStyle = "#3f6a3c";
    for (let i = 0; i < 7; i++) {
      const x = 40 + i * 68;
      g.beginPath();
      g.moveTo(x, h * 0.78);
      g.lineTo(x + 26, h * 0.42);
      g.lineTo(x + 52, h * 0.78);
      g.fill();
    }
  }, 512, 256);
}

function chartTexture() {
  return makeTexture((g, w, h) => {
    g.fillStyle = "#f7f4ee";
    g.fillRect(0, 0, w, h);
    const rows = [
      ["#e7a0b8", 0.78],
      ["#d7c4ee", 0.55],
      ["#9ec0e4", 0.66],
      ["#f0d0a4", 0.42],
      ["#e7a0b8", 0.7],
      ["#c9b6e4", 0.48],
    ];
    rows.forEach(([color, len], i) => {
      const y = 28 + i * 36;
      g.fillStyle = color;
      g.fillRect(24, y, (w - 48) * len, 22);
    });
  }, 256, 256);
}

function binderTexture() {
  return makeTexture((g, w, h) => {
    g.fillStyle = "#efe6d6";
    g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 16) {
      const tone = 236 - (x % 5) * 6;
      g.fillStyle = `rgb(${tone},${tone - 4},${tone - 12})`;
      g.fillRect(x + 1, 0, 14, h);
      g.fillStyle = (x / 16) % 3 === 0 ? "#c4554a" : "#6e7354";
      g.fillRect(x + 1, 18, 14, 4);
    }
  }, 256, 128);
}

function pinTexture() {
  return makeTexture((g, w, h) => {
    g.fillStyle = "#fbf7f0";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(180,170,150,0.45)";
    g.lineWidth = 1;
    for (let x = 16; x < w; x += 32) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, h);
      g.stroke();
    }
    for (let y = 16; y < h; y += 32) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    }
    const pins = ["#d4554a", "#3d6ea8", "#d4a24a", "#3f8a52"];
    pins.forEach((color, i) => {
      g.fillStyle = color;
      g.beginPath();
      g.arc(48 + i * 48, 40 + (i % 2) * 36, 7, 0, Math.PI * 2);
      g.fill();
    });
  }, 256, 160);
}

function buildCeoPoly() {
  const pts = [[-B.ceoR, B.ceoBackZ], [-B.ceoR, B.ceoSideZ]];
  const steps = 22;
  for (let i = 0; i <= steps; i++) {
    const theta = Math.PI * (1 - i / steps);
    pts.push([Math.cos(theta) * B.ceoR, B.ceoSideZ + Math.sin(theta) * B.ceoR]);
  }
  pts.push([B.ceoR, B.ceoBackZ]);
  return pts;
}

export function buildOffice(scene) {
  const themeables = [];
  const lamps = [];
  const fountain = {
    drops: [],
    ripples: [],
    veils: [],
    jet: null,
    surfaces: [],
    dropMesh: null,
    sheetOpacity: 0.42,
    veilOpacity: 0.16,
    sprayGlow: 0.55,
    rippleAlpha: 0.55,
    light: null,
  };
  const _dummy = new THREE.Object3D();
  const _tmp = new THREE.Vector3();
  const deptLabels = [];
  const ceoPoly = buildCeoPoly();

  const oakTex = woodTexture();
  oakTex.repeat.set(2.4, 2.4);
  const tileTex = tileTexture();
  tileTex.repeat.set(5.5, 4.2);
  const rugTex = rugTexture();
  rugTex.wrapS = rugTex.wrapT = THREE.ClampToEdgeWrapping;
  const artTex = artTexture();
  artTex.wrapS = artTex.wrapT = THREE.ClampToEdgeWrapping;
  const gardenTex = gardenTexture();
  gardenTex.wrapS = gardenTex.wrapT = THREE.ClampToEdgeWrapping;
  const chartTex = chartTexture();
  chartTex.wrapS = chartTex.wrapT = THREE.ClampToEdgeWrapping;
  const binderTex = binderTexture();
  binderTex.wrapS = THREE.RepeatWrapping;
  binderTex.wrapT = THREE.ClampToEdgeWrapping;
  binderTex.repeat.set(3.2, 1);
  const pinTex = pinTexture();
  pinTex.wrapS = pinTex.wrapT = THREE.ClampToEdgeWrapping;

  const mats = {
    ground: new THREE.MeshStandardMaterial({ color: PAL.day.ground, roughness: 0.96 }),
    plinth: new THREE.MeshStandardMaterial({ color: PAL.day.plinth, roughness: 0.9 }),
    hall: new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.86, metalness: 0.02 }),
    oakFloor: new THREE.MeshStandardMaterial({ map: oakTex, roughness: 0.78 }),
    wall: new THREE.MeshStandardMaterial({ color: PAL.day.wall, roughness: 0.92 }),
    wood: new THREE.MeshStandardMaterial({ color: PAL.day.wood, roughness: 0.62 }),
    woodDark: new THREE.MeshStandardMaterial({ color: PAL.day.woodDark, roughness: 0.7 }),
    frame: new THREE.MeshStandardMaterial({ color: PAL.day.frame, roughness: 0.45, metalness: 0.18 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: PAL.day.glass,
      transparent: true,
      opacity: 0.1,
      roughness: 0.06,
      metalness: 0.02,
      transmission: 0.25,
      thickness: 0.04,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    cream: new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.7 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf7f5f1, roughness: 0.52 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x2a2c30, roughness: 0.5 }),
    black: new THREE.MeshStandardMaterial({ color: 0x1a1c1f, roughness: 0.45 }),
    screen: new THREE.MeshStandardMaterial({
      color: 0x7ec8ff,
      emissive: 0x2378b5,
      emissiveIntensity: 0.45,
      roughness: 0.3,
    }),
    screenGreen: new THREE.MeshStandardMaterial({
      color: 0x9dbe8a,
      emissive: 0x2f6a32,
      emissiveIntensity: 0.35,
      roughness: 0.4,
    }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x2f7a45, roughness: 0.75 }),
    leafDeep: new THREE.MeshStandardMaterial({ color: 0x1d5a34, roughness: 0.8 }),
    pot: new THREE.MeshStandardMaterial({ color: 0xc4784e, roughness: 0.72 }),
    potWhite: new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.6 }),
    sofa: new THREE.MeshStandardMaterial({ color: 0x1f7a48, roughness: 0.72 }),
    cushion: new THREE.MeshStandardMaterial({ color: 0xe07a32, roughness: 0.68 }),
    cognac: new THREE.MeshStandardMaterial({ color: 0xd4843e, roughness: 0.62 }),
    leatherExec: new THREE.MeshStandardMaterial({ color: 0x1c1916, roughness: 0.55 }),
    guest: new THREE.MeshStandardMaterial({ color: 0xf3eadc, roughness: 0.68 }),
    cardboard: new THREE.MeshStandardMaterial({ color: 0xc9a56a, roughness: 0.88 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x8a9098, roughness: 0.35, metalness: 0.55 }),
    server: new THREE.MeshStandardMaterial({ color: 0x1a1d22, roughness: 0.42 }),
    serverFloor: new THREE.MeshStandardMaterial({ color: 0x23262b, roughness: 0.8 }),
    olive: new THREE.MeshStandardMaterial({ color: PAL.day.olive, roughness: 0.9 }),
    walnut: new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.5 }),
    walnutDark: new THREE.MeshStandardMaterial({ color: 0x3a281c, roughness: 0.58 }),
    caneWood: new THREE.MeshStandardMaterial({ color: 0xc6a36a, roughness: 0.48 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xc6a15a, roughness: 0.32, metalness: 0.72 }),
    rail: new THREE.MeshStandardMaterial({ color: 0xb08960, roughness: 0.42, metalness: 0.28 }),
    curtain: new THREE.MeshStandardMaterial({ color: 0xe4d0a4, roughness: 0.82, side: THREE.DoubleSide }),
    paper: new THREE.MeshStandardMaterial({ color: 0xfffaf3, roughness: 0.9 }),
    kilim: new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.94 }),
    art: new THREE.MeshStandardMaterial({ map: artTex, roughness: 0.62 }),
    garden: new THREE.MeshStandardMaterial({ map: gardenTex, roughness: 0.9 }),
    chart: new THREE.MeshStandardMaterial({ map: chartTex, roughness: 0.7 }),
    binders: new THREE.MeshStandardMaterial({ map: binderTex, roughness: 0.62 }),
    pin: new THREE.MeshStandardMaterial({ map: pinTex, roughness: 0.75 }),
    plaza: new THREE.MeshStandardMaterial({ color: 0xd5d8dc, roughness: 0.84 }),
    lampShade: new THREE.MeshStandardMaterial({
      color: 0xf7f3ea,
      emissive: 0xffe3b0,
      emissiveIntensity: 0.22,
      roughness: 0.55,
      side: THREE.DoubleSide,
    }),
    lampPole: new THREE.MeshStandardMaterial({ color: 0x6a5340, roughness: 0.4, metalness: 0.35 }),
    stone: new THREE.MeshStandardMaterial({
      color: PAL.day.stone,
      roughness: 0.48,
      metalness: 0.06,
      side: THREE.DoubleSide,
    }),
    stoneDark: new THREE.MeshStandardMaterial({
      color: PAL.day.stoneDark,
      roughness: 0.62,
      metalness: 0.04,
      side: THREE.DoubleSide,
    }),
    stoneRim: new THREE.MeshStandardMaterial({
      color: PAL.day.stone,
      emissive: PAL.day.water,
      emissiveIntensity: 0.18,
      roughness: 0.32,
      metalness: 0.2,
    }),
    water: new THREE.MeshPhysicalMaterial({
      color: PAL.day.water,
      emissive: PAL.day.waterDeep,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.82,
      roughness: 0.08,
      metalness: 0.04,
      transmission: 0.12,
      thickness: 0.12,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    waterDeep: new THREE.MeshPhysicalMaterial({
      color: PAL.day.waterDeep,
      emissive: PAL.day.waterDeep,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.92,
      roughness: 0.2,
      metalness: 0.02,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    sheet: new THREE.MeshPhysicalMaterial({
      color: PAL.day.water,
      emissive: PAL.day.waterDeep,
      emissiveIntensity: 0.28,
      transparent: true,
      opacity: 0.42,
      roughness: 0.05,
      metalness: 0.02,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    veil: new THREE.MeshPhysicalMaterial({
      color: PAL.day.water,
      emissive: PAL.day.waterDeep,
      emissiveIntensity: 0.22,
      transparent: true,
      opacity: 0.16,
      roughness: 0.06,
      metalness: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    spray: new THREE.MeshStandardMaterial({
      color: PAL.day.foam,
      emissive: PAL.day.water,
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.9,
      roughness: 0.16,
      depthWrite: false,
    }),
    foamRing: new THREE.MeshBasicMaterial({
      color: PAL.day.foam,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  };

  const group = new THREE.Group();
  scene.add(group);

  function box(mat, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0, shadow = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.rotation.set(rx, ry, rz);
    if (shadow) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
    group.add(mesh);
    return mesh;
  }

  function cyl(mat, rTop, rBot, h, x, y, z, segs = 20, shadow = true) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs), mat);
    mesh.position.set(x, y, z);
    if (shadow) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
    group.add(mesh);
    return mesh;
  }

  function segmentsFromGaps(len, gaps) {
    const cuts = (gaps || [])
      .map((g) => [Math.max(0, g.at - g.w / 2), Math.min(len, g.at + g.w / 2)])
      .sort((a, b) => a[0] - b[0]);
    const segs = [];
    let cursor = 0;
    for (const [a, b] of cuts) {
      if (a > cursor + 0.03) segs.push([cursor, a]);
      cursor = Math.max(cursor, b);
    }
    if (cursor < len - 0.03) segs.push([cursor, len]);
    return segs;
  }

  function glassWall(x1, z1, x2, z2, height = B.wallH, gaps = []) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz) || 1;
    const ry = Math.atan2(dx, dz);
    for (const [a, b] of segmentsFromGaps(len, gaps)) {
      const sl = b - a;
      const t = (a + b) / 2 / len;
      const px = x1 + dx * t;
      const pz = z1 + dz * t;
      const pane = box(mats.glass, 0.03, height - 0.1, Math.max(0.08, sl - 0.04), px, height / 2, pz, 0, ry, 0, false);
      pane.renderOrder = 2;
      box(mats.frame, 0.05, 0.045, sl, px, 0.028, pz, 0, ry, 0, false);
      box(mats.frame, 0.05, 0.05, sl, px, height - 0.03, pz, 0, ry, 0, false);
      for (const u of [0, 1]) {
        const qx = x1 + (dx * (a + (b - a) * u)) / len;
        const qz = z1 + (dz * (a + (b - a) * u)) / len;
        box(mats.frame, 0.045, height, 0.045, qx, height / 2, qz, 0, 0, 0, false);
      }
    }
  }

  function solidWall(x1, z1, x2, z2, height = B.outH, mat = mats.wall, thick = 0.16) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const ry = Math.atan2(dx, dz);
    return box(mat, thick, height, len, (x1 + x2) / 2, height / 2, (z1 + z2) / 2, 0, ry);
  }

  function woodFloor(x0, x1, z0, z1) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.03, z1 - z0), mats.oakFloor);
    mesh.position.set((x0 + x1) / 2, 0.03, (z0 + z1) / 2);
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }

  function plant(x, z, scale = 1, potMat = mats.potWhite) {
    const g = new THREE.Group();
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.22 * scale, 0.24 * scale, 12), potMat);
    pot.position.y = 0.12 * scale;
    pot.castShadow = true;
    g.add(pot);
    const blobs = [
      [0, 0.46, 0, 0.32],
      [0.12, 0.66, 0.05, 0.24],
      [-0.11, 0.62, -0.04, 0.22],
      [0.02, 0.84, 0.02, 0.18],
    ];
    blobs.forEach(([lx, ly, lz, s], i) => {
      const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(s * scale, 0), i % 2 ? mats.leafDeep : mats.leaf);
      leaf.position.set(lx * scale, ly * scale, lz * scale);
      leaf.castShadow = true;
      g.add(leaf);
    });
    g.position.set(x, 0, z);
    group.add(g);
    return g;
  }

  function bookshelf(x, z, ry = 0, w = 1.7, h = 2.02) {
    const g = new THREE.Group();
    const back = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05), mats.wood);
    back.position.set(0, h / 2, -0.14);
    g.add(back);
    for (const sx of [-w / 2 + 0.03, w / 2 - 0.03]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, 0.3), mats.wood);
      side.position.set(sx, h / 2, 0);
      g.add(side);
    }
    const colors = [0xb8573a, 0x3d5a80, 0xd6b25e, 0x6a994e, 0x7b2d26, 0x4361ee, 0xc9ada7];
    let n = 0;
    for (let row = 0; row < 4; row++) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(w - 0.08, 0.04, 0.28), mats.woodDark);
      shelf.position.y = 0.28 + row * (h / 4.4);
      g.add(shelf);
      let cursor = -w / 2 + 0.12;
      while (cursor < w / 2 - 0.16) {
        const bw = 0.08 + (n % 4) * 0.015;
        const bh = 0.26 + (n % 3) * 0.04;
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(bw, bh, 0.2),
          new THREE.MeshStandardMaterial({ color: colors[n % colors.length], roughness: 0.7 })
        );
        book.position.set(cursor + bw / 2, 0.3 + row * (h / 4.4) + bh / 2, 0);
        g.add(book);
        cursor += bw + 0.012;
        n += 1;
      }
    }
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    group.add(g);
  }

  function desk(x, z, ry = 0, dual = false) {
    const g = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.07, 0.74), mats.wood);
    top.position.y = 0.74;
    top.castShadow = true;
    top.receiveShadow = true;
    g.add(top);
    for (const [lx, lz] of [
      [-0.64, -0.28],
      [0.64, -0.28],
      [-0.64, 0.28],
      [0.64, 0.28],
    ]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.06), mats.woodDark);
      leg.position.set(lx, 0.35, lz);
      g.add(leg);
    }
    const screens = dual ? [-0.32, 0.32] : [0];
    for (const sx of screens) {
      const bezel = new THREE.Mesh(new THREE.BoxGeometry(dual ? 0.52 : 0.62, 0.36, 0.04), mats.dark);
      bezel.position.set(sx, 1.05, -0.22);
      g.add(bezel);
      const glow = new THREE.Mesh(new THREE.BoxGeometry(dual ? 0.46 : 0.56, 0.3, 0.02), mats.screen);
      glow.position.set(sx, 1.05, -0.195);
      g.add(glow);
    }
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.06), mats.metal);
    neck.position.set(0, 0.84, -0.22);
    g.add(neck);
    const kb = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.025, 0.14), mats.dark);
    kb.position.set(0.05, 0.785, 0.1);
    g.add(kb);
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    group.add(g);
  }

  function chair(x, z, ry = 0) {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.07, 0.46), mats.black);
    seat.position.y = 0.46;
    seat.castShadow = true;
    g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.48, 0.07), mats.black);
    back.position.set(0, 0.72, -0.2);
    back.castShadow = true;
    g.add(back);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.38, 8), mats.metal);
    pole.position.y = 0.22;
    g.add(pole);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.045, 10), mats.metal);
    base.position.y = 0.03;
    g.add(base);
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    group.add(g);
  }

  function guestChair(x, z, ry = 0) {
    const g = new THREE.Group();
    for (const [lx, lz] of [
      [-0.18, -0.18],
      [0.18, -0.18],
      [-0.18, 0.18],
      [0.18, 0.18],
    ]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.36, 0.045), mats.caneWood);
      leg.position.set(lx, 0.18, lz);
      g.add(leg);
    }
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.48), mats.guest);
    seat.position.y = 0.42;
    seat.castShadow = true;
    g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.42, 0.1), mats.guest);
    back.position.set(0, 0.68, -0.19);
    back.castShadow = true;
    g.add(back);
    for (const sx of [-0.26, 0.26]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 0.34), mats.caneWood);
      arm.position.set(sx, 0.56, 0);
      g.add(arm);
    }
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    group.add(g);
  }

  function execChair(x, z, ry = 0) {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.1, 0.52), mats.leatherExec);
    seat.position.y = 0.5;
    seat.castShadow = true;
    g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.72, 0.1), mats.leatherExec);
    back.position.set(0, 0.92, -0.22);
    back.castShadow = true;
    g.add(back);
    for (const sx of [-0.3, 0.3]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.36), mats.walnut);
      arm.position.set(sx, 0.66, -0.02);
      g.add(arm);
    }
    cyl(mats.metal, 0.045, 0.05, 0.4, x, 0.22, z, 10);
    cyl(mats.metal, 0.24, 0.26, 0.045, x, 0.03, z, 8);
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    group.add(g);
  }

  function sofa(x, z, ry = 0, w = 2.2) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.32, 0.72), mats.sofa);
    base.position.y = 0.28;
    base.castShadow = true;
    g.add(base);
    const back = new THREE.Mesh(new THREE.BoxGeometry(w, 0.46, 0.14), mats.sofa);
    back.position.set(0, 0.58, -0.3);
    back.castShadow = true;
    g.add(back);
    for (const sx of [-w / 2 + 0.07, w / 2 - 0.07]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, 0.72), mats.sofa);
      arm.position.set(sx, 0.42, 0);
      g.add(arm);
    }
    const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.1, 0.28), mats.cushion);
    cushion.position.set(-w * 0.18, 0.48, 0.06);
    g.add(cushion);
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    group.add(g);
  }

  function loungeChair(x, z, ry = 0) {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.26, 0.62), mats.cognac);
    seat.position.y = 0.32;
    seat.castShadow = true;
    g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.46, 0.12), mats.cognac);
    back.position.set(0, 0.58, -0.25);
    back.castShadow = true;
    g.add(back);
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    group.add(g);
  }

  function stool(x, z) {
    cyl(mats.woodDark, 0.16, 0.16, 0.06, x, 0.68, z, 14);
    cyl(mats.metal, 0.025, 0.025, 0.6, x, 0.34, z, 8);
    cyl(mats.metal, 0.15, 0.15, 0.03, x, 0.05, z, 12);
  }

  function tableRound(x, z, r = 0.42) {
    cyl(mats.white, r, r, 0.06, x, 0.42, z, 24);
    cyl(mats.woodDark, 0.05, 0.07, 0.38, x, 0.2, z, 10);
  }

  function lamp(x, z) {
    cyl(mats.lampPole, 0.03, 0.045, 1.28, x, 0.64, z, 10);
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 0.28, 16, 1, true), mats.lampShade);
    shade.position.set(x, 1.42, z);
    group.add(shade);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xfff1d0, emissive: 0xffd7a0, emissiveIntensity: 0.45 })
    );
    bulb.position.set(x, 1.38, z);
    group.add(bulb);
    const light = new THREE.PointLight(0xffd4a2, 0, 8, 2);
    light.position.set(x, 1.36, z);
    scene.add(light);
    lamps.push({ light, shade, bulb });
  }

  function sconce(x, y, z) {
    box(mats.brass, 0.08, 0.16, 0.03, x, y, z + 0.02, 0, 0, 0, false);
    const shade = box(mats.lampShade, 0.16, 0.1, 0.08, x, y - 0.02, z + 0.08, 0, 0, 0, false);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xfff1d0, emissive: 0xffd7a0, emissiveIntensity: 0.8 })
    );
    bulb.position.set(x, y - 0.02, z + 0.08);
    group.add(bulb);
    const light = new THREE.PointLight(0xffd2a0, 0, 4.2, 2);
    light.position.set(x, y, z + 0.35);
    scene.add(light);
    lamps.push({ light, shade, bulb });
  }

  function tree(x, z, s = 1) {
    cyl(mats.woodDark, 0.05 * s, 0.08 * s, 0.7 * s, x, 0.35 * s, z, 6);
    const a = new THREE.Mesh(new THREE.IcosahedronGeometry(0.48 * s, 0), mats.leaf);
    a.position.set(x, 1.05 * s, z);
    group.add(a);
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32 * s, 0), mats.leafDeep);
    b.position.set(x + 0.08 * s, 1.38 * s, z + 0.04 * s);
    group.add(b);
  }

  function sheet(x, y, z, w = 0.26, d = 0.18, ry = 0.15) {
    box(mats.paper, w, 0.008, d, x, y, z, 0, ry, 0, false);
  }

  function arcWall(a0, a1, mat, height) {
    const steps = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 0.16));
    for (let i = 0; i < steps; i++) {
      const t0 = a0 + ((a1 - a0) * i) / steps;
      const t1 = a0 + ((a1 - a0) * (i + 1)) / steps;
      const mid = (t0 + t1) / 2;
      const len = Math.abs(t1 - t0) * B.ceoR + 0.03;
      const x = Math.cos(mid) * B.ceoR;
      const z = B.ceoSideZ + Math.sin(mid) * B.ceoR;
      const ry = Math.atan2(-Math.sin(mid), Math.cos(mid));
      box(mat, 0.16, height, len, x, height / 2, z, 0, ry);
    }
  }

  function railing(a0, a1) {
    const start = Math.min(a0, a1);
    const end = Math.max(a0, a1);
    const gap0 = Math.PI / 2 - 0.22;
    const gap1 = Math.PI / 2 + 0.22;
    const step = 0.1;
    const posts = [];
    for (let t = start; t <= end + 1e-4; t += step) {
      if (t > gap0 && t < gap1) continue;
      posts.push(t);
    }
    for (const t of posts) {
      const x = Math.cos(t) * B.ceoR;
      const z = B.ceoSideZ + Math.sin(t) * B.ceoR;
      cyl(mats.rail, 0.022, 0.022, 0.9, x, 0.45, z, 6);
    }
    for (let i = 0; i < posts.length - 1; i++) {
      const t0 = posts[i];
      const t1 = posts[i + 1];
      if (t1 - t0 > step * 1.6) continue;
      const mid = (t0 + t1) / 2;
      const len = Math.abs(t1 - t0) * B.ceoR + 0.02;
      const x = Math.cos(mid) * B.ceoR;
      const z = B.ceoSideZ + Math.sin(mid) * B.ceoR;
      const ry = Math.atan2(-Math.sin(mid), Math.cos(mid));
      box(mats.caneWood, 0.045, 0.04, len, x, 0.9, z, 0, ry, 0, false);
      box(mats.rail, 0.03, 0.025, len, x, 0.42, z, 0, ry, 0, false);
    }
  }

  // --- site ---
  const midZ = (B.north + B.south) / 2;
  const spanX = B.east - B.west;
  const spanZ = B.south - B.north;
  box(mats.ground, 78, 0.2, 64, 0, -0.16, -1.2, 0, 0, 0, false);
  box(mats.plinth, spanX + 0.85, 0.14, spanZ + 0.7, 0, -0.04, midZ, 0, 0, 0, false);
  themeables.push({ mat: mats.ground, key: "ground" }, { mat: mats.plinth, key: "plinth" }, { mat: mats.olive, key: "olive" });

  const hall = new THREE.Mesh(new THREE.BoxGeometry(spanX - 0.28, 0.04, spanZ - 0.28), mats.hall);
  hall.position.set(0, 0.02, midZ);
  hall.receiveShadow = true;
  group.add(hall);

  const plaza = new THREE.Mesh(new THREE.CircleGeometry(4.25, 48), mats.plaza);
  plaza.rotation.x = -Math.PI / 2;
  plaza.position.set(0, 0.042, B.fZ);
  plaza.receiveShadow = true;
  group.add(plaza);

  const garden = new THREE.Mesh(new THREE.CircleGeometry(1, 8), mats.leaf);
  garden.rotation.x = -Math.PI / 2;
  garden.scale.set(6.4, 1.5, 1);
  garden.position.set(0, -0.04, -14.15);
  group.add(garden);
  const view = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.7), mats.garden);
  view.position.set(0, 1.35, -13.15);
  group.add(view);
  tree(-2.35, -13.15, 1.15);
  tree(-0.7, -13.45, 0.9);
  tree(0.85, -13.2, 1.05);
  tree(2.4, -13.4, 0.95);

  // Wood floors. Tile stays visible in the hall and at the glass thresholds.
  woodFloor(B.west + 0.2, B.glassL - 0.06, B.north + 0.18, B.wsZ - 0.06);
  woodFloor(B.west + 0.2, B.glassL - 0.06, B.wsZ + 0.06, B.confZ - 0.06);
  woodFloor(B.west + 0.2, B.glassL - 0.06, B.confZ + 0.06, B.south - 0.18);
  woodFloor(B.glassR + 0.06, B.east - 0.2, B.north + 0.18, B.rTopZ - 0.06);
  woodFloor(B.glassR + 0.06, B.east - 0.2, B.rTopZ + 0.06, B.loungeZ - 0.06);
  woodFloor(B.glassR + 0.06, B.east - 0.2, B.loungeZ + 0.06, B.south - 0.18);
  box(mats.serverFloor, B.glassL - B.serverX - 0.08, 0.04, B.serverZ1 - B.wsZ - 0.08, (B.serverX + B.glassL) / 2, 0.045, (B.wsZ + B.serverZ1) / 2);

  const ceoShape = new THREE.Shape();
  ceoShape.moveTo(ceoPoly[0][0], -ceoPoly[0][1]);
  for (let i = 1; i < ceoPoly.length; i++) ceoShape.lineTo(ceoPoly[i][0], -ceoPoly[i][1]);
  ceoShape.closePath();
  const ceoFloor = new THREE.Mesh(new THREE.ShapeGeometry(ceoShape), mats.oakFloor);
  ceoFloor.rotation.x = -Math.PI / 2;
  ceoFloor.position.y = 0.046;
  ceoFloor.receiveShadow = true;
  group.add(ceoFloor);

  // Outer shell. The south face is open so the plan reads like the concept.
  solidWall(B.west, B.north, B.west, B.south, 1.7);
  solidWall(B.east, B.north, B.east, B.south, 1.7);
  solidWall(B.west, B.north, B.glassL, B.north, B.outH);
  solidWall(B.glassL, B.north, -B.ceoR, B.north, B.outH);
  solidWall(B.ceoR, B.north, B.glassR, B.north, B.outH);
  solidWall(B.glassR, B.north, B.east, B.north, B.outH);
  box(mats.plinth, spanX + 0.2, 0.16, 0.18, 0, 0.08, B.south);

  // Left wing dividers + server bay
  solidWall(B.west + 0.08, B.wsZ, B.glassL, B.wsZ, B.wallH);
  solidWall(B.serverX, B.wsZ, B.serverX, B.serverZ1, B.wallH);
  solidWall(B.serverX, B.serverZ1, B.glassL, B.serverZ1, B.wallH);
  solidWall(B.west + 0.08, B.confZ, B.glassL, B.confZ, B.wallH);
  // Right wing dividers
  solidWall(B.glassR, B.rTopZ, B.east - 0.08, B.rTopZ, B.wallH);
  solidWall(B.glassR, B.loungeZ, B.east - 0.08, B.loungeZ, B.wallH);

  const gap = (z, w) => ({ at: z - B.north, w });
  glassWall(B.glassL, B.north, B.glassL, B.south, 1.38, [
    gap(PORTALS.research.z, 1.7),
    gap(PORTALS.server.z, 1.15),
    gap(PORTALS.conference.z, 1.75),
    gap(PORTALS.admin.z, 1.7),
  ]);
  glassWall(B.glassR, B.north, B.glassR, B.south, 1.38, [
    gap(PORTALS.content.z, 1.7),
    gap(PORTALS.lounge.z, 1.7),
    gap(PORTALS.ops.z, 1.7),
  ]);

  // --- 总裁办公室 ---
  const backZ = B.ceoBackZ;
  solidWall(-B.ceoR, B.ceoSideZ, -B.ceoR, backZ, B.ceoH, mats.olive, 0.18);
  solidWall(B.ceoR, backZ, B.ceoR, B.ceoSideZ, B.ceoH, mats.olive, 0.18);
  arcWall(Math.PI, 2.16, mats.olive, B.ceoH);
  arcWall(Math.PI - 2.16, 0, mats.olive, B.ceoH);
  railing(2.16, Math.PI - 2.16);

  const winW = 1.52;
  const winH = 1.18;
  const winY = 1.4;
  const wins = [-2.15, 2.15];
  box(mats.olive, B.ceoR * 2, 0.78, 0.18, 0, 0.39, backZ);
  box(mats.olive, B.ceoR * 2, B.ceoH - (winY + winH / 2), 0.18, 0, (winY + winH / 2 + B.ceoH) / 2, backZ);
  const piers = [
    [-B.ceoR, wins[0] - winW / 2],
    [wins[0] + winW / 2, wins[1] - winW / 2],
    [wins[1] + winW / 2, B.ceoR],
  ];
  for (const [x0, x1] of piers) {
    box(mats.olive, x1 - x0, winH + 0.08, 0.18, (x0 + x1) / 2, winY, backZ);
  }
  box(mats.walnutDark, 1.55, 1.02, 0.05, 0, 1.62, backZ + 0.12);
  box(mats.art, 1.4, 0.88, 0.02, 0, 1.62, backZ + 0.16, 0, 0, 0, false);
  for (const wx of wins) {
    box(mats.walnutDark, winW + 0.08, 0.06, 0.08, wx, winY + winH / 2, backZ + 0.02);
    box(mats.walnutDark, winW + 0.08, 0.06, 0.08, wx, winY - winH / 2, backZ + 0.02);
    box(mats.walnutDark, 0.06, winH, 0.08, wx - winW / 2, winY, backZ + 0.02);
    box(mats.walnutDark, 0.06, winH, 0.08, wx + winW / 2, winY, backZ + 0.02);
    const pane = box(mats.glass, winW - 0.08, winH - 0.08, 0.02, wx, winY, backZ + 0.06, 0, 0, 0, false);
    pane.renderOrder = 2;
    box(mats.walnut, 0.025, winH - 0.12, 0.025, wx, winY, backZ + 0.08, 0, 0, 0, false);
    box(mats.walnut, winW - 0.12, 0.025, 0.025, wx, winY, backZ + 0.08, 0, 0, 0, false);
    cyl(mats.brass, 0.02, 0.02, winW + 0.35, wx, winY + winH / 2 + 0.08, backZ + 0.14, 8, false);
    box(mats.curtain, 0.2, winH - 0.05, 0.05, wx - winW / 2 + 0.02, winY, backZ + 0.16);
    box(mats.curtain, 0.2, winH - 0.05, 0.05, wx + winW / 2 - 0.02, winY, backZ + 0.16);
  }
  for (const sx of [-3.25, -1.15, 1.15, 3.25]) sconce(sx, 1.7, backZ + 0.12);

  const kilim = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.02, 3.15), mats.kilim);
  kilim.position.set(0.05, 0.06, -9.15);
  kilim.receiveShadow = true;
  group.add(kilim);

  box(mats.walnutDark, 2.35, 0.72, 1.08, 0.05, 0.36, -9.2);
  box(mats.walnut, 2.45, 0.08, 1.18, 0.05, 0.76, -9.2);
  box(mats.walnutDark, 2.2, 0.5, 0.06, 0.05, 0.28, -9.68);
  sheet(0.15, 0.82, -9.15, 0.34, 0.22, 0.1);
  sheet(-0.15, 0.825, -9.28, 0.22, 0.16, -0.2);
  box(mats.dark, 0.42, 0.28, 0.035, -0.55, 1.02, -9.28);
  box(mats.screenGreen, 0.36, 0.22, 0.012, -0.55, 1.02, -9.25, 0, 0, 0, false);
  box(mats.metal, 0.08, 0.08, 0.1, -0.15, 0.84, -9.05);
  box(mats.frame, 0.14, 0.04, 0.1, 0.55, 0.82, -9.22);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8, 0, Math.PI), mats.frame);
  dome.rotation.z = Math.PI / 2;
  dome.position.set(0.72, 0.96, -9.18);
  group.add(dome);
  cyl(mats.brass, 0.025, 0.025, 0.16, 0.55, 0.9, -9.18, 6, false);
  cyl(mats.white, 0.045, 0.04, 0.09, 0.95, 0.86, -9.05, 8, false);

  execChair(0.05, -9.95, 0);
  guestChair(-0.78, -8.05, Math.PI);
  guestChair(0.82, -8.02, Math.PI);

  box(mats.walnut, 0.42, 0.62, 1.7, 4.22, 0.34, -10.35);
  box(mats.walnutDark, 0.48, 0.05, 1.78, 4.22, 0.68, -10.35);
  box(new THREE.MeshStandardMaterial({ color: 0x8d3d32, roughness: 0.7 }), 0.12, 0.1, 0.16, 4.05, 0.78, -10.85);
  box(new THREE.MeshStandardMaterial({ color: 0x2f4f62, roughness: 0.7 }), 0.12, 0.12, 0.14, 4.05, 0.79, -10.6);
  box(new THREE.MeshStandardMaterial({ color: 0xc4a15a, roughness: 0.7 }), 0.11, 0.08, 0.12, 4.05, 0.76, -10.38);
  cyl(mats.brass, 0.05, 0.07, 0.22, 4.08, 0.84, -9.75, 8);
  const cShade = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.12, 12), mats.lampShade);
  cShade.position.set(4.08, 1.02, -9.75);
  group.add(cShade);
  const cBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.035, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xfff1d0, emissive: 0xffd7a0, emissiveIntensity: 0.55 })
  );
  cBulb.position.set(4.08, 0.96, -9.75);
  group.add(cBulb);
  const cLight = new THREE.PointLight(0xffd2a0, 0, 4.5, 2);
  cLight.position.set(3.7, 1.1, -9.75);
  scene.add(cLight);
  lamps.push({ light: cLight, shade: cShade, bulb: cBulb });

  plant(-3.7, -10.7, 0.95, mats.potWhite);
  plant(2.55, -10.85, 0.85, mats.pot);
  plant(-3.15, -8.35, 0.72, mats.potWhite);

  // --- top-left workstations ---
  desk(-13.15, -9.65, 0, true);
  chair(-13.15, -8.85, Math.PI);
  desk(-10.75, -9.65, 0, true);
  chair(-10.75, -8.85, Math.PI);
  bookshelf(-14.75, -9.7, Math.PI / 2, 1.6, 1.9);
  box(mats.frame, 1.7, 1.05, 0.05, -12.0, 1.5, -11.32);
  box(mats.pin, 1.55, 0.9, 0.02, -12.0, 1.5, -11.28, 0, 0, 0, false);
  plant(-7.15, -10.85, 0.8, mats.potWhite);

  // --- server bay ---
  box(mats.server, 0.7, 1.7, 0.5, -8.55, 0.85, -5.55);
  box(mats.server, 0.7, 1.55, 0.5, -7.55, 0.78, -5.45);
  for (let i = 0; i < 6; i++) {
    const led = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.035, 0.02),
      new THREE.MeshStandardMaterial({
        color: i % 2 ? 0x3dff8a : 0x4cc3ff,
        emissive: i % 2 ? 0x1fa85a : 0x2378b5,
        emissiveIntensity: 0.9,
      })
    );
    led.position.set(-8.2, 0.35 + i * 0.2, -5.28);
    group.add(led);
  }

  // --- conference ---
  box(mats.wood, 3.4, 0.08, 1.12, -10.75, 0.74, -2.8);
  for (const [lx, lz] of [
    [-12.2, -3.2],
    [-10.75, -3.2],
    [-9.3, -3.2],
    [-12.2, -2.4],
    [-10.75, -2.4],
    [-9.3, -2.4],
  ]) {
    box(mats.woodDark, 0.07, 0.7, 0.07, lx, 0.35, lz);
  }
  for (const x of [-12.15, -10.75, -9.35]) {
    chair(x, -3.55, 0);
    chair(x, -2.05, Math.PI);
  }
  box(mats.dark, 0.08, 1.35, 2.15, -14.85, 1.45, -2.8);
  box(mats.screen, 0.03, 1.18, 1.95, -14.78, 1.45, -2.8, 0, 0, 0, false);
  sheet(-11.3, 0.79, -2.75, 0.32, 0.2, 0.2);
  sheet(-10.4, 0.792, -2.9, 0.24, 0.16, -0.15);
  sheet(-9.7, 0.79, -2.65, 0.2, 0.14, 0.4);
  plant(-7.15, -0.55, 0.85, mats.pot);

  // --- reception / admin ---
  box(mats.frame, 0.06, 1.4, 2.2, -14.9, 1.5, 2.7);
  box(mats.chart, 0.02, 1.22, 2.02, -14.85, 1.5, 2.7, 0, 0, 0, false);
  desk(-12.25, 2.1, 0);
  chair(-12.25, 2.9, Math.PI);
  box(mats.white, 2.35, 1.02, 0.62, -10.7, 0.51, 5.25);
  box(mats.cream, 2.2, 0.04, 0.08, -10.7, 1.04, 5.5, 0, 0, 0, false);
  box(mats.dark, 0.42, 0.28, 0.04, -11.15, 1.22, 5.22);
  box(mats.screen, 0.36, 0.22, 0.015, -11.15, 1.22, 5.25, 0, 0, 0, false);
  bookshelf(-14.55, 6.55, Math.PI / 2, 1.35, 1.7);
  box(mats.dark, 0.38, 0.28, 0.32, -13.55, 0.7, 4.35);
  plant(-7.2, 6.7, 0.9, mats.potWhite);

  // --- top-right workstations ---
  desk(9.15, -9.35, 0, true);
  chair(9.15, -8.55, Math.PI);
  desk(11.45, -9.35, 0, true);
  chair(11.45, -8.55, Math.PI);
  bookshelf(12.4, -11.25, 0, 2.3, 1.7);
  box(mats.cardboard, 0.55, 0.4, 0.48, 14.05, 0.2, -6.15);
  box(mats.cardboard, 0.42, 0.32, 0.4, 13.55, 0.16, -6.55);
  box(mats.cardboard, 0.48, 0.55, 0.42, 14.35, 0.28, -6.6);
  box(mats.cardboard, 0.36, 0.28, 0.34, 14.15, 0.54, -6.15);
  plant(7.35, -10.7, 0.85, mats.potWhite);
  plant(14.15, -10.55, 0.7, mats.pot);

  // --- lounge ---
  box(mats.walnutDark, 2.5, 0.96, 0.52, 11.6, 0.48, -4.85);
  box(mats.walnut, 2.6, 0.06, 0.6, 11.6, 0.99, -4.85);
  const bottleColors = [0x8f2d2d, 0x245c3a, 0xc6a15a, 0x1e3a5f];
  bottleColors.forEach((color, i) => {
    cyl(new THREE.MeshStandardMaterial({ color, roughness: 0.35 }), 0.045, 0.055, 0.2, 10.75 + i * 0.32, 1.14, -4.95, 8, false);
  });
  stool(10.85, -4.22);
  stool(12.2, -4.2);
  sofa(13.9, -1.55, -Math.PI / 2, 1.85);
  tableRound(12.15, -1.55, 0.38);
  loungeChair(11.85, 0.15, 2.5);
  bookshelf(14.55, -3.9, -Math.PI / 2, 1.3, 1.55);
  plant(7.4, -4.7, 0.8, mats.pot);

  // --- archive + desks ---
  const binder = new THREE.Mesh(new THREE.BoxGeometry(5.05, 1.78, 0.3), mats.wood);
  binder.position.set(11.15, 0.92, 1.62);
  group.add(binder);
  const spines = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.58, 0.045), mats.binders);
  spines.position.set(11.15, 0.96, 1.8);
  group.add(spines);
  desk(10.15, 3.95, 0, true);
  chair(10.15, 4.8, Math.PI);
  desk(12.4, 3.95, 0, true);
  chair(12.4, 4.85, Math.PI);
  plant(7.45, 6.85, 0.95, mats.potWhite);

  // --- fountain plaza ---
  cyl(mats.stone, 2.55, 2.62, 0.1, 0, 0.07, B.fZ, 48);
  cyl(mats.stone, 1.85, 1.9, 0.12, 0, 0.16, B.fZ, 40);

  const fountainRoot = new THREE.Group();
  fountainRoot.position.set(0, 0.24, B.fZ);
  fountainRoot.scale.setScalar(0.68);
  group.add(fountainRoot);

  function makeBasin(outerR, innerR, baseY, wallH, segs, holeR) {
    const g = new THREE.Group();
    const floorH = 0.045;
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(innerR, innerR, floorH, segs), mats.stoneDark);
    floor.position.y = baseY + floorH / 2;
    floor.receiveShadow = true;
    g.add(floor);
    const outer = new THREE.Mesh(new THREE.CylinderGeometry(outerR, outerR * 0.985, wallH, segs, 1, true), mats.stone);
    outer.position.y = baseY + wallH / 2;
    outer.castShadow = true;
    g.add(outer);
    const innerH = Math.max(0.08, wallH - 0.05);
    const inner = new THREE.Mesh(new THREE.CylinderGeometry(innerR, innerR * 0.992, innerH, segs, 1, true), mats.stoneDark);
    inner.position.y = baseY + innerH / 2 + 0.02;
    g.add(inner);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(outerR - 0.012, Math.min(0.04, wallH * 0.18), 8, segs), mats.stoneRim);
    lip.rotation.x = Math.PI / 2;
    lip.position.y = baseY + wallH;
    g.add(lip);
    const waterY = baseY + wallH * 0.56;
    const hole = Math.max(holeR, 0);
    const deep = new THREE.Mesh(
      hole > 0.02 ? new THREE.RingGeometry(hole, innerR * 0.98, segs) : new THREE.CircleGeometry(innerR * 0.98, segs),
      mats.waterDeep
    );
    deep.rotation.x = -Math.PI / 2;
    deep.position.y = waterY - 0.04;
    deep.renderOrder = 1;
    g.add(deep);
    const water = new THREE.Mesh(
      hole > 0.02 ? new THREE.RingGeometry(hole, innerR * 0.92, segs) : new THREE.CircleGeometry(innerR * 0.92, segs),
      mats.water
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = waterY;
    water.renderOrder = 2;
    water.userData.baseY = waterY;
    water.userData.phase = outerR;
    g.add(water);
    fountain.surfaces.push(water);
    const foam = new THREE.Mesh(new THREE.TorusGeometry(innerR * 0.9, 0.014, 6, Math.max(segs, 20)), mats.foamRing);
    foam.rotation.x = Math.PI / 2;
    foam.position.y = waterY + 0.01;
    foam.renderOrder = 3;
    g.add(foam);
    fountainRoot.add(g);
    return { lipY: baseY + wallH, waterY, innerR, outerR };
  }

  function stem(rTop, rBot, y0, y1, segs) {
    const h = y1 - y0;
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs), mats.stone);
    mesh.position.y = (y0 + y1) / 2;
    mesh.castShadow = true;
    fountainRoot.add(mesh);
  }

  function veil(rTop, rBot, y0, y1, segs, spin) {
    const h = y1 - y0;
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs, 1, true), mats.veil);
    mesh.position.y = (y0 + y1) / 2;
    mesh.renderOrder = 2;
    mesh.userData.spin = spin;
    mesh.userData.pulse = spin * 4;
    fountainRoot.add(mesh);
    fountain.veils.push(mesh);
  }

  function jetCurves(count, r0, y0, r1, y1, r2, y2, tubeR, twist = 0) {
    const curves = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + twist;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(c * r0, y0, s * r0),
        new THREE.Vector3(c * r1, y1, s * r1),
        new THREE.Vector3(c * r2, y2, s * r2)
      );
      curves.push(curve);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, tubeR, 5, false), mats.sheet);
      tube.renderOrder = 2;
      fountainRoot.add(tube);
    }
    return curves;
  }

  function addDrops(curves, perCurve, speed, base) {
    for (let i = 0; i < curves.length; i++) {
      for (let k = 0; k < perCurve; k++) {
        fountain.drops.push({
          curve: curves[i],
          speed,
          phase: k / perCurve + i * 0.13,
          base,
        });
      }
    }
  }

  const lower = makeBasin(1.46, 1.2, 0, 0.4, 36, 0.32);
  const mid = makeBasin(0.74, 0.54, 0.98, 0.24, 28, 0.16);
  const top = makeBasin(0.36, 0.24, 1.56, 0.16, 20, 0);
  stem(0.2, 0.3, lower.waterY - 0.02, mid.lipY - 0.24, 14);
  stem(0.09, 0.14, mid.waterY - 0.02, top.lipY - 0.16, 10);
  const jetH = 0.38;
  const jetFoot = top.lipY + 0.02;
  const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.05, jetH, 7), mats.spray);
  jet.userData.half = jetH / 2;
  jet.userData.foot = jetFoot;
  jet.position.y = jetFoot + jetH / 2;
  jet.renderOrder = 3;
  fountainRoot.add(jet);
  fountain.jet = jet;
  const spout = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), mats.stoneRim);
  spout.position.y = jetFoot;
  fountainRoot.add(spout);
  veil(0.42, 0.68, mid.lipY - 0.02, top.waterY, 16, 0.18);
  veil(0.86, 1.22, lower.waterY + 0.04, mid.lipY - 0.02, 20, -0.1);

  const lowerJets = jetCurves(8, mid.outerR * 0.92, mid.lipY, 1.15, 0.72, 0.92, lower.waterY + 0.02, 0.04, 0.2);
  const upperJets = jetCurves(6, top.outerR * 0.9, top.lipY, 0.62, 1.38, mid.innerR * 0.72, mid.waterY + 0.02, 0.028, 0.4);
  const crownCurves = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    crownCurves.push(
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(c * 0.03, jetFoot + jetH * 0.86, s * 0.03),
        new THREE.Vector3(c * 0.2, jetFoot + jetH + 0.2, s * 0.2),
        new THREE.Vector3(c * 0.3, top.waterY + 0.02, s * 0.3)
      )
    );
  }
  addDrops(lowerJets, 4, 0.42, 0.07);
  addDrops(upperJets, 3, 0.5, 0.055);
  addDrops(crownCurves, 3, 0.72, 0.048);
  const dropMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 5), mats.spray, fountain.drops.length);
  dropMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  dropMesh.frustumCulled = false;
  dropMesh.renderOrder = 4;
  fountainRoot.add(dropMesh);
  fountain.dropMesh = dropMesh;

  function addRipples(y, radius, n) {
    for (let i = 0; i < n; i++) {
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.012, 6, 28), mats.foamRing.clone());
      mesh.rotation.x = Math.PI / 2;
      mesh.position.y = y + 0.015;
      mesh.renderOrder = 4;
      mesh.userData.slot = i / n;
      fountainRoot.add(mesh);
      fountain.ripples.push(mesh);
    }
  }
  addRipples(lower.waterY, 1.02, 3);
  addRipples(mid.waterY, 0.4, 2);

  const fLight = new THREE.PointLight(0xffc56a, 0.8, 7.5, 2);
  fLight.position.set(0, 1.3, B.fZ);
  scene.add(fLight);
  fountain.light = fLight;

  plant(-1.95, B.fZ, 0.58, mats.potWhite);
  plant(1.95, B.fZ, 0.58, mats.potWhite);
  plant(0, B.fZ + 1.9, 0.55, mats.potWhite);
  plant(-4.55, 2.35, 0.9, mats.pot);
  plant(4.55, 2.15, 0.95, mats.potWhite);
  plant(-4.45, 6.15, 0.8, mats.potWhite);
  plant(4.5, 6.25, 0.85, mats.pot);

  // --- 温馨办公区 ---
  const lobbyRug = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.02, 1.7), mats.kilim);
  lobbyRug.position.set(0, 0.055, 6.85);
  lobbyRug.receiveShadow = true;
  group.add(lobbyRug);
  sofa(0, 6.95, Math.PI, 2.45);
  lamp(-2.25, 6.75);
  lamp(2.25, 6.75);

  function addLabel(text, x, y, z, opts = {}) {
    const el = document.createElement("div");
    el.className = opts.scenic ? "plan-title" : "dept-tag is-empty";
    el.textContent = text;
    const obj = new CSS2DObject(el);
    obj.position.set(x, y, z);
    scene.add(obj);
    if (opts.id) deptLabels.push({ id: opts.id, label: text, el, scenic: !!opts.scenic });
  }

  addLabel("總裁辦公室", 0, 2.55, -10.55, { scenic: true, id: "总控" });
  addLabel("溫馨辦公區", 0, 2.15, 5.35, { scenic: true });
  for (const tag of DEPT_TAGS) addLabel(tag.label, tag.x, tag.y, tag.z, { id: tag.id });

  function pointInPoly(x, z, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0];
      const zi = poly[i][1];
      const xj = poly[j][0];
      const zj = poly[j][1];
      const intersect = zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi || 1e-6) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function roomOf(x, z) {
    if (x <= B.glassL && x >= B.serverX && z >= B.wsZ && z <= B.serverZ1) return "server";
    if (pointInPoly(x, z, ceoPoly)) return "ceo";
    if (x < B.glassL - 0.04 && x > B.west && z < B.south && z > B.north) {
      if (z < B.wsZ) return "research";
      if (z < B.confZ) return "conference";
      return "admin";
    }
    if (x > B.glassR + 0.04 && x < B.east && z < B.south && z > B.north) {
      if (z < B.rTopZ) return "content";
      if (z < B.loungeZ) return "lounge";
      return "ops";
    }
    return "atrium";
  }

  function pushPt(pts, x, z) {
    const last = pts[pts.length - 1];
    if (last && Math.hypot(last.x - x, last.z - z) < 0.12) return;
    pts.push({ x, z });
  }

  function atriumBetween(pts, x0, z0, x1, z1) {
    const lane0 = x0 >= 0 ? B.laneE : B.laneW;
    const lane1 = x1 >= 0 ? B.laneE : B.laneW;
    const clampZ = (z) => Math.max(B.laneN, Math.min(B.south - 0.85, z));
    pushPt(pts, lane0, clampZ(z0));
    if (lane0 !== lane1) {
      const crossZ = (z0 + z1) * 0.5 < B.fZ ? B.laneN : B.laneS;
      pushPt(pts, lane0, crossZ);
      pushPt(pts, lane1, crossZ);
    }
    pushPt(pts, lane1, clampZ(z1));
  }

  function route(x0, z0, x1, z1) {
    const pts = [];
    const a = roomOf(x0, z0);
    const b = roomOf(x1, z1);
    if (a === b) {
      pts.push({ x: x1, z: z1 });
      return pts;
    }
    let cx = x0;
    let cz = z0;
    if (a !== "atrium") {
      const p = PORTALS[a];
      for (const [x, z] of p.via) pushPt(pts, x, z);
      pushPt(pts, p.x, p.z);
      cx = p.x;
      cz = p.z;
    }
    if (b !== "atrium") {
      const p = PORTALS[b];
      atriumBetween(pts, cx, cz, p.x, p.z);
      pushPt(pts, p.x, p.z);
      for (let i = p.via.length - 1; i >= 0; i--) pushPt(pts, p.via[i][0], p.via[i][1]);
      pushPt(pts, x1, z1);
    } else {
      atriumBetween(pts, cx, cz, x1, z1);
      pushPt(pts, x1, z1);
    }
    return pts.length ? pts : [{ x: x1, z: z1 }];
  }

  function applyTheme(mode) {
    const pal = PAL[mode] || PAL.day;
    const night = mode === "night";
    mats.ground.color.setHex(pal.ground);
    mats.plinth.color.setHex(pal.plinth);
    mats.hall.color.set(night ? 0x8a8680 : 0xffffff);
    mats.oakFloor.color.set(night ? 0xa89880 : 0xffffff);
    mats.plaza.color.set(night ? 0x6e7278 : 0xd5d8dc);
    mats.wall.color.setHex(pal.wall);
    mats.wood.color.setHex(pal.wood);
    mats.woodDark.color.setHex(pal.woodDark);
    mats.frame.color.setHex(pal.frame);
    mats.olive.color.setHex(pal.olive);
    mats.glass.color.setHex(pal.glass);
    mats.glass.opacity = night ? 0.16 : 0.1;
    mats.stone.color.setHex(pal.stone);
    mats.stoneDark.color.setHex(pal.stoneDark);
    mats.stoneRim.color.setHex(pal.stone);
    mats.stoneRim.emissive.setHex(pal.water);
    mats.stoneRim.emissiveIntensity = night ? 0.7 : 0.18;
    mats.water.color.setHex(pal.water);
    mats.water.emissive.setHex(pal.waterDeep);
    mats.water.emissiveIntensity = night ? 0.85 : 0.35;
    mats.waterDeep.color.setHex(pal.waterDeep);
    mats.waterDeep.emissive.setHex(pal.waterDeep);
    mats.waterDeep.emissiveIntensity = night ? 0.55 : 0.2;
    mats.sheet.color.setHex(pal.water);
    mats.sheet.emissive.setHex(pal.waterDeep);
    mats.sheet.emissiveIntensity = night ? 0.75 : 0.28;
    mats.veil.color.setHex(pal.water);
    mats.veil.emissive.setHex(pal.waterDeep);
    mats.veil.emissiveIntensity = night ? 0.6 : 0.22;
    mats.spray.color.setHex(pal.foam);
    mats.spray.emissive.setHex(pal.water);
    mats.foamRing.color.setHex(pal.foam);
    fountain.sheetOpacity = night ? 0.5 : 0.4;
    fountain.veilOpacity = night ? 0.22 : 0.15;
    fountain.sprayGlow = night ? 1.15 : 0.55;
    fountain.rippleAlpha = night ? 0.75 : 0.5;
    for (const ripple of fountain.ripples) ripple.material.color.setHex(pal.foam);
    mats.lampShade.emissiveIntensity = night ? 1.2 : 0.14;
    mats.screen.emissiveIntensity = night ? 0.95 : 0.42;
    mats.screenGreen.emissiveIntensity = night ? 0.8 : 0.32;
    if (fountain.light) fountain.light.intensity = night ? 3.2 : 0.7;
    const lampIntensity = night ? 18 : 0;
    for (const lamp of lamps) {
      lamp.light.intensity = lampIntensity;
      if (lamp.shade?.material?.emissive) lamp.shade.material.emissiveIntensity = night ? 1.35 : 0.16;
      if (lamp.bulb?.material?.emissive) lamp.bulb.material.emissiveIntensity = night ? 1.7 : 0.35;
    }
    return pal;
  }

  function updateDeptCounts(counts) {
    for (const { id, label, el, scenic } of deptLabels) {
      const n = counts[id] || 0;
      if (scenic) {
        el.innerHTML = n > 0 ? `${label}<span class="n"> ✓${n}</span>` : label;
      } else {
        el.classList.toggle("is-empty", n <= 0);
        el.innerHTML = n > 0 ? `${label}<span class="n">✓${n}</span>` : label;
      }
    }
  }

  function tick(t) {
    const drops = fountain.drops;
    const mesh = fountain.dropMesh;
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      let u = (t * d.speed + d.phase) % 1;
      if (u < 0) u += 1;
      d.curve.getPoint(u, _tmp);
      const bulge = Math.sin(u * Math.PI);
      const fadeIn = u < 0.08 ? u / 0.08 : 1;
      const fadeOut = u > 0.8 ? 1 - (u - 0.8) / 0.2 : 1;
      const s = Math.max(0.001, d.base * (0.55 + 0.55 * bulge) * fadeIn * fadeOut);
      _dummy.position.copy(_tmp);
      _dummy.scale.setScalar(s);
      _dummy.rotation.set(0, 0, 0);
      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < fountain.ripples.length; i++) {
      const ripple = fountain.ripples[i];
      const u = (t * 0.32 + ripple.userData.slot) % 1;
      const s = 0.28 + u * 0.92;
      ripple.scale.set(s, s, s);
      ripple.material.opacity = (1 - u) * (1 - u) * fountain.rippleAlpha;
    }
    const sy = 0.82 + (Math.sin(t * 2.7) * 0.5 + 0.5) * 0.36;
    const jetMesh = fountain.jet;
    jetMesh.scale.y = sy;
    jetMesh.position.y = jetMesh.userData.foot + jetMesh.userData.half * sy;
    for (const veilMesh of fountain.veils) {
      veilMesh.rotation.y = t * veilMesh.userData.spin;
      const breathe = 1 + Math.sin(t * 1.6 + veilMesh.userData.pulse) * 0.03;
      veilMesh.scale.set(breathe, 1 + Math.sin(t * 2.2 + veilMesh.userData.pulse) * 0.04, breathe);
    }
    for (const surface of fountain.surfaces) {
      surface.position.y = surface.userData.baseY + Math.sin(t * 1.8 + surface.userData.phase) * 0.008;
    }
    mats.sheet.opacity = fountain.sheetOpacity * (0.82 + 0.18 * Math.sin(t * 2.2));
    mats.veil.opacity = fountain.veilOpacity * (0.75 + 0.25 * Math.sin(t * 1.5));
    mats.spray.emissiveIntensity = fountain.sprayGlow * (0.86 + 0.14 * Math.sin(t * 3.1));
  }

  return {
    group,
    mats,
    lamps,
    doors: [],
    route,
    roomOf,
    applyTheme,
    updateDeptCounts,
    tick,
  };
}
