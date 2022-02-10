import * as THREE from 'three';
import { createColorSettings, type ColorSettings } from './color';
import { createShapeGenerator, createShapeSettings, type ShapeSettings } from './shape';
import { constructGeometry } from './geometry';

// TYPES

interface Planet {
  resolution: number;
  readonly shapeSettings: ShapeSettings;
  readonly colorSettings: ColorSettings;
  readonly mesh: THREE.Mesh;
  generatePlanet: () => void
}

// CONSTANTS/DEFAULTS

const DEFAULT_RESOLUTION = 40;

const PLANET_GUI_PARAMS = {
  resolution: [2, 256, 1]
};

// FUNCTIONS

function createPlanet(): Planet {
  let resolution = DEFAULT_RESOLUTION;
  const shapeSettings = createShapeSettings();
  const colorSettings = createColorSettings();
  const mesh: THREE.Mesh = new THREE.Mesh();

  generatePlanet();

  // Trivial get/set on resolution is necessary because it is declared in the closure and
  // passed to helper functions. Otherwise planet.resolution = # would not affect the
  // closure variable.
  return {
    get resolution() { return resolution; },
    set resolution(value) { resolution = value; },
    shapeSettings,
    colorSettings,
    mesh,
    generatePlanet
  };

  function generateGeometry() {
    const shapeGenerator = createShapeGenerator(shapeSettings);
    const geometry = constructGeometry(resolution, shapeGenerator);
    mesh.geometry.dispose();  
    mesh.geometry = geometry;
  }

  function constructMaterial() {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(material => { material.dispose(); });
    } else {
      mesh.material.dispose();
    }

    mesh.material = new THREE.MeshStandardMaterial({ ...colorSettings, flatShading: true });
  }

  function generatePlanet() {
    generateGeometry();
    constructMaterial();
  }
}

export { createPlanet, PLANET_GUI_PARAMS, ColorSettings, Planet };
