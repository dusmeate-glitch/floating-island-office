import * as THREE from "three";
import { CSS2DObject } from "./vendor/CSS2DRenderer.js";
import { STAFF } from "./config.js";

function makePerson(spec) {
  const root = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.62, metalness: 0.04 });
  const skinMat = new THREE.MeshStandardMaterial({ color: spec.skin, roughness: 0.7 });
  const hairMat = new THREE.MeshStandardMaterial({ color: spec.hair, roughness: 0.8 });
  const accentMat = new THREE.MeshStandardMaterial({ color: spec.accent, roughness: 0.55 });

  const hips = new THREE.Group();
  hips.position.y = 0.72;
  root.add(hips);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.36, 5, 10), bodyMat);
  torso.position.y = 0.12;
  torso.castShadow = true;
  hips.add(torso);

  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.08, 10), accentMat);
  collar.position.y = 0.36;
  hips.add(collar);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.195, 16, 12), skinMat);
  head.position.y = 0.58;
  head.castShadow = true;
  hips.add(head);

  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.205, 16, 12), hairMat);
  hair.scale.set(1.02, 0.72, 1.05);
  hair.position.set(0, 0.68, -0.01);
  hips.add(hair);

  const eyeGeo = new THREE.SphereGeometry(0.028, 8, 8);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4 });
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  const eyeR = eyeL.clone();
  eyeL.position.set(-0.06, 0.6, 0.17);
  eyeR.position.set(0.06, 0.6, 0.17);
  hips.add(eyeL, eyeR);

  function limb(len, radius, mat) {
    const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, len, 4, 8), mat);
    mesh.castShadow = true;
    return mesh;
  }

  const armL = limb(0.28, 0.055, bodyMat);
  const armR = limb(0.28, 0.055, bodyMat);
  armL.position.set(-0.26, 0.16, 0);
  armR.position.set(0.26, 0.16, 0);
  hips.add(armL, armR);

  const handL = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), skinMat);
  const handR = handL.clone();
  handL.position.set(-0.26, -0.04, 0.02);
  handR.position.set(0.26, -0.04, 0.02);
  hips.add(handL, handR);

  const legL = limb(0.34, 0.065, bodyMat);
  const legR = limb(0.34, 0.065, bodyMat);
  legL.position.set(-0.1, -0.4, 0);
  legR.position.set(0.1, -0.4, 0);
  hips.add(legL, legR);

  const alert = new THREE.Group();
  const bang = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xe25555, emissive: 0xaa2020, emissiveIntensity: 0.6 })
  );
  alert.add(bang);
  alert.position.set(0, 1.62, 0);
  alert.visible = false;
  root.add(alert);

  const plate = document.createElement("div");
  plate.className = "nameplate";
  plate.innerHTML = `<span class="sub">${spec.dept}</span>${spec.name}`;
  const label = new CSS2DObject(plate);
  label.position.set(0, 1.72, 0);
  root.add(label);

  root.userData = { hips, armL, armR, handL, handR, legL, legR, alert, plate, head };
  return root;
}

