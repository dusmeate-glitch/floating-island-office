import * as THREE from "three";
import { CSS2DObject } from "./vendor/CSS2DRenderer.js";
import { DEPT_TAGS } from "./config.js";

const PAL = {
  day: {
    clear: 0xb9c5d0,
    hemiSky: 0xfff3e0,
    hemiGround: 0x8a7a64,
    hemi: 0.62,
    sun: 0xffe8c4,
    sunIntensity: 2.35,
    sunPos: [20, 28, 12],
    ambient: 0.22,
    exposure: 1.02,
    floor: 0xe4cba4,
    slab: 0xd8c090,
    rug: 0xd9c7a4,
    wall: 0xf3ebe0,
    wood: 0xc4a06c,
    woodDark: 0x8b6740,
    frame: 0x5c4632,
    glass: 0xc5d8e6,
    glassOpacity: 0.22,
    tile: 0xe8dcc8,
    outside: 0x9aabb8,
    building: 0x8b97a3,
    pedestalTop: 0xeef3f6,
    stone: 0xd9d1c4,
    stoneDark: 0xb7aa96,
    water: 0x5eb6e6,
    waterDeep: 0x2f86b8,
    foam: 0xf3fbff,
  },
  night: {
    clear: 0x2a2d33,
    hemiSky: 0x6f8498,
    hemiGround: 0x2a241c,
    hemi: 0.42,
    sun: 0x9eb0c6,
    sunIntensity: 0.38,
    sunPos: [12, 24, 14],
    ambient: 0.2,
    exposure: 0.96,
    floor: 0x3c4046,
    slab: 0x32363c,
    rug: 0x4a5148,
    wall: 0xe8dccb,
    wood: 0xb08958,
    woodDark: 0x6f5233,
    frame: 0x3a322c,
    glass: 0x8fb4c9,
    glassOpacity: 0.16,
    tile: 0x3c4046,
    outside: 0x1c1f24,
    building: 0x3a4048,
    pedestalTop: 0xd5dde4,
    stone: 0xc9d3dc,
    stoneDark: 0x9aabb6,
    water: 0x8ad4ff,
    waterDeep: 0x3d94d4,
    foam: 0xe5f5ff,
  },
};

