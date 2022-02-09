import GUI from 'lil-gui';
import { NOISE_GUI_PARAMS } from './noise';
import { Planet, PLANET_GUI_PARAMS } from './planet';
import { SHAPE_GUI_PARAMS } from './shape';

function initGUI(planet: Planet) {
  const gui = new GUI();
  const guiObject = {
    autoUpdate: true,
    logPlanet: () => { console.log(planet); }
  };

  gui.add(planet, 'resolution', ...PLANET_GUI_PARAMS.resolution).name('Resolution').onChange(onChangePlanetSettings);
  gui.add(planet.shapeSettings, 'radius', ...SHAPE_GUI_PARAMS.radius).name('Radius').onChange(onChangePlanetSettings);

  planet.shapeSettings.noiseLayers.forEach((noiseLayer, i) => {
    const noiseSettings = noiseLayer.noiseSettings;
    const noiseFolder = gui.addFolder(`Noise layer ${i}`).onChange(onChangePlanetSettings);
    noiseFolder.add(noiseLayer, 'enabled').name('Enabled');
    noiseFolder.add(noiseSettings, 'strength', ...NOISE_GUI_PARAMS.strength).name('Strength');
    noiseFolder.add(noiseSettings, 'roughness', ...NOISE_GUI_PARAMS.roughness).name('Roughness');
    noiseFolder.add(noiseSettings, 'numPasses', ...NOISE_GUI_PARAMS.numPasses).name('Number of passes');
    noiseFolder.add(noiseSettings, 'strengthFactor', ...NOISE_GUI_PARAMS.strengthFactor).name('Strength factor');
    noiseFolder.add(noiseSettings, 'roughnessFactor', ...NOISE_GUI_PARAMS.roughnessFactor).name('Roughness factor');
    noiseFolder.add(noiseSettings, 'minValue', ...NOISE_GUI_PARAMS.minValue).name('Min value');

    const centerFolder = noiseFolder.addFolder('Center').close();
    centerFolder.add(noiseSettings.center, 'x', ...NOISE_GUI_PARAMS.centerXYZ);
    centerFolder.add(noiseSettings.center, 'y', ...NOISE_GUI_PARAMS.centerXYZ);
    centerFolder.add(noiseSettings.center, 'z', ...NOISE_GUI_PARAMS.centerXYZ);
  });

  gui.addColor(planet.colorSettings, 'color').name('Color').onChange(onChangePlanetSettings);
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
