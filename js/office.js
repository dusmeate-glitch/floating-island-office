import * as THREE from "three";
import { CSS2DObject } from "./vendor/CSS2DRenderer.js";
import { DEPT_TAGS } from "./config.js?v=campus2";

const PAL = {
  day: {
    clear: 0xd5e2e4,
    hemiSky: 0xfff6ea,
    hemiGround: 0xcbbba4,
    hemi: 0.74,
    sun: 0xfff1dc,
    sunIntensity: 2.05,
    sunPos: [16, 32, 14],
    ambient: 0.32,
    exposure: 1.06,
    floor: 0xf6efe4,
    slab: 0xe7d9c6,
    rug: 0xe8d7b8,
    wall: 0xf7f3ec,
    wood: 0xd8b07c,
    woodDark: 0xa07848,
    frame: 0x3a342e,
    glass: 0xd7e6f0,
    glassOpacity: 0.2,
    tile: 0xf3eadc,
    outside: 0xb7c6c4,
    building: 0xc5bfb4,
    pedestalTop: 0xf4f7f8,
    stone: 0xe3d9cc,
    stoneDark: 0xc4b5a4,
    water: 0x5eb6e6,
    waterDeep: 0x2f86b8,
    foam: 0xf3fbff,
    olive: 0x6e7154,
  },
  night: {
    clear: 0x26241f,
    hemiSky: 0x8a7d68,
    hemiGround: 0x2a241c,
    hemi: 0.38,
    sun: 0xc4b89a,
    sunIntensity: 0.28,
    sunPos: [10, 22, 12],
    ambient: 0.16,
    exposure: 0.94,
    floor: 0x3a342c,
    slab: 0x2e2924,
    rug: 0x4a4338,
    wall: 0xe6dccb,
    wood: 0xb08958,
    woodDark: 0x6f5233,
    frame: 0x2a2622,
    glass: 0x9ec0d4,
    glassOpacity: 0.16,
    tile: 0x3a342c,
    outside: 0x16181c,
    building: 0x3a3834,
    pedestalTop: 0xd5dde4,
    stone: 0xc9d3dc,
    stoneDark: 0x9aabb6,
    water: 0x8ad4ff,
    waterDeep: 0x3d94d4,
    foam: 0xe5f5ff,
    olive: 0x545842,
  },
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

function woodTexture(kind = "oak") {
  return makeTexture((g, w, h) => {
    if (kind === "night-tile") {
      g.fillStyle = "#2a261f";
      g.fillRect(0, 0, w, h);
      const size = 128;
      for (let y = 0; y < 4; y++) {
        for (let x = 0; x < 4; x++) {
          const shade = 48 + ((x + y) % 2) * 8 + ((x * 3 + y) % 4);
          g.fillStyle = `rgb(${shade + 6},${shade},${shade - 4})`;
          g.fillRect(x * size + 3, y * size + 3, size - 6, size - 6);
        }
      }
      return;
    }
    if (kind === "cream") {
      g.fillStyle = "#e5d9c8";
      g.fillRect(0, 0, w, h);
      const size = 256;
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 2; x++) {
          const n = ((x * 17 + y * 9) % 7) - 3;
          g.fillStyle = `rgb(${246 + n},${239 + n},${228 + n})`;
          g.fillRect(x * size + 4, y * size + 4, size - 8, size - 8);
        }
      }
      return;
    }
    g.fillStyle = "#f0e2c8";
    g.fillRect(0, 0, w, h);
    const rows = 4;
    const plankH = h / rows;
    for (let i = 0; i < rows; i++) {
      const y = i * plankH;
      g.fillStyle = i % 2 === 0 ? "#f3e6ce" : "#e7d3b0";
      g.fillRect(0, y + 1, w, plankH - 2);
      g.strokeStyle = "rgba(120, 86, 48, 0.16)";
      g.strokeRect(0.5, y + 0.5, w - 1, plankH - 1);
      g.strokeStyle = "rgba(140, 96, 50, 0.07)";
      g.beginPath();
      g.moveTo(30, y + plankH * 0.35);
      g.bezierCurveTo(120, y + 18, 220, y + plankH * 0.7, 360, y + plankH * 0.4);
      g.stroke();
    }
  });
}

function caneTexture() {
  return makeTexture((g, w, h) => {
    g.fillStyle = "#ead7b8";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#b58958";
    g.lineWidth = 2;
    for (let i = -8; i < 16; i++) {
      g.beginPath();
      g.moveTo(i * 12, 0);
      g.lineTo(i * 12 + w, h);
      g.stroke();
      g.beginPath();
      g.moveTo(i * 12, h);
      g.lineTo(i * 12 + w, 0);
      g.stroke();
    }
  }, 128, 128);
}

