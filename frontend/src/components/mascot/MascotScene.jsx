import { useEffect, useRef, useState } from 'react';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera.js';
import { Engine } from '@babylonjs/core/Engines/engine.js';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight.js';
import { PointLight } from '@babylonjs/core/Lights/pointLight.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';
import { Vector3 } from '@babylonjs/core/Maths/math.vector.js';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder.js';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode.js';
import { Scene } from '@babylonjs/core/scene.js';

const makeMaterial = (scene, name, color, roughness = 0.72, emissive = 0) => {
  const material = new StandardMaterial(name, scene);
  material.diffuseColor = color;
  material.specularColor = new Color3(0.12, 0.12, 0.12);
  material.roughness = roughness;
  if (emissive > 0) material.emissiveColor = color.scale(emissive);
  return material;
};

function MascotScene({
  size = 'medium',
  interactive = true,
  animated = true,
  className = '',
  ariaLabel = 'Sapphire Vista 3D restaurant mascot',
  emotionRef,
  targetRef,
}) {
  const canvasRef = useRef(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let engine;
    let scene;
    let resizeObserver;
    let pointerHandler;
    let pointerLeaveHandler;

    try {
      if (!window.WebGLRenderingContext) {
        setFallback(true);
        return undefined;
      }

      engine = new Engine(canvas, true, {
        preserveDrawingBuffer: false,
        stencil: false,
        antialias: true,
      });
      scene = new Scene(engine);
      scene.clearColor = new Color3(0.043, 0.043, 0.047).toColor4(0);

      const camera = new ArcRotateCamera(
        'mascot-camera',
        -Math.PI / 2,
        Math.PI / 2.18,
        size === 'small' ? 5.2 : 5.8,
        new Vector3(0, 0.55, 0),
        scene,
      );
      camera.lowerBetaLimit = camera.beta - 0.12;
      camera.upperBetaLimit = camera.beta + 0.12;
      camera.lowerAlphaLimit = camera.alpha - 0.18;
      camera.upperAlphaLimit = camera.alpha + 0.18;
      camera.lowerRadiusLimit = camera.radius;
      camera.upperRadiusLimit = camera.radius;
      camera.attachControl(canvas, false);

      const hemi = new HemisphericLight('mascot-hemi', new Vector3(0, 1, 0), scene);
      hemi.intensity = 1.15;
      hemi.diffuse = new Color3(1, 0.94, 0.78);
      hemi.groundColor = new Color3(0.04, 0.12, 0.24);

      const key = new PointLight('mascot-key', new Vector3(-3, 4, -3), scene);
      key.intensity = 1.1;
      key.diffuse = new Color3(0.95, 0.86, 0.55);

      const sapphire = new PointLight('mascot-sapphire', new Vector3(3, 1, 2), scene);
      sapphire.intensity = 0.75;
      sapphire.diffuse = new Color3(0.18, 0.48, 1);

      const dark = makeMaterial(scene, 'dark', new Color3(0.043, 0.043, 0.047));
      const gold = makeMaterial(scene, 'gold', new Color3(0.83, 0.69, 0.22), 0.48, 0.12);
      const sapphireBlue = makeMaterial(scene, 'sapphire', new Color3(0.12, 0.42, 1), 0.55, 0.08);
      const cream = makeMaterial(scene, 'cream', new Color3(0.94, 0.88, 0.72), 0.65);
      const skin = makeMaterial(scene, 'skin', new Color3(0.96, 0.71, 0.46), 0.72);
      const eyeWhite = makeMaterial(scene, 'eye-white', new Color3(1, 1, 0.96), 0.38);
      const eyeBlue = makeMaterial(scene, 'eye-blue', new Color3(0.08, 0.38, 0.95), 0.42, 0.04);
      const pupil = makeMaterial(scene, 'pupil', new Color3(0.025, 0.025, 0.03), 0.2);

      const character = new TransformNode('mascot-character', scene);

      const body = MeshBuilder.CreateSphere('body', { diameter: 2.15, segments: 24 }, scene);
      body.scaling.set(0.9, 1.05, 0.78);
      body.position.y = 0;
      body.material = cream;
      body.parent = character;

      const apron = MeshBuilder.CreateSphere('apron', { diameter: 1.8, segments: 20 }, scene);
      apron.scaling.set(0.72, 0.82, 0.18);
      apron.position.set(0, -0.14, -0.83);
      apron.material = sapphireBlue;
      apron.parent = character;

      const apronGold = MeshBuilder.CreateTorus('apron-gold', {
        diameter: 1.42,
        thickness: 0.025,
        tessellation: 32,
      }, scene);
      apronGold.scaling.z = 0.25;
      apronGold.position.set(0, -0.1, -0.96);
      apronGold.material = gold;
      apronGold.parent = character;

      const head = new TransformNode('mascot-head', scene);
      head.parent = character;
      head.position.y = 1.55;

      const face = MeshBuilder.CreateSphere('face', { diameter: 1.48, segments: 24 }, scene);
      face.scaling.set(1.08, 0.92, 0.82);
      face.position.y = 0;
      face.material = skin;
      face.parent = head;

      const eyeLeft = MeshBuilder.CreateSphere('eye-left', { diameter: 0.34, segments: 16 }, scene);
      eyeLeft.scaling.set(0.82, 1.15, 0.32);
      eyeLeft.position.set(-0.34, 0.12, -0.64);
      eyeLeft.material = eyeWhite;
      eyeLeft.parent = head;

      const eyeRight = eyeLeft.clone('eye-right');
      eyeRight.position.x = 0.34;

      const pupilLeft = MeshBuilder.CreateSphere('pupil-left', { diameter: 0.13, segments: 12 }, scene);
      pupilLeft.scaling.z = 0.45;
      pupilLeft.position.set(-0.34, 0.11, -0.78);
      pupilLeft.material = pupil;
      pupilLeft.parent = head;

      const pupilRight = pupilLeft.clone('pupil-right');
      pupilRight.position.x = 0.34;

      const irisLeft = MeshBuilder.CreateSphere('iris-left', { diameter: 0.19, segments: 12 }, scene);
      irisLeft.scaling.z = 0.34;
      irisLeft.position.set(-0.34, 0.11, -0.77);
      irisLeft.material = eyeBlue;
      irisLeft.parent = head;
      const irisRight = irisLeft.clone('iris-right');
      irisRight.position.x = 0.34;

      const smile = MeshBuilder.CreateTorus('smile', {
        diameter: 0.42,
        thickness: 0.025,
        tessellation: 32,
        arc: 0.5,
      }, scene);
      smile.rotation.z = Math.PI;
      smile.rotation.x = Math.PI / 2;
      smile.position.set(0, -0.28, -0.69);
      smile.material = dark;
      smile.parent = head;

      const cheekLeft = MeshBuilder.CreateSphere('cheek-left', { diameter: 0.12, segments: 10 }, scene);
      cheekLeft.scaling.z = 0.18;
      cheekLeft.position.set(-0.54, -0.14, -0.66);
      cheekLeft.material = makeMaterial(scene, 'cheek', new Color3(0.78, 0.32, 0.26), 0.6);
      cheekLeft.parent = head;
      const cheekRight = cheekLeft.clone('cheek-right');
      cheekRight.position.x = 0.54;

      const browLeft = MeshBuilder.CreateCapsule('brow-left', {
        height: 0.28,
        radius: 0.025,
        tessellation: 10,
      }, scene);
      browLeft.rotation.z = Math.PI / 2;
      browLeft.position.set(-0.34, 0.43, -0.69);
      browLeft.material = dark;
      browLeft.parent = head;

      const browRight = browLeft.clone('brow-right');
      browRight.position.x = 0.34;

      const loveHeartLeft = MeshBuilder.CreateSphere('love-heart-left', { diameter: 0.11, segments: 10 }, scene);
      loveHeartLeft.position.set(-0.2, 0.86, -0.72);
      loveHeartLeft.material = gold;
      loveHeartLeft.parent = head;
      loveHeartLeft.visibility = 0;

      const loveHeartRight = loveHeartLeft.clone('love-heart-right');
      loveHeartRight.position.x = 0.2;

      const loveHeartTop = loveHeartLeft.clone('love-heart-top');
      loveHeartTop.position.set(0, 1.02, -0.72);

      const hat = new TransformNode('hat', scene);
      hat.parent = head;
      hat.position.y = 0.82;

      const hatBand = MeshBuilder.CreateCylinder('hat-band', {
        height: 0.28,
        diameter: 1.22,
        tessellation: 32,
      }, scene);
      hatBand.scaling.y = 0.72;
      hatBand.position.y = -0.02;
      hatBand.material = cream;
      hatBand.parent = hat;

      const hatGold = MeshBuilder.CreateTorus('hat-gold', {
        diameter: 1.18,
        thickness: 0.035,
        tessellation: 32,
      }, scene);
      hatGold.rotation.x = Math.PI / 2;
      hatGold.position.y = -0.12;
      hatGold.material = gold;
      hatGold.parent = hat;

      [-0.34, 0, 0.34].forEach((x, index) => {
        const puff = MeshBuilder.CreateSphere(`hat-puff-${index}`, { diameter: 0.62, segments: 16 }, scene);
        puff.scaling.set(1, 0.82, 0.72);
        puff.position.set(x, 0.28, 0);
        puff.material = cream;
        puff.parent = hat;
      });

      const arms = {};
      const legs = {};
      [-1, 1].forEach((side) => {
        const arm = MeshBuilder.CreateCapsule(`arm-${side}`, {
          height: 0.9,
          radius: 0.16,
          tessellation: 16,
        }, scene);
        arm.position.set(side * 1.05, 0.15, -0.02);
        arm.rotation.z = side * -0.42;
        arm.material = skin;
        arm.parent = character;
        arms[side] = arm;

        const leg = MeshBuilder.CreateCapsule(`leg-${side}`, {
          height: 0.58,
          radius: 0.17,
          tessellation: 16,
        }, scene);
        leg.position.set(side * 0.42, -1.18, -0.02);
        leg.material = sapphireBlue;
        leg.parent = character;
        legs[side] = leg;

        const shoe = MeshBuilder.CreateSphere(`shoe-${side}`, { diameter: 0.46, segments: 12 }, scene);
        shoe.scaling.set(1.18, 0.52, 1);
        shoe.position.set(side * 0.42, -1.52, -0.12);
        shoe.material = gold;
        shoe.parent = character;
      });

      let hover = false;
      let pointerX = 0;
      let pointerY = 0;
      let blinkUntil = 0;
      let nextBlink = performance.now() + 2200;
      let visitX = 0;
      let visitY = 0;
      let visitLean = 0;
      let idleLookUntil = 0;
      let idleLookX = 0;
      let nextIdleLook = performance.now() + 6500 + Math.random() * 5500;

      const startTime = performance.now();
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (interactive) {
        pointerHandler = (event) => {
          const rect = canvas.getBoundingClientRect();
          pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
          pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
          hover = true;
        };
        pointerLeaveHandler = () => {
          pointerX = 0;
          pointerY = 0;
          hover = false;
        };
        canvas.addEventListener('pointermove', pointerHandler);
        canvas.addEventListener('pointerleave', pointerLeaveHandler);
      }

      resizeObserver = new ResizeObserver(() => engine?.resize());
      resizeObserver.observe(canvas);

      engine.runRenderLoop(() => {
        const now = performance.now();
        if (!animated || reduceMotion) {
          scene.render();
          return;
        }

        const elapsed = (now - startTime) / 1000;
        const emotionName = emotionRef?.current?.name || 'IDLE';
        const emotionAge = emotionRef?.current?.changedAt
          ? (now - emotionRef.current.changedAt) / 1000
          : elapsed;

        const profiles = {
          IDLE: { eye: 1.15, float: 0.09, speed: 1.35, tilt: 0, bounce: 0, sway: 0.025, brow: 0 },
          HAPPY: { eye: 1.08, float: 0.12, speed: 1.55, tilt: 0.055, bounce: 0.08, sway: 0.018, brow: -0.025 },
          EXCITED: { eye: 1.38, float: 0.17, speed: 2.4, tilt: -0.025, bounce: 0.16, sway: 0.055, brow: -0.08 },
          CURIOUS: { eye: 1.12, float: 0.07, speed: 1.05, tilt: 0.18, bounce: 0.02, sway: 0.018, brow: 0.12 },
          LOVE: { eye: 0.82, float: 0.1, speed: 1.15, tilt: 0.035, bounce: 0.06, sway: 0.018, brow: -0.055 },
          SURPRISED: { eye: 1.48, float: 0.15, speed: 2.2, tilt: 0.015, bounce: 0.14, sway: 0.012, brow: 0.18 },
          SAD: { eye: 0.78, float: 0.045, speed: 0.75, tilt: -0.12, bounce: -0.06, sway: 0.012, brow: 0.14 },
          SLEEPY: { eye: 0.38, float: 0.045, speed: 0.62, tilt: 0.12, bounce: -0.04, sway: 0.008, brow: 0.09 },
          CELEBRATING: { eye: 1.12, float: 0.18, speed: 2.8, tilt: 0.04, bounce: 0.21, sway: 0.05, brow: -0.06 },
          THINKING: { eye: 1.04, float: 0.055, speed: 0.82, tilt: -0.17, bounce: 0.015, sway: 0.012, brow: 0.06 },
        };
        const profile = profiles[emotionName] || profiles.IDLE;

        if (emotionName === 'IDLE') {
          if (now >= nextIdleLook) {
            idleLookX = (Math.random() * 2 - 1) * 0.1;
            idleLookUntil = now + 900 + Math.random() * 900;
            nextIdleLook = idleLookUntil + 7000 + Math.random() * 6000;
          }
        } else {
          idleLookX = 0;
          idleLookUntil = 0;
        }
        if (now >= idleLookUntil) idleLookX *= 0.92;

        const entrance = Math.min(1, emotionAge * 3);
        const celebrationPulse = emotionName === 'CELEBRATING'
          ? Math.max(0, Math.sin(elapsed * 5.4)) * 0.08
          : 0;
        const surprisedPulse = emotionName === 'SURPRISED'
          ? Math.max(0, Math.sin(elapsed * 4.2)) * 0.04
          : 0;
        const float = Math.sin(elapsed * profile.speed) * profile.float
          + profile.bounce * 0.45 + celebrationPulse + surprisedPulse;
        const target = targetRef?.current || { x: 0, y: 0, active: false, lean: 0 };
        visitX += ((target.active ? target.x : 0) - visitX) * 0.055;
        visitY += ((target.active ? target.y : 0) - visitY) * 0.055;
        visitLean += ((target.active ? target.lean : 0) - visitLean) * 0.055;
        character.position.y = float;
        character.rotation.z = (Math.sin(elapsed * profile.speed * 0.55) * profile.sway) - visitLean * 0.09;
        character.rotation.y = target.active
          ? Math.max(-0.24, Math.min(0.24, visitX * 0.24))
          : hover
            ? Math.max(-0.24, Math.min(0.24, pointerX * 0.24))
            : Math.sin(elapsed * 0.55) * profile.sway;

        head.rotation.y = target.active
          ? Math.max(-0.24, Math.min(0.24, visitX * 0.24))
          : Math.max(-0.22, Math.min(0.22, pointerX * 0.22 + idleLookX));
        head.rotation.x = profile.tilt * entrance
          + (target.active
            ? Math.max(-0.12, Math.min(0.12, visitY * -0.1))
            : Math.max(-0.12, Math.min(0.12, pointerY * -0.1)));
        head.rotation.z = profile.tilt * 0.12 * entrance;

        const gazeX = target.active ? visitX : pointerX + idleLookX * 2;
        pupilLeft.position.x = -0.34 + gazeX * 0.035;
        pupilRight.position.x = 0.34 + gazeX * 0.035;
        irisLeft.position.x = -0.34 + gazeX * 0.035;
        irisRight.position.x = 0.34 + gazeX * 0.035;

        if (emotionName === 'EXCITED' || emotionName === 'SURPRISED') {
          blinkUntil = 0;
          nextBlink = now + 1800;
        } else if (emotionName === 'SLEEPY') {
          if (now >= nextBlink) {
            blinkUntil = now + 520;
            nextBlink = now + 2400 + Math.random() * 2200;
          }
        } else if (now >= nextBlink) {
          blinkUntil = now + (emotionName === 'HAPPY' || emotionName === 'LOVE' ? 105 : 140);
          nextBlink = now + 2600 + Math.random() * 2400;
        }
        const blinking = now < blinkUntil;
        let eyeScale = profile.eye;
        if (emotionName === 'SLEEPY') eyeScale = 0.38 + Math.sin(elapsed * 0.8) * 0.04;
        if (blinking) eyeScale = 0.08;
        eyeLeft.scaling.y += (eyeScale - eyeLeft.scaling.y) * 0.18;
        eyeRight.scaling.y += (eyeScale - eyeRight.scaling.y) * 0.18;
        pupilLeft.visibility = blinking ? 0 : 1;
        pupilRight.visibility = blinking ? 0 : 1;
        irisLeft.visibility = blinking ? 0 : 1;
        irisRight.visibility = blinking ? 0 : 1;

        const browLift = emotionName === 'CURIOUS' || emotionName === 'SURPRISED' ? 0.08 : profile.brow;
        browLeft.position.y += (0.43 + browLift - browLeft.position.y) * 0.12;
        browRight.position.y += (0.43 + (emotionName === 'CURIOUS' ? -0.04 : browLift) - browRight.position.y) * 0.12;
        browLeft.rotation.z += ((emotionName === 'SAD' ? -0.18 : emotionName === 'CURIOUS' ? 0.18 : Math.PI / 2) - browLeft.rotation.z) * 0.12;
        browRight.rotation.z += ((emotionName === 'SAD' ? 0.18 : emotionName === 'CURIOUS' ? -0.18 : Math.PI / 2) - browRight.rotation.z) * 0.12;

        smile.scaling.y += ((emotionName === 'SAD' || emotionName === 'SLEEPY' ? 0.55 : 1) - smile.scaling.y) * 0.1;
        smile.rotation.z += (((emotionName === 'SAD' || emotionName === 'SLEEPY') ? 0 : Math.PI) - smile.rotation.z) * 0.12;
        smile.position.y += ((emotionName === 'SURPRISED' ? -0.22 : emotionName === 'SAD' ? -0.34 : -0.28) - smile.position.y) * 0.12;

        const loveVisible = emotionName === 'LOVE' ? 1 : 0;
        loveHeartLeft.visibility = loveVisible;
        loveHeartRight.visibility = loveVisible;
        loveHeartTop.visibility = loveVisible;
        if (loveVisible) {
          const heartBob = Math.sin(elapsed * 2.2) * 0.06;
          loveHeartLeft.position.y = 0.86 + heartBob;
          loveHeartRight.position.y = 0.86 + heartBob;
          loveHeartTop.position.y = 1.02 + heartBob;
        }

        cheekLeft.visibility = ['HAPPY', 'LOVE', 'CELEBRATING', 'EXCITED'].includes(emotionName) ? 1 : 0.28;
        cheekRight.visibility = cheekLeft.visibility;

        arms[-1].rotation.z += ((emotionName === 'CELEBRATING' ? -1.05 : emotionName === 'EXCITED' ? -0.72 : -0.42) - arms[-1].rotation.z) * 0.1;
        arms[1].rotation.z += ((emotionName === 'CELEBRATING' ? 1.05 : emotionName === 'EXCITED' ? 0.72 : 0.42) - arms[1].rotation.z) * 0.1;

        scene.render();
      });

      return () => {
        if (pointerHandler) canvas.removeEventListener('pointermove', pointerHandler);
        if (pointerLeaveHandler) canvas.removeEventListener('pointerleave', pointerLeaveHandler);
        resizeObserver?.disconnect();
        scene?.dispose();
        engine?.dispose();
      };
    } catch (error) {
      setFallback(true);
      scene?.dispose();
      engine?.dispose();
      return undefined;
    }
  }, [size, interactive, animated]);

  const dimensions = size === 'small'
    ? 'mascot-canvas mascot-canvas-small'
    : size === 'large'
      ? 'mascot-canvas mascot-canvas-large'
      : 'mascot-canvas';

  if (fallback) {
    return (
      <div className={`${dimensions} mascot-fallback ${className}`} role="img" aria-label={ariaLabel}>
        <span>SV</span>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`${dimensions} ${className}`}
      role="img"
      aria-label={ariaLabel}
    />
  );
}

export default MascotScene;