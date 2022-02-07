import GUI, { Controller } from 'lil-gui';
import * as THREE from 'three';
import { type Planet, SHAPE_SETTINGS_LIMITS as shape } from './planet';
import { NOISE_SETTINGS_LIMITS as noise } from './noise';

interface GUIEvent {
  object: object;
  property: string;
  value: any;
  controller: Controller;
}

function initGUI(planet: Planet) {
  const gui = new GUI();
  const shapeSettings = planet.getShapeSettings();

  const guiObject = {
    color: planet.getColorSettings().color,
    resolution: shapeSettings.resolution,
    radius: shapeSettings.radius,
    roughness: shapeSettings.noiseSettings.roughness,
    strength: shapeSettings.noiseSettings.strength,
    center: shapeSettings.noiseSettings.center,
    button: planet.toggleVisibility
  };

  gui.addColor(guiObject, 'color').name('Set planet color').onChange((value: THREE.ColorRepresentation) => {
    const colorSettings = planet.getColorSettings();
    colorSettings.color = value;
    planet.setColorSettings(colorSettings);
  });

  gui.add(guiObject, 'resolution', shape.minResolution, shape.maxResolution, 1).name('Set planet resolution').onChange((value: number) => {
    planet.setShapeSettings({ resolution: value });
  });

  gui.add(guiObject, 'radius', shape.minRadius, shape.maxRadius).name('Set planet radius').onChange((value: number) => {
    planet.setShapeSettings({ radius: value });
  });

  gui.add(guiObject, 'roughness', noise.minRoughness, noise.maxRoughness).name('Set noise roughness')
    .onChange((value: number) => {
      planet.setNoiseSettings({ roughness: value });
    });

  gui.add(guiObject, 'strength', noise.minStrength, noise.maxStrength).name('Set noise strength')
    .onChange((value: number) => {
      planet.setNoiseSettings({ strength: value });
    });

  const center = gui.addFolder('Set noise center').onChange((event: GUIEvent) => {
    if (event.object instanceof THREE.Vector3) {
      planet.setNoiseSettings({ center: event.object });
    }
  });
  center.add(guiObject.center, 'x', noise.minCenter, noise.maxCenter);
  center.add(guiObject.center, 'y', noise.minCenter, noise.maxCenter);
  center.add(guiObject.center, 'z', noise.minCenter, noise.maxCenter);
    
  gui.add(guiObject, 'button').name('Toggle planet');
}

export default initGUI;
