// createBus.js
// Bus 3D God-travel construit entièrement en code (aucun fichier .glb à charger).
// Fonctionne avec three >= 0.160. Les roues sont dans bus.wheels : il suffit de
// les faire tourner autour de l'axe Z pour que le bus "roule" (vers +X).

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

/** Couleurs tirées du logo. Chaque valeur peut être remplacée via les options. */
export const GOD_TRAVEL_COLORS = {
  accent: '#14b2b6', // turquoise du logo
  body: '#fbfdfe', // carrosserie blanche
  glass: '#070c10', // vitres teintées
  dark: '#11191e', // plastiques, calandre, châssis
  road: '#222d33', // bitume
  text: '#0b1115', // "God-" sur la carrosserie
};

export const WHEEL_RADIUS = 0.5;

const FONT = 'Montserrat, "Trebuchet MS", "Segoe UI", Arial, sans-serif';
const E = 0.12; // arrondi des arêtes de la caisse
const HALF = 1.15; // demi-largeur de la caisse
const SIDE = HALF + E; // position de la face latérale (z)
const WHEEL_X = [3.6, -3.2, -4.4]; // essieu avant, puis double essieu arrière
const WHEEL_Z = 1.14;

/* ------------------------------------------------------------------ */
/* Textures dessinées au canvas                                        */
/* ------------------------------------------------------------------ */

