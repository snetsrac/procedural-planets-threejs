import GUI, { Controller } from 'lil-gui';
import { NOISE_SETTINGS_LIMITS as noise } from './noise';
import { Planet, RESOLUTION_LIMITS as resolution } from './planet';
import { SHAPE_SETTINGS_LIMITS as shape } from './shape';

interface GUIEvent {
  object: object;
  property: string;
  value: any;
  controller: Controller;
}

function initGUI(planet: Planet) {
  const gui = new GUI();
  const guiObject = {
    autoUpdate: true,
    logPlanet: () => { console.log(planet); }
  };

  gui.add(planet, 'resolution', resolution.minResolution, resolution.maxResolution, 1).name('Set planet resolution').onChange(onChangePlanetSettings);
  gui.add(planet.shapeSettings, 'radius', shape.minRadius, shape.maxRadius).name('Set planet radius').onChange(onChangePlanetSettings);
  gui.add(planet.shapeSettings.noiseSettings, 'roughness', noise.minRoughness, noise.maxRoughness).name('Set noise roughness').onChange(onChangePlanetSettings);
  gui.add(planet.shapeSettings.noiseSettings, 'strength', noise.minStrength, noise.maxStrength).name('Set noise strength').onChange(onChangePlanetSettings);

  // const center = gui.addFolder('Set noise center')
  // center.add(planet.shapeSettings.noiseSettings.center, 'x', noise.minCenter, noise.maxCenter);
  // center.add(planet.shapeSettings.noiseSettings.center, 'y', noise.minCenter, noise.maxCenter);
  // center.add(planet.shapeSettings.noiseSettings.center, 'z', noise.minCenter, noise.maxCenter);

  gui.addColor(planet.colorSettings, 'color').name('Set planet color').onChange(onChangePlanetSettings);
  gui.add(planet.mesh, 'visible').name('Show planet').onChange(onChangePlanetSettings);
  gui.add(guiObject, 'autoUpdate').name('Auto update');
  gui.add(guiObject, 'logPlanet').name('Console.log planet');
  gui.add(planet, 'generatePlanet').name('Generate planet');

  function onChangePlanetSettings() {
    if (guiObject.autoUpdate === true) {
      planet.generatePlanet();
    }
  };
}

export default initGUI;