export function createStaff(scene) {
  const actors = STAFF.map((spec, index) => {
    const mesh = makePerson(spec);
    mesh.position.set(spec.idle.x + index * 0.01, 0, spec.idle.z);
    mesh.rotation.y = spec.idle.ry || 0;
    scene.add(mesh);
    return {
      spec,
      mesh,
      state: "idle",
      step: "",
      target: new THREE.Vector3(spec.idle.x, 0, spec.idle.z),
      facing: spec.idle.ry || 0,
      sit: !!spec.sitIdle,
      speed: 1.65,
      phase: index * 1.3,
    };
  });

  function destinationFor(actor, visual) {
    const spec = actor.spec;
    const status = visual?.status || "idle";
    if (status === "working") {
      return { x: spec.desk.x, z: spec.desk.z, ry: spec.desk.ry, sit: true, pose: "work" };
    }
    if (status === "waiting_user") {
      return { x: spec.wait.x, z: spec.wait.z, ry: spec.wait.ry, sit: false, pose: "wait" };
    }
    if (status === "error") {
      return { x: spec.desk.x, z: spec.desk.z, ry: spec.desk.ry, sit: true, pose: "error" };
    }
    return { x: spec.idle.x, z: spec.idle.z, ry: spec.idle.ry, sit: !!spec.sitIdle, pose: "idle" };
  }

  function applyVisuals(visuals, snap = false) {
    for (const actor of actors) {
      const visual = visuals[actor.spec.id];
      const next = visual?.status || "idle";
      actor.state = next;
      actor.step = visual?.step || "";
      actor.error = next === "error";
      const dest = destinationFor(actor, visual);
      actor.target.set(dest.x, 0, dest.z);
      actor.facing = dest.ry || 0;
      actor.sit = dest.sit;
      actor.pose = dest.pose;
      if (snap) {
        actor.mesh.position.set(dest.x, 0, dest.z);
        actor.mesh.rotation.y = dest.ry || 0;
      }
      const plate = actor.mesh.userData.plate;
      plate.classList.toggle("active", next === "working" || next === "waiting_user");
      plate.classList.toggle("error", next === "error");
      actor.mesh.userData.alert.visible = next === "error";
    }
  }

  function tick(dt, t) {
    for (const actor of actors) {
      const mesh = actor.mesh;
      const u = mesh.userData;
      const pos = mesh.position;
      const dx = actor.target.x - pos.x;
      const dz = actor.target.z - pos.z;
      const dist = Math.hypot(dx, dz);
      const walking = dist > 0.12;
      if (walking) {
        const step = Math.min(dist, actor.speed * dt);
        pos.x += (dx / dist) * step;
        pos.z += (dz / dist) * step;
        mesh.rotation.y = Math.atan2(dx, dz);
        const swing = Math.sin(t * 9 + actor.phase) * 0.55;
        u.legL.rotation.x = swing;
        u.legR.rotation.x = -swing;
        u.legL.position.y = -0.4;
        u.legR.position.y = -0.4;
        u.armL.rotation.x = -swing * 0.7;
        u.armR.rotation.x = swing * 0.7;
        u.hips.position.y = 0.72 + Math.abs(Math.sin(t * 9 + actor.phase)) * 0.045;
        u.hips.rotation.x = 0.04;
      } else {
        mesh.rotation.y += ((actor.facing ?? mesh.rotation.y) - mesh.rotation.y) * Math.min(1, dt * 6);
        u.legL.rotation.x *= 0.8;
        u.legR.rotation.x *= 0.8;
        u.hips.rotation.x *= 0.8;
        if (actor.sit) {
          u.hips.position.y += (0.48 - u.hips.position.y) * 0.15;
          u.legL.rotation.x = -1.15;
          u.legR.rotation.x = -1.15;
          u.legL.position.y = -0.28;
          u.legR.position.y = -0.28;
        } else {
          u.hips.position.y += (0.72 - u.hips.position.y) * 0.15;
          u.legL.position.y = -0.4;
          u.legR.position.y = -0.4;
        }
        if (actor.pose === "work") {
          u.armL.rotation.x = -0.7 + Math.sin(t * 8 + actor.phase) * 0.25;
          u.armR.rotation.x = -0.55 + Math.sin(t * 9.5 + actor.phase) * 0.3;
        } else if (actor.pose === "wait") {
          u.armL.rotation.x = 0.15;
          u.armR.rotation.x = 0.15;
          u.hips.position.y = 0.72 + Math.sin(t * 1.6 + actor.phase) * 0.012;
        } else {
          u.armL.rotation.x += (0.08 - u.armL.rotation.x) * 0.1;
          u.armR.rotation.x += (0.08 - u.armR.rotation.x) * 0.1;
          u.hips.position.y += Math.sin(t * 1.4 + actor.phase) * 0.0008;
        }
      }
    }
  }

  return { actors, applyVisuals, tick };
}