function makeTexture(width, height, draw, { srgb = true } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  draw(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.userData.redraw = () => {
    ctx.clearRect(0, 0, width, height);
    draw(ctx, width, height);
    texture.needsUpdate = true;
  };
  return texture;
}

function drawName(ctx, w, h, c) {
  let size = 132;
  const measure = () => {
    ctx.font = `italic 800 ${size}px ${FONT}`;
    return ctx.measureText('God-').width + ctx.measureText('travel').width;
  };
  while (measure() > w * 0.94 && size > 40) size -= 4;
  const wa = ctx.measureText('God-').width;
  const total = wa + ctx.measureText('travel').width;
  const x = (w - total) / 2;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = c.text;
  ctx.fillText('God-', x, h * 0.6);
  ctx.fillStyle = c.accent;
  ctx.fillText('travel', x + wa, h * 0.6);
  ctx.font = `italic 500 ${Math.round(size * 0.32)}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = c.text;
  ctx.fillText('Voyagez  •  Explorez  •  Arrivez', w / 2, h * 0.9);
}

function makeNameTexture(c) {
  const texture = makeTexture(1024, 256, (ctx, w, h) => drawName(ctx, w, h, c));
  // Redessine le texte quand la police du site est chargée.
  if (typeof document !== 'undefined' && document.fonts && document.fonts.load) {
    document.fonts
      .load(`italic 800 40px ${FONT}`)
      .then(() => texture.userData.redraw())
      .catch(() => {});
  }
  return texture;
}

/* ------------------------------------------------------------------ */
/* Matériaux                                                           */
/* ------------------------------------------------------------------ */

function makeMaterials(c) {
  const glowColor =
    c.accentGlow ??
    '#' + new THREE.Color(c.accent).lerp(new THREE.Color('#ffffff'), 0.45).getHexString();
  const std = (color, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0, ...extra });
  const decal = (factor) => ({
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: factor,
    polygonOffsetUnits: factor,
  });

  return {
    body: new THREE.MeshPhysicalMaterial({
      color: c.body,
      roughness: 0.32,
      metalness: 0.05,
      clearcoat: 0.7,
      clearcoatRoughness: 0.2,
    }),
    accent: new THREE.MeshPhysicalMaterial({
      color: c.accent,
      roughness: 0.45,
      metalness: 0.05,
      clearcoat: 0.3,
    }),
    stripe: new THREE.MeshPhysicalMaterial({
      color: c.accent,
      roughness: 0.45,
      metalness: 0.05,
      clearcoat: 0.3,
      ...decal(-1),
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: c.glass,
      roughness: 0.1,
      metalness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    }),
    dark: std(c.dark, { roughness: 0.6, metalness: 0.2 }),
    white: std('#ffffff', { roughness: 0.4 }),
    tire: std('#12171a', { roughness: 0.92 }),
    rim: std('#d5dde0', { roughness: 0.25, metalness: 0.9 }),
    spoke: std('#5d6a70', { roughness: 0.4, metalness: 0.7 }),
    glow: new THREE.MeshStandardMaterial({
      color: glowColor,
      emissive: glowColor,
      emissiveIntensity: 2.2,
    }),
    tail: new THREE.MeshStandardMaterial({
      color: '#ff3b3b',
      emissive: '#ff1f1f',
      emissiveIntensity: 1.2,
    }),
    arch: new THREE.MeshBasicMaterial({ color: '#0a0f12', ...decal(-2) }),
    name: new THREE.MeshBasicMaterial({
      map: makeNameTexture(c),
      transparent: true,
      depthWrite: false,
      ...decal(-3),
    }),
  };
}

/* ------------------------------------------------------------------ */
/* Géométries                                                          */
/* ------------------------------------------------------------------ */

// Profil de la caisse vu de côté (le bus regarde vers +X), extrudé sur la largeur.
function bodyGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-5.3, 0.45);
  s.lineTo(5.2, 0.45);
  s.quadraticCurveTo(5.55, 0.45, 5.55, 0.85);
  s.lineTo(5.55, 1.9);
  s.lineTo(4.85, 3.2); // pare-brise incliné
  s.quadraticCurveTo(4.8, 3.3, 4.55, 3.3);
  s.lineTo(-5.2, 3.3);
  s.quadraticCurveTo(-5.5, 3.3, -5.5, 3.0);
  s.lineTo(-5.5, 0.75);
  s.quadraticCurveTo(-5.5, 0.45, -5.3, 0.45);

  const raw = new THREE.ExtrudeGeometry(s, {
    depth: HALF * 2,
    bevelEnabled: true,
    bevelThickness: E,
    bevelSize: E,
    bevelSegments: 5,
    curveSegments: 14,
    steps: 1,
  });
  raw.translate(0, 0, -HALF);

  // Faces planes (flancs) gardées nettes, bords et courbes lissés.
  const position = raw.getAttribute('position');
  const caps = [];
  const sides = [];
  for (const g of raw.groups) {
    const part = new THREE.BufferGeometry();
    part.setAttribute(
      'position',
      new THREE.BufferAttribute(position.array.slice(g.start * 3, (g.start + g.count) * 3), 3)
    );
    (g.materialIndex === 0 ? caps : sides).push(part);
  }
  const flat = mergeGeometries(caps);
  flat.computeVertexNormals();
  let smooth = mergeVertices(mergeGeometries(sides), 1e-4);
  smooth.computeVertexNormals();
  smooth = smooth.toNonIndexed();
  const geometry = mergeGeometries([flat, smooth]);
  raw.dispose();
  return geometry;
}

// Bande turquoise sur le bas des flancs.
function stripeGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-5.2, 0.5);
  s.lineTo(5.15, 0.5);
  s.quadraticCurveTo(5.5, 0.5, 5.5, 0.88);
  s.lineTo(5.5, 1.0);
  s.bezierCurveTo(2.6, 0.9, -1.4, 1.06, -5.2, 1.32);
  s.lineTo(-5.2, 0.5);
  return new THREE.ShapeGeometry(s, 24);
}

// Demi-cercle noir autour de chaque roue.
function archGeometry() {
  const r = 0.66;
  const s = new THREE.Shape();
  s.moveTo(-r, -0.04);
  s.lineTo(r, -0.04);
  s.lineTo(r, 0);
  s.absarc(0, 0, r, 0, Math.PI, false);
  s.lineTo(-r, -0.04);
  return new THREE.ShapeGeometry(s, 32);
}

function createWheel(m, side) {
  const wheel = new THREE.Group();
  const cyl = (radius, length, material) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 40), material);
    mesh.rotation.x = Math.PI / 2; // axe du cylindre le long de Z
    return mesh;
  };
  wheel.add(cyl(WHEEL_RADIUS, 0.34, m.tire));
  wheel.add(cyl(0.31, 0.36, m.rim));
  wheel.add(cyl(0.11, 0.4, m.accent));

  for (const face of [1, -1]) {
    for (let k = 0; k < 5; k++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.06, 0.02), m.spoke);
      spoke.position.z = face * 0.185;
      spoke.rotation.z = (k * Math.PI) / 5;
      wheel.add(spoke);
    }
  }
  // Un repère turquoise sur la face extérieure, pour voir la rotation.
  const mark = cyl(0.05, 0.04, m.accent);
  mark.position.set(0.21, 0, side * 0.19);
  wheel.add(mark);
  return wheel;
}

/* ------------------------------------------------------------------ */
/* Le bus                                                              */
/* ------------------------------------------------------------------ */

/**
 * @param {Partial<typeof GOD_TRAVEL_COLORS> & { accentGlow?: string }} options
 * @returns {{ group: THREE.Group, wheels: THREE.Group[], materials: object }}
 */
export function createBus(options = {}) {
  const c = { ...GOD_TRAVEL_COLORS, ...options };
  const m = makeMaterials(c);
  const group = new THREE.Group();
  group.name = 'GodTravelBus';
  const wheels = [];

  const add = (mesh) => {
    group.add(mesh);
    return mesh;
  };
  const box = (w, h, d, material, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    return add(mesh);
  };

  // Caisse et châssis
  add(new THREE.Mesh(bodyGeometry(), m.body));
  box(10.4, 0.26, 2.1, m.dark, -0.1, 0.3, 0);

  // Flancs : bande, passages de roues, vitres, nom, roues, rétroviseurs
  const stripeGeo = stripeGeometry();
  const archGeo = archGeometry();
  const nameGeo = new THREE.PlaneGeometry(2.8, 0.7);
  const windowCount = 8;
  const pillar = 0.14;
  const bandStart = -4.8;
  const bandEnd = 4.6;
  const windowW = (bandEnd - bandStart - pillar * (windowCount - 1)) / windowCount;

  for (const side of [1, -1]) {
    const z = side * SIDE;

    const stripe = new THREE.Mesh(stripeGeo, m.stripe);
    stripe.position.z = z + side * 0.002;
    add(stripe);

    for (const x of WHEEL_X) {
      const arch = new THREE.Mesh(archGeo, m.arch);
      arch.position.set(x, WHEEL_RADIUS, z + side * 0.004);
      add(arch);
    }

    for (let i = 0; i < windowCount; i++) {
      const x = bandStart + i * (windowW + pillar) + windowW / 2;
      box(windowW, 1.1, 0.024, m.glass, x, 2.4, z + side * 0.012);
    }

    const name = new THREE.Mesh(nameGeo, m.name);
    name.position.set(-0.4, 1.43, z + side * 0.006);
    if (side < 0) name.rotation.y = Math.PI;
    add(name);

    for (const x of WHEEL_X) {
      const wheel = createWheel(m, side);
      wheel.position.set(x, WHEEL_RADIUS, side * WHEEL_Z);
      wheels.push(wheel);
      add(wheel);
    }

    box(0.06, 0.06, 0.42, m.dark, 5.2, 2.4, side * 1.48);
    box(0.1, 0.5, 0.12, m.dark, 5.2, 2.3, side * 1.68);
  }

  // Pare-brise, afficheur de destination
  const A = new THREE.Vector2(5.55, 1.9);
  const B = new THREE.Vector2(4.85, 3.2);
  const dir = B.clone().sub(A).normalize();
  const nrm = new THREE.Vector2(dir.y, -dir.x);
  const tilt = Math.atan2(-dir.x, dir.y);
  const onSlope = (s, lift) =>
    new THREE.Vector3(
      A.x + nrm.x * (E + lift) + dir.x * s,
      A.y + nrm.y * (E + lift) + dir.y * s,
      0
    );

  const windshield = box(0.04, 0.9, 2.1, m.glass, 0, 0, 0);
  windshield.position.copy(onSlope(0.59, 0.022));
  windshield.rotation.z = tilt;

  const sign = box(0.04, 0.22, 1.4, m.dark, 0, 0, 0);
  sign.position.copy(onSlope(1.2, 0.03));
  sign.rotation.z = tilt;
  const signGlow = box(0.03, 0.05, 1.1, m.glow, 0, 0, 0);
  signGlow.position.copy(onSlope(1.2, 0.045));
  signGlow.rotation.z = tilt;

  // Face avant : calandre, plaque, phares
  const front = 5.55 + E;
  box(0.07, 0.32, 1.7, m.dark, front + 0.02, 1.08, 0);
  box(0.03, 0.04, 1.9, m.glow, front + 0.01, 1.33, 0);
  box(0.03, 0.14, 0.5, m.white, front + 0.06, 1.02, 0);
  for (const side of [1, -1]) {
    box(0.05, 0.14, 0.55, m.glow, front + 0.005, 1.56, side * 0.85);
  }

  // Arrière : lunette, feux
  const rear = -5.5 - E;
  box(0.04, 0.95, 1.9, m.glass, rear - 0.015, 2.35, 0);
  for (const side of [1, -1]) {
    box(0.04, 0.2, 0.35, m.tail, rear - 0.015, 1.1, side * 0.9);
  }

  // Toit : climatisation et trappe
  box(1.9, 0.16, 1.2, m.white, -0.6, 3.3 + E + 0.07, 0);
  box(0.8, 0.1, 0.7, m.accent, 2.4, 3.3 + E + 0.04, 0);

  // Ombre douce sous le bus
  const shadowTex = makeTexture(
    128,
    128,
    (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, '#fff');
      g.addColorStop(0.5, '#a0a0a0');
      g.addColorStop(1, '#000');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
    { srgb: false }
  );
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 4.8),
    new THREE.MeshBasicMaterial({
      color: '#000000',
      alphaMap: shadowTex,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, 0.01, 0);
  shadow.renderOrder = 4;
  add(shadow);

  return { group, wheels, materials: m };
}

/* ------------------------------------------------------------------ */
/* Route qui défile                                                    */
/* ------------------------------------------------------------------ */

/**
 * Route avec lignes pointillées. Appeler update(distance) à chaque image, avec
 * distance = distance parcourue par le bus (en unités de la scène).
 */
export function createRoad(options = {}) {
  const c = { ...GOD_TRAVEL_COLORS, ...options };
  const group = new THREE.Group();
  group.name = 'GodTravelRoad';
  const length = 48;
  const fadeEnd = length / 2;
  const fadeSpan = length * 0.3;

  const fade = makeTexture(
    256,
    4,
    (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, w, 0);
      g.addColorStop(0, '#000');
      g.addColorStop(0.3, '#fff');
      g.addColorStop(0.7, '#fff');
      g.addColorStop(1, '#000');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    },
    { srgb: false }
  );

  const flat = (w, h, material, y, order) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = y;
    mesh.renderOrder = order;
    return mesh;
  };
  const basic = (color, extra = {}) =>
    new THREE.MeshBasicMaterial({ color, transparent: true, depthWrite: false, ...extra });

  group.add(flat(length, 7.6, basic(c.road, { alphaMap: fade }), 0.004, 1));
  for (const z of [-3.3, 3.3]) {
    const line = flat(length, 0.1, basic(c.accent, { alphaMap: fade }), 0.006, 2);
    line.position.z = z;
    group.add(line);
  }

  const spacing = 3.6;
  const dashGroup = new THREE.Group();
  const dashGeo = new THREE.PlaneGeometry(1.6, 0.16);
  const dashes = [];
  for (let i = -10; i <= 10; i++) {
    const dash = new THREE.Mesh(dashGeo, basic('#ffffff', { opacity: 0 }));
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(i * spacing, 0.008, 0);
    dash.renderOrder = 3;
    dash.userData.x = i * spacing;
    dashes.push(dash);
    dashGroup.add(dash);
  }
  group.add(dashGroup);

  const update = (distance) => {
    const offset = distance % spacing;
    dashGroup.position.x = -offset;
    for (const dash of dashes) {
      const x = dash.userData.x - offset;
      dash.material.opacity = 0.9 * Math.min(1, Math.max(0, (fadeEnd - Math.abs(x)) / fadeSpan));
    }
  };
  update(0);
  return { group, update };
}

/* ------------------------------------------------------------------ */
/* Lumière et nettoyage                                                */
/* ------------------------------------------------------------------ */

/** Éclairage de studio (reflets sur la carrosserie). Renvoie une fonction de nettoyage. */
export function setupStudio(renderer, scene) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envMap = pmrem.fromScene(room, 0.04).texture;
  pmrem.dispose();
  const previous = scene.environment;
  const previousIntensity = scene.environmentIntensity;
  scene.environment = envMap;
  scene.environmentIntensity = 0.5; // reflets doux, couleurs fidèles au logo

  const key = new THREE.DirectionalLight('#ffffff', 1.6);
  key.position.set(6, 10, 8);
  const rim = new THREE.DirectionalLight('#bff8f8', 0.8);
  rim.position.set(-8, 4, -6);
  scene.add(key, rim);

  return () => {
    scene.remove(key, rim);
    scene.environment = previous ?? null;
    if (previousIntensity !== undefined) scene.environmentIntensity = previousIntensity;
    envMap.dispose();
    if (room.dispose) room.dispose();
  };
}

/** Libère la mémoire GPU d'un bus ou d'une route qu'on n'utilise plus. */
export function disposeObject(root) {
  root.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    const materials = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
    for (const material of materials) {
      if (material.map) material.map.dispose();
      if (material.alphaMap) material.alphaMap.dispose();
      material.dispose();
    }
  });
}

/** Champ de vision adapté aux écrans étroits (téléphone). */
export function fovForAspect(aspect, baseFov = 34) {
  const k = Math.max(1, 1.7 / aspect);
  const fov = 2 * Math.atan(Math.tan((baseFov * Math.PI) / 360) * k) * (180 / Math.PI);
  return Math.min(fov, 70);
}