function rugTexture() {
  return makeTexture((g, w, h) => {
    g.fillStyle = "#f3e7d4";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#c46b45";
    g.lineWidth = 10;
    g.strokeRect(12, 12, w - 24, h - 24);
    g.strokeStyle = "#6e7356";
    g.lineWidth = 3;
    g.strokeRect(26, 26, w - 52, h - 52);
    for (let y = 48; y < h - 40; y += 36) {
      for (let x = 48; x < w - 40; x += 36) {
        g.fillStyle = (x + y) % 72 === 0 ? "#c46b45" : "#6e7356";
        g.globalAlpha = 0.85;
        g.beginPath();
        g.moveTo(x, y - 8);
        g.lineTo(x + 8, y);
        g.lineTo(x, y + 8);
        g.lineTo(x - 8, y);
        g.closePath();
        g.fill();
      }
    }
    g.globalAlpha = 1;
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
    sheetOpacity: 0.36,
    veilOpacity: 0.14,
    sprayGlow: 0.5,
    rippleAlpha: 0.5,
  };
  const _dummy = new THREE.Object3D();
  const _tmp = new THREE.Vector3();
  const deptLabels = [];

  const oakTex = woodTexture("oak");
  oakTex.repeat.set(3, 3);
  const creamTex = woodTexture("cream");
  creamTex.repeat.set(14, 12);
  const nightTileTex = woodTexture("night-tile");
  nightTileTex.repeat.set(10, 8);
  const caneTex = caneTexture();
  caneTex.repeat.set(2, 2);
  const rugTex = rugTexture();
  const artTex = artTexture();
  artTex.wrapS = artTex.wrapT = THREE.ClampToEdgeWrapping;

  const mats = {
    floor: new THREE.MeshStandardMaterial({ map: creamTex, roughness: 0.84, metalness: 0.02 }),
    slab: new THREE.MeshStandardMaterial({ color: PAL.day.slab, roughness: 0.86 }),
    wall: new THREE.MeshStandardMaterial({ color: PAL.day.wall, roughness: 0.9 }),
    wood: new THREE.MeshStandardMaterial({ color: PAL.day.wood, roughness: 0.62 }),
    woodDark: new THREE.MeshStandardMaterial({ color: PAL.day.woodDark, roughness: 0.7 }),
    frame: new THREE.MeshStandardMaterial({ color: PAL.day.frame, roughness: 0.42, metalness: 0.22 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: PAL.day.glass,
      transparent: true,
      opacity: 0.32,
      roughness: 0.12,
      metalness: 0.04,
      transmission: 0.18,
      thickness: 0.03,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    cream: new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.7 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf6f3ee, roughness: 0.55 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x2a2c30, roughness: 0.5 }),
    black: new THREE.MeshStandardMaterial({ color: 0x1a1c1f, roughness: 0.45 }),
    screen: new THREE.MeshStandardMaterial({ color: 0x7ec8ff, emissive: 0x2378b5, emissiveIntensity: 0.45, roughness: 0.3 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x2f6b45, roughness: 0.75 }),
    leafDeep: new THREE.MeshStandardMaterial({ color: 0x1f4d32, roughness: 0.8 }),
    pot: new THREE.MeshStandardMaterial({ color: 0xc2784e, roughness: 0.7 }),
    sofa: new THREE.MeshStandardMaterial({ color: 0x2f5a46, roughness: 0.72 }),
    cushion: new THREE.MeshStandardMaterial({ color: 0xc47a48, roughness: 0.7 }),
    leather: new THREE.MeshStandardMaterial({ color: 0xb85f32, roughness: 0.58 }),
    cardboard: new THREE.MeshStandardMaterial({ color: 0xc9a66b, roughness: 0.86 }),
    metal: new THREE.MeshStandardMaterial({ color: 0x8a9098, roughness: 0.35, metalness: 0.55 }),
    server: new THREE.MeshStandardMaterial({ color: 0x1c1f24, roughness: 0.4 }),
    pedTop: new THREE.MeshStandardMaterial({ color: PAL.day.pedestalTop, roughness: 0.35, metalness: 0.08 }),
    rugA: new THREE.MeshStandardMaterial({ map: oakTex, color: 0xffffff, roughness: 0.84 }),
    rugB: new THREE.MeshStandardMaterial({ color: 0xd5e0d2, roughness: 0.92 }),
    stone: new THREE.MeshStandardMaterial({
      color: PAL.day.stone,
      roughness: 0.58,
      metalness: 0.08,
      side: THREE.DoubleSide,
    }),
    stoneDark: new THREE.MeshStandardMaterial({
      color: PAL.day.stoneDark,
      roughness: 0.72,
      metalness: 0.04,
      side: THREE.DoubleSide,
    }),
    stoneRim: new THREE.MeshStandardMaterial({
      color: PAL.day.stone,
      emissive: PAL.day.water,
      emissiveIntensity: 0.12,
      roughness: 0.38,
      metalness: 0.22,
    }),
    water: new THREE.MeshPhysicalMaterial({
      color: PAL.day.water,
      emissive: PAL.day.waterDeep,
      emissiveIntensity: 0.22,
      transparent: true,
      opacity: 0.78,
      roughness: 0.06,
      metalness: 0.02,
      transmission: 0.18,
      thickness: 0.12,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    waterDeep: new THREE.MeshPhysicalMaterial({
      color: PAL.day.waterDeep,
      emissive: PAL.day.waterDeep,
      emissiveIntensity: 0.12,
      transparent: true,
      opacity: 0.9,
      roughness: 0.18,
      metalness: 0.02,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    sheet: new THREE.MeshPhysicalMaterial({
      color: PAL.day.water,
      emissive: PAL.day.waterDeep,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.36,
      roughness: 0.04,
      metalness: 0.02,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    veil: new THREE.MeshPhysicalMaterial({
      color: PAL.day.water,
      emissive: PAL.day.waterDeep,
      emissiveIntensity: 0.16,
      transparent: true,
      opacity: 0.14,
      roughness: 0.05,
      metalness: 0.0,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
    spray: new THREE.MeshStandardMaterial({
      color: PAL.day.foam,
      emissive: PAL.day.water,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.88,
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
    lampShade: new THREE.MeshStandardMaterial({ color: 0xf4efe4, emissive: 0xffe3b0, emissiveIntensity: 0.15, roughness: 0.55 }),
    lampPole: new THREE.MeshStandardMaterial({ color: 0x6a5340, roughness: 0.4, metalness: 0.35 }),
    olive: new THREE.MeshStandardMaterial({ color: PAL.day.olive, roughness: 0.92 }),
    wainscot: new THREE.MeshStandardMaterial({ color: 0x6a4932, roughness: 0.68 }),
    walnut: new THREE.MeshStandardMaterial({ color: 0x5c3e28, roughness: 0.52 }),
    walnutDark: new THREE.MeshStandardMaterial({ color: 0x3b291c, roughness: 0.6 }),
    leatherExec: new THREE.MeshStandardMaterial({ color: 0x241c18, roughness: 0.55 }),
    cane: new THREE.MeshStandardMaterial({ map: caneTex, roughness: 0.78 }),
    caneWood: new THREE.MeshStandardMaterial({ color: 0xc6a36a, roughness: 0.5 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xc6a15a, roughness: 0.32, metalness: 0.72 }),
    doorWood: new THREE.MeshStandardMaterial({ color: 0xe0c396, roughness: 0.52 }),
    blind: new THREE.MeshStandardMaterial({ color: 0xf7f4ee, roughness: 0.72, side: THREE.DoubleSide }),
    blindRail: new THREE.MeshStandardMaterial({ color: 0xd9d3c8, roughness: 0.55, metalness: 0.08 }),
    oakFloor: new THREE.MeshStandardMaterial({ map: oakTex, roughness: 0.78 }),
    kilim: new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.94 }),
    art: new THREE.MeshStandardMaterial({ map: artTex, roughness: 0.62 }),
  };

  themeables.push(
    { mat: mats.slab, key: "slab" },
    { mat: mats.wall, key: "wall" },
    { mat: mats.wood, key: "wood" },
    { mat: mats.woodDark, key: "woodDark" },
    { mat: mats.frame, key: "frame" },
    { mat: mats.pedTop, key: "pedestalTop" },
    { mat: mats.olive, key: "olive" },
  );

  const doors = [];
  const group = new THREE.Group();
  scene.add(group);
  const slatGeo = new THREE.BoxGeometry(0.2, 0.018, 1);
  const railGeo = new THREE.BoxGeometry(0.1, 0.07, 1);

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

  function cyl(mat, rTop, rBot, h, x, y, z, segs = 24, shadow = true) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, segs), mat);
    mesh.position.set(x, y, z);
    if (shadow) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
    group.add(mesh);
    return mesh;
  }

  const floor = new THREE.Mesh(new THREE.BoxGeometry(42, 0.18, 36), mats.floor);
  floor.position.set(0, -0.09, 0);
  floor.receiveShadow = true;
  group.add(floor);

  const slab = box(mats.slab, 44, 0.7, 38, 0, -0.53, 0);
  slab.castShadow = false;

  // Outside city blocks
  for (const [x, z, w, d, h] of [
    [-28, -16, 6, 8, 10],
    [-30, 8, 5, 10, 14],
    [29, -12, 6, 8, 12],
    [30, 10, 5, 9, 8],
    [2, -28, 12, 5, 11],
  ]) {
    const b = box(new THREE.MeshStandardMaterial({ color: PAL.day.building, roughness: 0.9 }), w, h, d, x, h / 2 - 0.4, z, 0, 0, 0, false);
    themeables.push({ mesh: b, dayColor: PAL.day.building, nightColor: PAL.night.building });
  }

  function glassWall(x1, z1, x2, z2, height = 2.55, doorAt = null, doorW = 1.45) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const ry = Math.atan2(dx, dz);
    const cx = (x1 + x2) / 2;
    const cz = (z1 + z2) / 2;
    const segments = [];
    if (doorAt == null) {
      segments.push([0, len]);
    } else {
      const d0 = Math.max(0, doorAt - doorW / 2);
      const d1 = Math.min(len, doorAt + doorW / 2);
      if (d0 > 0.05) segments.push([0, d0]);
      if (d1 < len - 0.05) segments.push([d1, len]);
    }
    for (const [a, b] of segments) {
      const sl = b - a;
      const t = (a + b) / 2 / len - 0.5;
      const px = cx + Math.sin(ry) * t * len;
      const pz = cz + Math.cos(ry) * t * len;
      const pane = box(mats.glass, 0.03, height - 0.12, sl - 0.02, px, height / 2 + 0.01, pz, 0, ry, 0, false);
      pane.renderOrder = 2;
      box(mats.frame, 0.045, 0.045, sl, px, 0.045, pz, 0, ry, 0, false);
      box(mats.frame, 0.045, 0.05, sl, px, height - 0.04, pz, 0, ry, 0, false);
      const posts = Math.max(2, Math.round(sl / 1.6) + 1);
      for (let i = 0; i < posts; i++) {
        const u = i / (posts - 1) - 0.5;
        const qx = px + Math.sin(ry) * u * sl;
        const qz = pz + Math.cos(ry) * u * sl;
        box(mats.frame, 0.048, height, 0.048, qx, height / 2, qz, 0, ry, 0, false);
      }
      if (sl > 0.45) addBlinds(px, pz, ry, sl, height);
    }
  }

  function addBlinds(px, pz, ry, length, height) {
    const g = new THREE.Group();
    g.position.set(px, 0, pz);
    g.rotation.y = ry;
    const rail = new THREE.Mesh(railGeo, mats.blindRail);
    rail.scale.z = Math.max(0.12, length - 0.04);
    rail.position.set(0.06, height - 0.18, 0);
    g.add(rail);
    const top = height - 0.34;
    const bottom = Math.max(0.42, height * 0.32);
    for (let y = top; y > bottom; y -= 0.26) {
      const slat = new THREE.Mesh(slatGeo, mats.blind);
      slat.scale.z = Math.max(0.1, length - 0.1);
      slat.position.set(0.08, y, 0);
      slat.rotation.z = 0.85;
      g.add(slat);
    }
    group.add(g);
  }

  function makeDoor(hx, hz, ry, opt = {}) {
    const width = opt.width ?? 1.05;
    const swing = opt.swing ?? 1.42;
    const height = opt.height ?? 2.2;
    const wallH = opt.wallH ?? 2.55;
    const frame = new THREE.Group();
    frame.position.set(hx, 0, hz);
    frame.rotation.y = ry;
    const jambGeo = new THREE.BoxGeometry(0.07, wallH, 0.06);
    const jambL = new THREE.Mesh(jambGeo, mats.frame);
    jambL.position.set(0.02, wallH / 2, 0);
    frame.add(jambL);
    const jambR = new THREE.Mesh(jambGeo, mats.frame);
    jambR.position.set(0.02, wallH / 2, width);
    frame.add(jambR);
    const header = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, width), mats.frame);
    header.position.set(0.02, height + 0.035, width / 2);
    frame.add(header);
    if (wallH - height > 0.16) {
      const transom = new THREE.Mesh(
        new THREE.BoxGeometry(0.025, wallH - height - 0.12, Math.max(0.2, width - 0.08)),
        mats.glass
      );
      transom.position.set(0.03, (wallH + height) / 2, width / 2);
      transom.renderOrder = 2;
      frame.add(transom);
    }
    const sill = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.025, width), mats.doorWood);
    sill.position.set(0.02, 0.02, width / 2);
    frame.add(sill);
    group.add(frame);

    const pivot = new THREE.Group();
    pivot.position.set(hx, 0, hz);
    pivot.rotation.y = ry;
    const panelDepth = Math.max(0.4, width - 0.1);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.045, height - 0.08, panelDepth), mats.doorWood);
    panel.position.set(0.045, height / 2, width / 2);
    panel.castShadow = true;
    pivot.add(panel);
    const liteH = (height - 0.08) * 0.58;
    const lite = new THREE.Mesh(new THREE.BoxGeometry(0.02, liteH, panelDepth * 0.72), mats.glass);
    lite.position.set(0.07, height * 0.6, width / 2);
    lite.renderOrder = 2;
    pivot.add(lite);
    const pull = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.32, 0.035), mats.frame);
    pull.position.set(0.08, 1.05, width - 0.14);
    pivot.add(pull);
    group.add(pivot);

    const door = {
      id: opt.id,
      rooms: opt.rooms || [],
      primary: !!opt.primary,
      pivot,
      baseRy: ry,
      swing,
      open: 0,
      x: hx + Math.sin(ry) * (width / 2),
      z: hz + Math.cos(ry) * (width / 2),
      width,
    };
    doors.push(door);
    return door;
  }

  function placeDoorOnWall(x1, z1, x2, z2, doorAt, doorW, id, rooms, primary = false, wallH = 2.55, openToward = [0, 0]) {
    const len = Math.hypot(x2 - x1, z2 - z1);
    const dx = (x2 - x1) / len;
    const dz = (z2 - z1) / len;
    const ry = Math.atan2(dx, dz);
    const inset = 0.04;
    const hDist = doorAt - doorW / 2 + inset;
    const hx = x1 + dx * hDist;
    const hz = z1 + dz * hDist;
    const width = doorW - inset * 2;
    const nx = Math.cos(ry);
    const nz = -Math.sin(ry);
    const cx = hx + Math.sin(ry) * (width / 2);
    const cz = hz + Math.cos(ry) * (width / 2);
    const outward = (openToward[0] - cx) * nx + (openToward[1] - cz) * nz;
    return makeDoor(hx, hz, ry, {
      width,
      id,
      rooms,
      primary,
      wallH,
      swing: outward >= 0 ? 1.5 : -1.5,
    });
  }

  function solidWall(x1, z1, x2, z2, height = 2.55) {
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    const ry = Math.atan2(dx, dz);
    box(mats.wall, 0.16, height, len, (x1 + x2) / 2, height / 2, (z1 + z2) / 2, 0, ry);
  }

  function plant(x, z, scale = 1) {
    const g = new THREE.Group();
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.22 * scale, 0.22 * scale, 12), mats.pot);
    pot.position.y = 0.11 * scale;
    pot.castShadow = true;
    g.add(pot);
    const dirt = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * scale, 0.15 * scale, 0.04, 12), mats.woodDark);
    dirt.position.y = 0.22 * scale;
    g.add(dirt);
    const leafMat = Math.random() > 0.45 ? mats.leaf : mats.leafDeep;
    const blobs = 3 + Math.floor(Math.random() * 2);
    for (let i = 0; i < blobs; i++) {
      const s = (0.28 + Math.random() * 0.22) * scale;
      const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), leafMat);
      leaf.position.set((Math.random() - 0.5) * 0.16 * scale, (0.42 + i * 0.16) * scale, (Math.random() - 0.5) * 0.16 * scale);
      leaf.rotation.set(Math.random(), Math.random(), Math.random());
      leaf.castShadow = true;
      g.add(leaf);
    }
    g.position.set(x, 0, z);
    group.add(g);
    return g;
  }

  function bookshelf(x, z, ry = 0, w = 1.7, h = 2.15) {
    const g = new THREE.Group();
    const back = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.05), mats.wood);
    back.position.set(0, h / 2, -0.15);
    back.castShadow = true;
    g.add(back);
    for (const sx of [-w / 2 + 0.03, w / 2 - 0.03]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, 0.32), mats.wood);
      side.position.set(sx, h / 2, 0);
      side.castShadow = true;
      g.add(side);
    }
    const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, 0.32), mats.wood);
    top.position.set(0, h - 0.03, 0);
    g.add(top);
    const colors = [0xb8573a, 0x3d5a80, 0xd6b25e, 0x6a994e, 0x7b2d26, 0x4361ee, 0xc9ada7];
    for (let row = 0; row < 4; row++) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(w - 0.08, 0.04, 0.3), mats.woodDark);
      shelf.position.y = 0.28 + row * 0.48;
      g.add(shelf);
      let cursor = -w / 2 + 0.14;
      while (cursor < w / 2 - 0.18) {
        const bw = 0.09 + Math.random() * 0.08;
        const bh = 0.28 + Math.random() * 0.12;
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(bw, bh, 0.22),
          new THREE.MeshStandardMaterial({ color: colors[Math.floor(Math.random() * colors.length)], roughness: 0.7 })
        );
        book.position.set(cursor + bw / 2, 0.3 + row * 0.48 + bh / 2, 0);
        g.add(book);
        cursor += bw + 0.015;
      }
    }
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    group.add(g);
  }

  function desk(x, z, ry = 0, withPc = true) {
    const g = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.07, 0.78), mats.wood);
    top.position.y = 0.74;
    top.castShadow = true;
    top.receiveShadow = true;
    g.add(top);
    for (const [lx, lz] of [[-0.65, -0.3], [0.65, -0.3], [-0.65, 0.3], [0.65, 0.3]]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.71, 0.07), mats.woodDark);
      leg.position.set(lx, 0.355, lz);
      leg.castShadow = true;
      g.add(leg);
    }
    if (withPc) {
      const screen = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.38, 0.04), mats.dark);
      screen.position.set(0, 1.08, -0.22);
      g.add(screen);
      const glow = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.32, 0.02), mats.screen);
      glow.position.set(0, 1.08, -0.198);
      g.add(glow);
      const neck = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.06), mats.metal);
      neck.position.set(0, 0.86, -0.22);
      g.add(neck);
      const kb = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 0.16), mats.dark);
      kb.position.set(0.08, 0.79, 0.12);
      g.add(kb);
    }
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    group.add(g);
  }

  function chair(x, z, ry = 0, mat = mats.dark) {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.07, 0.46), mat);
    seat.position.y = 0.46;
    seat.castShadow = true;
    g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.5, 0.07), mat);
    back.position.set(0, 0.74, -0.2);
    back.castShadow = true;
    g.add(back);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), mats.metal);
    pole.position.y = 0.24;
    g.add(pole);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.05, 10), mats.metal);
    base.position.y = 0.04;
    g.add(base);
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    group.add(g);
  }

  function execChair(x, z, ry = 0) {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.5), mats.leatherExec);
    seat.position.y = 0.5;
    seat.castShadow = true;
    g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.64, 0.08), mats.leatherExec);
    back.position.set(0, 0.86, -0.22);
    back.castShadow = true;
    g.add(back);
    for (const sx of [-0.28, 0.28]) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.24, 0.05), mats.walnut);
      post.position.set(sx, 0.58, 0.08);
      g.add(post);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.045, 0.34), mats.walnut);
      arm.position.set(sx, 0.68, -0.02);
      g.add(arm);
    }
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.4, 10), mats.metal);
    pole.position.y = 0.26;
    g.add(pole);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.045, 8), mats.metal);
    base.position.y = 0.04;
    g.add(base);
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    group.add(g);
  }

  function caneChair(x, z, ry = 0) {
    const g = new THREE.Group();
    const wood = mats.caneWood;
    for (const [lx, lz] of [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.46, 6), wood);
      leg.position.set(lx, 0.23, lz);
      leg.rotation.z = lx * 0.35;
      leg.rotation.x = -lz * 0.35;
      g.add(leg);
    }
    const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.04, 16), mats.cane);
    seat.position.y = 0.48;
    seat.castShadow = true;
    g.add(seat);
    for (const sx of [-0.15, 0.15]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.018, 0.4, 6), wood);
      post.position.set(sx, 0.66, -0.15);
      g.add(post);
    }
    const rail = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.02, 6, 14, Math.PI), wood);
    rail.position.set(0, 0.92, -0.16);
    rail.rotation.z = Math.PI;
    g.add(rail);
    const splat = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.015, 0.28, 6), wood);
    splat.position.set(0, 0.64, -0.15);
    g.add(splat);
    for (const [sx, rz] of [[-0.06, 0.65], [0.06, -0.65]]) {
      const yoke = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 5), wood);
      yoke.position.set(sx, 0.78, -0.15);
      yoke.rotation.z = rz;
      g.add(yoke);
    }
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    group.add(g);
  }

  function sofa(x, z, ry = 0, w = 2.3) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.38, 0.78), mats.sofa);
    base.position.y = 0.32;
    base.castShadow = true;
    g.add(base);
    const back = new THREE.Mesh(new THREE.BoxGeometry(w, 0.48, 0.16), mats.sofa);
    back.position.set(0, 0.62, -0.32);
    back.castShadow = true;
    g.add(back);
    for (const sx of [-w / 2 + 0.08, w / 2 - 0.08]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.78), mats.sofa);
      arm.position.set(sx, 0.52, 0);
      g.add(arm);
    }
    for (const cx of [-0.45, 0.35]) {
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.28), mats.cushion);
      cushion.position.set(cx, 0.56, 0.08);
      cushion.castShadow = true;
      g.add(cushion);
    }
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    group.add(g);
  }

  function loungeChair(x, z, ry = 0) {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.28, 0.62), mats.leather);
    seat.position.y = 0.34;
    seat.castShadow = true;
    g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.46, 0.14), mats.leather);
    back.position.set(0, 0.58, -0.24);
    back.castShadow = true;
    g.add(back);
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    group.add(g);
  }

  function tableRound(x, z, r = 0.55, h = 0.42) {
    cyl(mats.white, r, r, 0.06, x, h, z, 24);
    cyl(mats.woodDark, 0.07, 0.09, h - 0.03, x, (h - 0.03) / 2, z, 12);
  }

  function lamp(x, z) {
    const pole = cyl(mats.lampPole, 0.03, 0.04, 1.58, x, 0.8, z, 10);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.28, 20, 1, true), mats.lampShade);
    shade.position.set(x, 1.68, z);
    shade.rotation.x = Math.PI;
    shade.castShadow = false;
    group.add(shade);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xfff1d0, emissive: 0xffd7a0, emissiveIntensity: 0.4 })
    );
    bulb.position.set(x, 1.58, z);
    group.add(bulb);
    const light = new THREE.PointLight(0xffd4a2, 0, 14, 2);
    light.position.set(x, 1.55, z);
    scene.add(light);
    lamps.push({ light, shade, bulb });
    return pole;
  }

  function rug(x, z, w, d, mat) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.025, d), mat);
    m.position.set(x, 0.02, z);
    m.receiveShadow = true;
    group.add(m);
  }

  function monitorWall(x, z, ry = 0) {
    box(mats.dark, 1.6, 0.9, 0.06, x, 1.55, z, 0, ry);
    box(mats.screen, 1.46, 0.76, 0.03, x + Math.sin(ry) * 0.02, 1.55, z + Math.cos(ry) * 0.02, 0, ry, 0, false);
  }

  function cardboard(x, z, w = 0.55, h = 0.4, d = 0.45) {
    box(mats.cardboard, w, h, d, x, h / 2, z);
  }

  function filing(x, z, ry = 0) {
    const cab = box(mats.cream, 0.72, 1.15, 0.42, x, 0.575, z, 0, ry);
    for (let i = 0; i < 3; i++) {
      box(mats.white, 0.62, 0.08, 0.02, x + Math.sin(ry) * 0.22, 0.28 + i * 0.32, z + Math.cos(ry) * 0.22, 0, ry, 0, false);
    }
    return cab;
  }

  function serverRack(x, z) {
    box(mats.server, 0.86, 1.9, 0.62, x, 0.95, z);
    for (let i = 0; i < 8; i++) {
      const led = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.04, 0.02),
        new THREE.MeshStandardMaterial({
          color: i % 3 === 0 ? 0x3dff8a : 0x4cc3ff,
          emissive: i % 3 === 0 ? 0x1fa85a : 0x2378b5,
          emissiveIntensity: 0.8,
        })
      );
      led.position.set(x + 0.28, 0.3 + i * 0.18, z + 0.32);
      group.add(led);
    }
  }

  function coffeeBar(x, z, ry = 0) {
    box(mats.woodDark, 2.2, 0.95, 0.62, x, 0.475, z, 0, ry);
    box(mats.wood, 2.28, 0.06, 0.7, x, 0.98, z, 0, ry);
    box(mats.dark, 0.32, 0.28, 0.28, x - 0.5, 1.2, z, 0, ry);
    box(mats.metal, 0.18, 0.22, 0.18, x - 0.15, 1.16, z);
    cyl(mats.white, 0.07, 0.06, 0.1, x + 0.45, 1.08, z, 12);
  }

  // Outer glass envelope. Front (near camera, +Z) has the campus entrance.
  glassWall(-18, -15, 18, -15, 2.7);
  glassWall(-18, 15, 18, 15, 2.7, 18, 1.55);
  glassWall(-18, -15, -18, 15, 2.7);
  glassWall(18, -15, 18, 15, 2.7);
  placeDoorOnWall(-18, 15, 18, 15, 18, 1.55, "entrance", ["atrium", "outside"], false, 2.7, [0, 22]);

  // --- 研究部 (left-top) ---
  glassWall(-17.2, -14.2, -7.1, -14.2, 2.55);
  glassWall(-17.2, -14.2, -17.2, -3.6, 2.55);
  glassWall(-17.2, -3.6, -7.1, -3.6, 2.55, 5.2);
  glassWall(-7.1, -14.2, -7.1, -3.6, 2.55, 6.4);
  rug(-12.2, -8.8, 8.6, 8.8, mats.rugA);
  desk(-14.3, -11.4, 0);
  chair(-14.3, -10.55, 0);
  desk(-10.2, -11.4, 0);
  chair(-10.2, -10.55, 0);
  desk(-12.35, -9.15, Math.PI / 2);
  chair(-11.5, -9.15, Math.PI / 2);
  bookshelf(-16.5, -12.8, Math.PI / 2, 1.5, 2.05);
  plant(-8.0, -13.4, 1.05);
  plant(-16.4, -4.5, 0.9);
  placeDoorOnWall(-17.2, -3.6, -7.1, -3.6, 5.2, 1.45, "research-south", ["research", "atrium"], false);
  placeDoorOnWall(-7.1, -14.2, -7.1, -3.6, 6.4, 1.45, "research-east", ["research", "atrium"], true);

  // server closet between research and conference
  solidWall(-17.2, -3.55, -14.3, -3.55, 2.55);
  solidWall(-14.3, -3.55, -14.3, -0.78, 2.55);
  solidWall(-17.2, -0.78, -16.42, -0.78, 2.55);
  solidWall(-15.02, -0.78, -14.3, -0.78, 2.55);
  placeDoorOnWall(-17.2, -0.78, -14.3, -0.78, 1.48, 1.4, "server-south", ["server", "atrium"], true);
  serverRack(-15.8, -2.15);
  serverRack(-15.75, -1.25);
  plant(-14.7, -0.95, 0.75);

  // --- 行政 / 会议室 (left-bottomish) ---
  glassWall(-17.2, -0.55, -7.15, -0.55, 2.55, 6.4);
  glassWall(-17.2, -0.55, -17.2, 8.6, 2.55);
  glassWall(-17.2, 8.6, -7.15, 8.6, 2.55);
  glassWall(-7.15, -0.55, -7.15, 8.6, 2.55, 4.4);
  rug(-12.2, 4.0, 8.5, 7.6, mats.rugA);
  box(mats.wood, 3.15, 0.08, 1.15, -12.15, 0.74, 3.7);
  for (const [lx, lz] of [[-13.3, 3.15], [-12.15, 3.15], [-11.0, 3.15], [-13.3, 4.25], [-12.15, 4.25], [-11.0, 4.25]]) {
    box(mats.woodDark, 0.07, 0.7, 0.07, lx, 0.35, lz);
  }
  for (const [cx, cz, cry] of [
    [-13.35, 2.55, 0],
    [-12.15, 2.55, 0],
    [-10.95, 2.55, 0],
    [-13.35, 4.85, Math.PI],
    [-12.15, 4.85, Math.PI],
    [-10.95, 4.85, Math.PI],
  ]) {
    chair(cx, cz, cry, mats.dark);
  }
  monitorWall(-16.7, 3.7, Math.PI / 2);
  desk(-12.4, 2.35, Math.PI / 2);
  chair(-11.55, 2.35, Math.PI / 2);
  plant(-8.0, 7.8, 0.95);
  plant(-16.4, 7.7, 0.8);
  placeDoorOnWall(-17.2, -0.55, -7.15, -0.55, 6.4, 1.45, "admin-north", ["admin", "atrium"], false);
  placeDoorOnWall(-7.15, -0.55, -7.15, 8.6, 4.4, 1.45, "admin-east", ["admin", "atrium"], true);

  // --- 总裁办公室 (private bay) ---
  // Outline runs from the olive back wall, around the glass bay, with a south door.
  const ceoPoly = [
    [-3.9, -14.42],
    [-5.05, -13.05],
    [-5.25, -10.85],
    [-4.45, -8.85],
    [-0.62, -7.32],
    [0.62, -7.32],
    [4.45, -8.85],
    [5.25, -10.85],
    [5.05, -13.05],
    [3.9, -14.42],
  ];
  const ceoShape = new THREE.Shape();
  ceoShape.moveTo(ceoPoly[0][0], -ceoPoly[0][1]);
  for (let i = 1; i < ceoPoly.length; i++) ceoShape.lineTo(ceoPoly[i][0], -ceoPoly[i][1]);
  ceoShape.closePath();
  const ceoFloor = new THREE.Mesh(new THREE.ShapeGeometry(ceoShape), mats.oakFloor);
  ceoFloor.rotation.x = -Math.PI / 2;
  ceoFloor.position.y = 0.025;
  ceoFloor.receiveShadow = true;
  group.add(ceoFloor);

  const backZ = -14.42;
  const winW = 1.18;
  const winH = 1.22;
  const winY = 1.52;
  const winTop = winY + winH / 2;
  box(mats.wainscot, 7.72, 0.86, 0.08, 0, 0.43, backZ + 0.02);
  box(mats.olive, 7.8, 2.62 - winTop, 0.14, 0, (winTop + 2.62) / 2, backZ);
  for (const [x0, x1] of [[-3.9, -2.48 - winW / 2], [-2.48 + winW / 2, 2.48 - winW / 2], [2.48 + winW / 2, 3.9]]) {
    const w = x1 - x0;
    box(mats.olive, w, winTop - 0.7, 0.14, (x0 + x1) / 2, (0.7 + winTop) / 2, backZ);
  }
  for (const wx of [-2.48, 2.48]) {
    box(mats.walnutDark, winW, 0.06, 0.07, wx, winY + winH / 2 - 0.03, backZ + 0.02);
    box(mats.walnutDark, winW, 0.06, 0.07, wx, winY - winH / 2 + 0.03, backZ + 0.02);
    box(mats.walnutDark, 0.06, winH, 0.07, wx - winW / 2 + 0.03, winY, backZ + 0.02);
    box(mats.walnutDark, 0.06, winH, 0.07, wx + winW / 2 - 0.03, winY, backZ + 0.02);
    const pane = box(mats.glass, winW - 0.12, winH - 0.12, 0.025, wx, winY, backZ + 0.04, 0, 0, 0, false);
    pane.renderOrder = 2;
    for (let c = 1; c < 3; c++) {
      box(mats.walnut, 0.028, winH - 0.12, 0.03, wx - winW / 2 + (winW * c) / 3, winY, backZ + 0.06, 0, 0, 0, false);
    }
    for (let r = 1; r < 4; r++) {
      box(mats.walnut, winW - 0.12, 0.026, 0.03, wx, winY - winH / 2 + (winH * r) / 4, backZ + 0.06, 0, 0, 0, false);
    }
    for (let y = winY + winH / 2 - 0.16; y > winY - winH / 2 + 0.08; y -= 0.18) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(winW - 0.18, 0.02, 0.16), mats.blind);
      slat.position.set(wx, y, backZ + 0.12);
      slat.rotation.x = -0.7;
      group.add(slat);
    }
  }
  box(mats.walnutDark, 1.62, 1.02, 0.04, 0.05, 1.78, backZ + 0.09);
  const canvas = box(mats.art, 1.48, 0.88, 0.02, 0.05, 1.78, backZ + 0.12, 0, 0, 0, false);
  canvas.castShadow = false;

  for (const sx of [-1.15, 1.22]) {
    box(mats.brass, 0.1, 0.18, 0.04, sx, 1.72, backZ + 0.1, 0, 0, 0, false);
    const shade = box(mats.lampShade, 0.18, 0.1, 0.1, sx, 1.66, backZ + 0.16, 0, 0, 0, false);
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xfff1d0, emissive: 0xffd7a0, emissiveIntensity: 0.7 })
    );
    bulb.position.set(sx, 1.66, backZ + 0.16);
    group.add(bulb);
    const light = new THREE.PointLight(0xffd2a0, 0, 6.5, 2);
    light.position.set(sx, 1.7, backZ + 0.35);
    scene.add(light);
    lamps.push({ light, shade, bulb });
  }

  for (let i = 0; i < ceoPoly.length - 1; i++) {
    if (i === 4) continue;
    const [x1, z1] = ceoPoly[i];
    const [x2, z2] = ceoPoly[i + 1];
    glassWall(x1, z1, x2, z2, 2.58);
  }
  placeDoorOnWall(-0.62, -7.32, 0.62, -7.32, 0.62, 1.24, "ceo", ["ceo", "atrium"], true, 2.58);

  const kilim = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.02, 3.15), mats.kilim);
  kilim.position.set(0.05, 0.04, -11.15);
  kilim.receiveShadow = true;
  group.add(kilim);

  box(mats.walnut, 2.15, 0.08, 0.82, 0.22, 0.76, -11.42);
  box(mats.walnutDark, 2.15, 0.62, 0.08, 0.22, 0.32, -11.78);
  box(mats.walnut, 0.62, 0.08, 1.2, -1.02, 0.76, -10.72);
  box(mats.walnutDark, 0.08, 0.7, 1.2, -1.28, 0.36, -10.72);
  for (const [lx, lz] of [[-0.7, -11.72], [1.15, -11.72], [1.15, -11.1], [-0.78, -10.28]]) {
    box(mats.walnutDark, 0.07, 0.7, 0.07, lx, 0.35, lz);
  }
  box(mats.dark, 0.05, 0.36, 0.56, -1.08, 1.08, -10.95);
  box(mats.screen, 0.018, 0.3, 0.5, -1.045, 1.08, -10.95, 0, 0, 0, false);
  box(mats.frame, 0.16, 0.05, 0.22, 0.35, 0.82, -11.15);
  box(mats.white, 0.28, 0.012, 0.2, 0.55, 0.81, -11.22);
  cyl(mats.brass, 0.07, 0.05, 0.1, 0.95, 0.86, -11.25, 10);
  const bank = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8, 0, Math.PI), mats.walnutDark);
  bank.position.set(-0.35, 0.9, -11.2);
  bank.rotation.z = Math.PI / 2;
  group.add(bank);

  execChair(0.08, -12.18, 0);
  caneChair(-0.62, -10.42, Math.PI);
  caneChair(0.78, -10.38, Math.PI);

  box(mats.walnut, 1.85, 0.7, 0.42, 1.55, 0.35, -14.05);
  box(mats.walnutDark, 1.92, 0.05, 0.48, 1.55, 0.72, -14.05);
  box(mats.brass, 0.42, 0.015, 0.02, 1.15, 0.4, -13.82, 0, 0, 0, false);
  box(mats.brass, 0.42, 0.015, 0.02, 1.95, 0.4, -13.82, 0, 0, 0, false);
  cyl(mats.brass, 0.06, 0.08, 0.26, 2.15, 0.9, -14.02, 8);
  const credenzaShade = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.12, 12), mats.lampShade);
  credenzaShade.position.set(2.15, 1.08, -14.02);
  group.add(credenzaShade);
  const credenzaBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xfff1d0, emissive: 0xffd7a0, emissiveIntensity: 0.55 })
  );
  credenzaBulb.position.set(2.15, 1.02, -14.02);
  group.add(credenzaBulb);
  const credenzaLight = new THREE.PointLight(0xffd2a0, 0, 5.5, 2);
  credenzaLight.position.set(2.15, 1.15, -13.7);
  scene.add(credenzaLight);
  lamps.push({ light: credenzaLight, shade: credenzaShade, bulb: credenzaBulb });
  box(new THREE.MeshStandardMaterial({ color: 0x8d3d32, roughness: 0.7 }), 0.16, 0.09, 0.12, 0.95, 0.8, -14.02);
  box(new THREE.MeshStandardMaterial({ color: 0x2f4f62, roughness: 0.7 }), 0.14, 0.11, 0.12, 1.15, 0.81, -14.02);
  box(new THREE.MeshStandardMaterial({ color: 0xc4a15a, roughness: 0.7 }), 0.12, 0.08, 0.11, 1.32, 0.79, -14.02);

  plant(-3.55, -13.35, 0.95);
  plant(3.45, -13.25, 0.9);
  plant(-4.15, -9.15, 0.8);

  // --- 内容部 (right-top) ---
  glassWall(7.15, -14.2, 17.2, -14.2, 2.55);
  glassWall(17.2, -14.2, 17.2, -3.55, 2.55);
  glassWall(7.15, -3.55, 17.2, -3.55, 2.55, 4.4);
  glassWall(7.15, -14.2, 7.15, -3.55, 2.55, 6.5);
  rug(12.2, -8.85, 8.6, 8.8, mats.rugA);
  desk(10.15, -11.5, 0);
  chair(10.15, -10.65, 0);
  desk(14.3, -11.5, 0);
  chair(14.3, -10.65, 0);
  desk(12.15, -9.2, -Math.PI / 2);
  chair(13.0, -9.2, -Math.PI / 2);
  cardboard(15.9, -5.0, 0.6, 0.42, 0.5);
  cardboard(16.15, -5.55, 0.48, 0.55, 0.4);
  cardboard(15.45, -5.6, 0.42, 0.32, 0.38);
  cardboard(16.3, -4.4, 0.5, 0.36, 0.46);
  plant(8.05, -13.4, 1.0);
  plant(16.4, -13.5, 0.85);
  placeDoorOnWall(7.15, -3.55, 17.2, -3.55, 4.4, 1.45, "content-south", ["content", "atrium"], false);
  placeDoorOnWall(7.15, -14.2, 7.15, -3.55, 6.5, 1.45, "content-west", ["content", "atrium"], true);

  // --- 运营部 (right-bottom) ---
  glassWall(7.15, -0.4, 17.2, -0.4, 2.55, 4.0);
  glassWall(17.2, -0.4, 17.2, 9.3, 2.55);
  glassWall(7.15, 9.3, 17.2, 9.3, 2.55);
  glassWall(7.15, -0.4, 7.15, 9.3, 2.55, 5.2);
  rug(12.2, 4.45, 8.6, 8.3, mats.rugA);
  coffeeBar(12.3, 0.85);
  sofa(14.5, 3.15, -Math.PI / 2, 1.8);
  loungeChair(13.15, 2.35, 0.4);
  desk(12.35, 5.15, -Math.PI / 2);
  chair(13.2, 5.15, -Math.PI / 2);
  desk(15.4, 7.5, Math.PI);
  chair(15.4, 6.7, Math.PI);
  filing(9.0, 8.15);
  filing(9.85, 8.15);
  filing(10.7, 8.15);
  filing(9.0, 7.45);
  filing(9.85, 7.45);
  plant(16.35, 8.55, 0.95);
  plant(8.05, 0.2, 0.85);
  placeDoorOnWall(7.15, -0.4, 17.2, -0.4, 4.0, 1.45, "ops-north", ["ops", "atrium"], false);
  placeDoorOnWall(7.15, -0.4, 7.15, 9.3, 5.2, 1.45, "ops-west", ["ops", "atrium"], true);

  // --- Central fountain on the round pedestal ---
  const ped = new THREE.Group();
  const pedBody = new THREE.Mesh(new THREE.CylinderGeometry(2.35, 2.45, 0.58, 48), mats.wood);
  pedBody.position.y = 0.29;
  pedBody.castShadow = true;
  pedBody.receiveShadow = true;
  ped.add(pedBody);
  const pedTop = new THREE.Mesh(new THREE.CylinderGeometry(2.28, 2.28, 0.06, 48), mats.pedTop);
  pedTop.position.y = 0.6;
  pedTop.receiveShadow = true;
  ped.add(pedTop);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.55, 0.025, 10, 64),
    new THREE.MeshStandardMaterial({ color: 0x9ad8ff, emissive: 0x4cc3ff, emissiveIntensity: 0.7 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.64;
  ped.add(ring);
  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.42, 0.02, 8, 64),
    new THREE.MeshStandardMaterial({ color: 0xffd79a, emissive: 0xe0b060, emissiveIntensity: 0.45 })
  );
  ring2.rotation.x = Math.PI / 2;
  ring2.position.y = 0.04;
  ped.add(ring2);
  ped.position.set(0, 0, 0);
  group.add(ped);

  const fountainRoot = new THREE.Group();
  fountainRoot.position.set(0, 0.63, 0);
  group.add(fountainRoot);

  function makeBasin(outerR, innerR, baseY, wallH, segs, holeR) {
    const g = new THREE.Group();
    const floorH = 0.045;
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(innerR, innerR, floorH, segs), mats.stoneDark);
    floor.position.y = baseY + floorH / 2;
    floor.receiveShadow = true;
    g.add(floor);

    const outer = new THREE.Mesh(
      new THREE.CylinderGeometry(outerR, outerR * 0.985, wallH, segs, 1, true),
      mats.stone
    );
    outer.position.y = baseY + wallH / 2;
    outer.castShadow = true;
    outer.receiveShadow = true;
    g.add(outer);

    const innerH = Math.max(0.08, wallH - 0.05);
    const inner = new THREE.Mesh(
      new THREE.CylinderGeometry(innerR, innerR * 0.992, innerH, segs, 1, true),
      mats.stoneDark
    );
    inner.position.y = baseY + innerH / 2 + 0.02;
    inner.receiveShadow = true;
    g.add(inner);

    const lip = new THREE.Mesh(
      new THREE.TorusGeometry(outerR - 0.012, Math.min(0.042, wallH * 0.2), 8, segs),
      mats.stoneRim
    );
    lip.rotation.x = Math.PI / 2;
    lip.position.y = baseY + wallH;
    lip.castShadow = true;
    g.add(lip);

    const waterY = baseY + wallH * 0.56;
    const hole = Math.max(holeR, 0);
    const deepGeo = hole > 0.02
      ? new THREE.RingGeometry(hole, innerR * 0.98, segs)
      : new THREE.CircleGeometry(innerR * 0.98, segs);
    const deep = new THREE.Mesh(deepGeo, mats.waterDeep);
    deep.rotation.x = -Math.PI / 2;
    deep.position.y = waterY - 0.04;
    deep.renderOrder = 1;
    g.add(deep);

    const surfGeo = hole > 0.02
      ? new THREE.RingGeometry(hole, innerR * 0.92, segs)
      : new THREE.CircleGeometry(innerR * 0.92, segs);
    const water = new THREE.Mesh(surfGeo, mats.water);
    water.rotation.x = -Math.PI / 2;
    water.position.y = waterY;
    water.renderOrder = 2;
    water.userData.baseY = waterY;
    water.userData.phase = outerR;
    g.add(water);
    fountain.surfaces.push(water);

    const foam = new THREE.Mesh(
      new THREE.TorusGeometry(innerR * 0.9, 0.014, 6, Math.max(segs, 20)),
      mats.foamRing
    );
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
    mesh.receiveShadow = true;
    fountainRoot.add(mesh);
    return mesh;
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
    return mesh;
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
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 14, tubeR, 5, false), mats.sheet);
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
          phase: (k / perCurve) + i * 0.13,
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

  const jetH = 0.4;
  const jetFoot = top.lipY + 0.02;
  const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.055, jetH, 7), mats.spray);
  jet.userData.half = jetH / 2;
  jet.userData.foot = jetFoot;
  jet.position.y = jetFoot + jetH / 2;
  jet.renderOrder = 3;
  fountainRoot.add(jet);
  fountain.jet = jet;
  const spout = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), mats.stoneRim);
  spout.position.y = jetFoot;
  fountainRoot.add(spout);

  veil(0.42, 0.68, mid.lipY - 0.02, top.waterY, 16, 0.18);
  veil(0.86, 1.22, lower.waterY + 0.04, mid.lipY - 0.02, 20, -0.1);

  const lowerJets = jetCurves(8, mid.outerR * 0.92, mid.lipY, 1.2, 0.74, 0.96, lower.waterY + 0.02, 0.042, 0.2);
  const upperJets = jetCurves(6, top.outerR * 0.9, top.lipY, 0.64, 1.4, mid.innerR * 0.72, mid.waterY + 0.02, 0.03, 0.45);
  const crownCurves = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    crownCurves.push(new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(c * 0.03, jetFoot + jetH * 0.86, s * 0.03),
      new THREE.Vector3(c * 0.22, jetFoot + jetH + 0.22, s * 0.22),
      new THREE.Vector3(c * 0.32, top.waterY + 0.02, s * 0.32)
    ));
  }
  const splash = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3;
    const c = Math.cos(a);
    const s = Math.sin(a);
    splash.push(new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(c * 0.9, lower.waterY + 0.02, s * 0.9),
      new THREE.Vector3(c * 1.02, lower.waterY + 0.28, s * 1.02),
      new THREE.Vector3(c * 1.16, lower.waterY + 0.02, s * 1.16)
    ));
  }
  const rising = [new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, top.waterY + 0.04, 0),
    new THREE.Vector3(0.02, jetFoot + jetH * 0.55, 0),
    new THREE.Vector3(0, jetFoot + jetH * 0.9, 0)
  )];

  addDrops(lowerJets, 5, 0.42, 0.072);
  addDrops(upperJets, 4, 0.5, 0.058);
  addDrops(crownCurves, 3, 0.72, 0.05);
  addDrops(splash, 2, 0.85, 0.046);
  addDrops(rising, 6, 0.95, 0.04);

  const dropGeo = new THREE.SphereGeometry(1, 6, 5);
  const dropMesh = new THREE.InstancedMesh(dropGeo, mats.spray, fountain.drops.length);
  dropMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  dropMesh.frustumCulled = false;
  dropMesh.renderOrder = 4;
  fountainRoot.add(dropMesh);
  fountain.dropMesh = dropMesh;

  function addRipples(y, radius, n) {
    for (let i = 0; i < n; i++) {
      const mat = mats.foamRing.clone();
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.012, 6, 32), mat);
      mesh.rotation.x = Math.PI / 2;
      mesh.position.y = y + 0.015;
      mesh.renderOrder = 4;
      mesh.userData.slot = i / n;
      fountainRoot.add(mesh);
      fountain.ripples.push(mesh);
    }
  }
  addRipples(lower.waterY, 1.05, 3);
  addRipples(mid.waterY, 0.42, 2);

  plant(-2.15, -1.55, 0.95);
  plant(2.2, -1.5, 1.0);
  plant(-2.2, 1.55, 0.9);
  plant(2.15, 1.6, 0.92);

  // --- Front lounge ---
  rug(0, 9.3, 8.4, 5.4, mats.rugB);
  sofa(-0.2, 10.35, Math.PI, 2.55);
  loungeChair(-3.55, 9.55, 0.7);
  loungeChair(3.45, 9.7, -0.75);
  tableRound(-0.15, 9.15, 0.52, 0.4);
  tableRound(-1.35, 10.15, 0.32, 0.36);
  box(mats.white, 0.22, 0.04, 0.16, -0.1, 0.45, 9.15);
  lamp(-4.15, 7.35);
  lamp(3.55, 6.85);
  lamp(-6.2, -6.4);
  lamp(6.35, -6.15);
  plant(6.5, 11.6, 1.35);
  plant(-6.4, 11.4, 1.15);
  plant(-0.2, 13.4, 0.85);

  // hallway plants and printer
  plant(-4.6, -4.4, 0.8);
  plant(4.7, -4.55, 0.85);
  box(mats.metal, 0.55, 0.62, 0.48, -4.9, 0.31, 12.4);
  box(mats.dark, 0.4, 0.08, 0.36, -4.9, 0.66, 12.4);

  for (const tag of DEPT_TAGS) {
    const el = document.createElement("div");
    el.className = "dept-tag";
    el.dataset.dept = tag.id;
    el.innerHTML = `${tag.label}`;
    const obj = new CSS2DObject(el);
    obj.position.set(tag.x, tag.y, tag.z);
    scene.add(obj);
    deptLabels.push({ id: tag.id, label: tag.label || tag.id, el });
  }

  const CEO_POLY = ceoPoly;

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
    if (Math.abs(x) < 1.35 && z > -7.55 && z < -6.4) return "atrium";
    if (pointInPoly(x, z, CEO_POLY)) return "ceo";
    if (x < -14.45 && x > -17.95 && z < -0.98 && z > -3.48) return "server";
    if (x < -7.28 && x > -17.4 && z < -3.78 && z > -14.3) return "research";
    if (x < -7.32 && x > -17.4 && z > -0.38 && z < 8.4) return "admin";
    if (x > 7.32 && x < 17.4 && z < -3.72 && z > -14.3) return "content";
    if (x > 7.32 && x < 17.4 && z > -0.22 && z < 9.1) return "ops";
    return "atrium";
  }

  function segmentHitsFountain(x0, z0, x1, z1) {
    const dx = x1 - x0;
    const dz = z1 - z0;
    const denom = dx * dx + dz * dz;
    const t = denom < 1e-6 ? 0 : Math.max(0, Math.min(1, -(x0 * dx + z0 * dz) / denom));
    return Math.hypot(x0 + dx * t, z0 + dz * t) < 2.75;
  }

  function connects(door, a, b) {
    return door.rooms.includes(a) && door.rooms.includes(b);
  }

  function pickDoor(roomA, roomB) {
    const primary = doors.filter((d) => d.primary && connects(d, roomA, roomB));
    const pool = primary.length ? primary : doors.filter((d) => connects(d, roomA, roomB));
    return pool[0] || null;
  }

  function appendLeg(points, x0, z0, x1, z1, doorId) {
    if (segmentHitsFountain(x0, z0, x1, z1)) {
      const side = x0 + x1 >= 0 ? 1 : -1;
      points.push({ x: side * 3.45, z: 0 });
    }
    points.push({ x: x1, z: z1, doorId: doorId || undefined });
  }

  function route(x0, z0, x1, z1) {
    const a = roomOf(x0, z0);
    const b = roomOf(x1, z1);
    const points = [];
    let cx = x0;
    let cz = z0;
    if (a !== "atrium" && a !== b) {
      const door = pickDoor(a, "atrium");
      if (door) {
        points.push({ x: door.x, z: door.z, doorId: door.id });
        cx = door.x;
        cz = door.z;
      }
    }
    if (b !== "atrium" && b !== a) {
      const door = pickDoor(b, "atrium");
      if (door) {
        appendLeg(points, cx, cz, door.x, door.z, door.id);
        cx = door.x;
        cz = door.z;
      }
    }
    appendLeg(points, cx, cz, x1, z1, null);
    return points;
  }

  function applyTheme(mode) {
    const pal = PAL[mode] || PAL.day;
    mats.floor.map = mode === "night" ? nightTileTex : creamTex;
    mats.floor.color.set(mode === "night" ? 0xc8c0b4 : 0xffffff);
    mats.rugA.color.set(mode === "night" ? 0x9a9084 : 0xffffff);
    mats.rugB.color.set(mode === "night" ? 0x6a756c : 0xd7e3d4);
    mats.olive.color.setHex((PAL[mode] || PAL.day).olive);
    mats.floor.needsUpdate = true;
    mats.slab.color.setHex(pal.slab);
    mats.wall.color.setHex(pal.wall);
    mats.wood.color.setHex(pal.wood);
    mats.woodDark.color.setHex(pal.woodDark);
    mats.frame.color.setHex(pal.frame);
    mats.pedTop.color.setHex(pal.pedestalTop);
    mats.glass.color.setHex(pal.glass);
    mats.glass.opacity = mode === "night" ? 0.22 : 0.32;
    const night = mode === "night";
    mats.stone.color.setHex(pal.stone);
    mats.stoneDark.color.setHex(pal.stoneDark);
    mats.stoneRim.color.setHex(pal.stone);
    mats.stoneRim.emissive.setHex(pal.water);
    mats.stoneRim.emissiveIntensity = night ? 0.55 : 0.12;
    mats.water.color.setHex(pal.water);
    mats.water.emissive.setHex(pal.waterDeep);
    mats.water.emissiveIntensity = night ? 0.78 : 0.22;
    mats.waterDeep.color.setHex(pal.waterDeep);
    mats.waterDeep.emissive.setHex(pal.waterDeep);
    mats.waterDeep.emissiveIntensity = night ? 0.5 : 0.14;
    mats.sheet.color.setHex(pal.water);
    mats.sheet.emissive.setHex(pal.waterDeep);
    mats.sheet.emissiveIntensity = night ? 0.7 : 0.2;
    mats.veil.color.setHex(pal.water);
    mats.veil.emissive.setHex(pal.waterDeep);
    mats.veil.emissiveIntensity = night ? 0.55 : 0.16;
    mats.spray.color.setHex(pal.foam);
    mats.spray.emissive.setHex(pal.water);
    mats.foamRing.color.setHex(pal.foam);
    mats.foamRing.opacity = night ? 0.7 : 0.5;
    fountain.sheetOpacity = night ? 0.42 : 0.34;
    fountain.veilOpacity = night ? 0.2 : 0.13;
    fountain.sprayGlow = night ? 1.05 : 0.48;
    fountain.rippleAlpha = night ? 0.72 : 0.48;
    for (const ripple of fountain.ripples) ripple.material.color.setHex(pal.foam);
    mats.lampShade.emissiveIntensity = night ? 1.15 : 0.12;
    mats.screen.emissiveIntensity = mode === "night" ? 0.9 : 0.4;
    for (const item of themeables) {
      if (item.mesh && item.dayColor != null) {
        item.mesh.material.color.setHex(mode === "night" ? item.nightColor : item.dayColor);
      }
    }
    const lampIntensity = night ? 32 : 0;
    for (const lamp of lamps) {
      lamp.light.intensity = lampIntensity;
      if (lamp.shade?.material) lamp.shade.material.emissiveIntensity = night ? 1.35 : 0.18;
      if (lamp.bulb?.material) lamp.bulb.material.emissiveIntensity = night ? 1.6 : 0.25;
    }
    return pal;
  }

  function updateDeptCounts(counts) {
    for (const { id, label, el } of deptLabels) {
      const n = counts[id] || 0;
      const name = label || id;
    el.innerHTML = n > 0 ? `${name}<span class="n">✓${n}</span>` : name;
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

    const sy = 0.8 + (Math.sin(t * 2.7) * 0.5 + 0.5) * 0.38;
    const jet = fountain.jet;
    jet.scale.y = sy;
    jet.position.y = jet.userData.foot + jet.userData.half * sy;

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

  return { group, mats, lamps, doors, route, roomOf, applyTheme, updateDeptCounts, tick, floorTex: { creamTex, nightTileTex } };
}