function woodTexture(kind = "plank") {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d");
  if (kind === "tile") {
    g.fillStyle = "#3a3e44";
    g.fillRect(0, 0, 512, 512);
    const size = 128;
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const shade = 58 + ((x + y) % 2) * 6 + ((x * 13 + y * 7) % 5);
        g.fillStyle = `rgb(${shade},${shade + 2},${shade + 6})`;
        g.fillRect(x * size + 3, y * size + 3, size - 6, size - 6);
      }
    }
  } else {
    g.fillStyle = "#e6d0ac";
    g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 10; i++) {
      const y = i * 51.2;
      g.fillStyle = i % 2 === 0 ? "#ead6b4" : "#e0c8a0";
      g.fillRect(0, y, 512, 51.2);
      g.strokeStyle = "rgba(140,96,50,0.09)";
      g.beginPath();
      g.moveTo(0, y + 50.6);
      g.lineTo(512, y + 50.6);
      g.stroke();
      g.strokeStyle = "rgba(150,105,55,0.05)";
      for (let x = 0; x < 6; x++) {
        g.beginPath();
        g.moveTo(x * 90 + (i % 3) * 10, y + 8);
        g.bezierCurveTo(x * 90 + 24, y + 22, x * 90 + 40, y + 18, x * 90 + 80, y + 40);
        g.stroke();
      }
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
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

  const plankTex = woodTexture("plank");
  plankTex.repeat.set(10, 8);
  const tileTex = woodTexture("tile");
  tileTex.repeat.set(7, 6);

  const mats = {
    floor: new THREE.MeshStandardMaterial({ map: plankTex, roughness: 0.78, metalness: 0.02 }),
    slab: new THREE.MeshStandardMaterial({ color: PAL.day.slab, roughness: 0.86 }),
    wall: new THREE.MeshStandardMaterial({ color: PAL.day.wall, roughness: 0.9 }),
    wood: new THREE.MeshStandardMaterial({ color: PAL.day.wood, roughness: 0.62 }),
    woodDark: new THREE.MeshStandardMaterial({ color: PAL.day.woodDark, roughness: 0.7 }),
    frame: new THREE.MeshStandardMaterial({ color: PAL.day.frame, roughness: 0.45, metalness: 0.18 }),
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
    rugA: new THREE.MeshStandardMaterial({ color: 0xd7c7a6, roughness: 0.92 }),
    rugB: new THREE.MeshStandardMaterial({ color: 0x5e6a58, roughness: 0.9 }),
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
  };

  themeables.push(
    { mat: mats.slab, key: "slab" },
    { mat: mats.wall, key: "wall" },
    { mat: mats.wood, key: "wood" },
    { mat: mats.woodDark, key: "woodDark" },
    { mat: mats.frame, key: "frame" },
    { mat: mats.pedTop, key: "pedestalTop" },
  );

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
      const pane = box(mats.glass, 0.04, height - 0.16, sl - 0.04, px, height / 2 + 0.02, pz, 0, ry, 0, false);
      pane.renderOrder = 2;
      box(mats.frame, 0.07, 0.07, sl, px, 0.07, pz, 0, ry, 0, false);
      box(mats.frame, 0.07, 0.07, sl, px, height - 0.05, pz, 0, ry, 0, false);
      const posts = Math.max(2, Math.round(sl / 1.35) + 1);
      for (let i = 0; i < posts; i++) {
        const u = i / (posts - 1) - 0.5;
        const qx = px + Math.sin(ry) * u * sl;
        const qz = pz + Math.cos(ry) * u * sl;
        box(mats.frame, 0.075, height, 0.075, qx, height / 2, qz, 0, ry, 0, false);
      }
    }
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

  // Outer glass envelope (open dollhouse interior, city visible)
  glassWall(-18, -15, 18, -15, 2.7);
  glassWall(-18, 15, 18, 15, 2.7);
  glassWall(-18, -15, -18, 15, 2.7);
  glassWall(18, -15, 18, 15, 2.7);

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

  // server closet between research and conference
  solidWall(-17.2, -3.55, -14.3, -3.55, 2.55);
  solidWall(-14.3, -3.55, -14.3, -0.7, 2.55);
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

  // --- 总控 round lounge (top center) ---
  const ceo = new THREE.Group();
  const ceoFloor = new THREE.Mesh(new THREE.CylinderGeometry(5.15, 5.15, 0.06, 48), mats.rugA);
  ceoFloor.position.set(0, 0.03, -10.35);
  ceoFloor.receiveShadow = true;
  group.add(ceoFloor);
  const segments = 26;
  for (let i = 0; i < segments; i++) {
    const a0 = -Math.PI * 0.78 + (i / segments) * Math.PI * 1.56;
    const a1 = -Math.PI * 0.78 + ((i + 1) / segments) * Math.PI * 1.56;
    const r = 5.15;
    const x1 = Math.sin(a0) * r;
    const z1 = -10.35 + Math.cos(a0) * r;
    const x2 = Math.sin(a1) * r;
    const z2 = -10.35 + Math.cos(a1) * r;
    glassWall(x1, z1, x2, z2, 2.58);
  }
  box(mats.wood, 2.3, 0.08, 0.78, 0.1, 0.76, -13.15);
  box(mats.woodDark, 2.3, 0.55, 0.7, 0.1, 0.28, -13.15);
  chair(0.15, -12.25, Math.PI);
  desk(0.15, -10.35, 0);
  chair(0.15, -9.5, 0);
  loungeChair(-1.7, -10.1, 0.5);
  loungeChair(1.85, -10.15, -0.5);
  tableRound(0.05, -11.15, 0.48, 0.38);
  bookshelf(-3.35, -13.15, 0.35, 1.55, 2.1);
  bookshelf(3.4, -13.1, -0.35, 1.55, 2.1);
  plant(-3.7, -8.6, 1.05);
  plant(3.75, -8.55, 1.1);
  plant(-2.1, -14.3, 0.8);
  plant(2.15, -14.25, 0.85);
  group.add(ceo);

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
    deptLabels.push({ id: tag.id, el });
  }

  function applyTheme(mode) {
    const pal = PAL[mode] || PAL.day;
    mats.floor.map = mode === "night" ? tileTex : plankTex;
    mats.floor.color.set(mode === "night" ? 0x9aa2ac : 0xffffff);
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
    for (const { id, el } of deptLabels) {
      const n = counts[id] || 0;
      el.innerHTML = n > 0 ? `${id}<span class="n">✓${n}</span>` : id;
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

  return { group, mats, lamps, applyTheme, updateDeptCounts, tick, floorTex: { plankTex, tileTex } };
}
