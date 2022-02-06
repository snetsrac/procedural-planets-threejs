import GUI from 'lil-gui';
import { Planet } from './planet';

function initGUI(planet: Planet) {
  const gui = new GUI();

  const guiObject = {
    color: planet.getColorSettings().color,
    resolution: planet.getShapeSettings().resolution,
    radius: planet.getShapeSettings().radius,
    button: planet.toggleVisibility
  };

  gui.addColor(guiObject, 'color').name('Set planet color')
    .onChange((value: THREE.ColorRepresentation) => {
      const colorSettings = planet.getColorSettings();
      colorSettings.color = value;
      planet.setColorSettings(colorSettings);
    });

  gui.add(guiObject, 'resolution', 2, 100, 1).name('Set planet resolution')
    .onChange((value: number) => {
      planet.setShapeSettings({ ...planet.getShapeSettings(), resolution: value });
    });

  gui.add(guiObject, 'radius', 0.5, 10).name('Set planet radius')
    .onChange((value: number) => {
      planet.setShapeSettings({ ...planet.getShapeSettings(), radius: value });
    });
    
  gui.add(guiObject, 'button').name('Toggle planet');
}

export default initGUI;
