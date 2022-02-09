import { createNoiseFilter, createNoiseSettings, NoiseFilter, type NoiseLayer, type NoiseSettings } from "./noise";

// TYPES

interface ShapeSettings {
  radius: number;
  readonly noiseLayers: NoiseLayer[]
}

interface ShapeGenerator {
  calculatePointOnPlanet: (pointOnUnitSphere: THREE.Vector3) => THREE.Vector3
}

// CONSTANTS/DEFAULTS

const DEFAULT_RADIUS = 1.5;
const DEFAULT_NUM_NOISE_LAYERS = 2;

const SHAPE_GUI_PARAMS = {
  radius: [0.1, 10]
};

// FUNCTIONS

function createShapeSettings(): ShapeSettings {
  const noiseLayers = [];

  for (let i = 0; i < DEFAULT_NUM_NOISE_LAYERS; i++) {
    noiseLayers.push({ enabled: true, noiseSettings: createNoiseSettings() });
  }

  return {
    radius: DEFAULT_RADIUS,
    noiseLayers
  }
}

function createShapeGenerator(settings: ShapeSettings): ShapeGenerator {
  const noiseFilters: NoiseFilter[] = [];
  
  for (let i = 0; i < settings.noiseLayers.length; i++) {
      noiseFilters.push(createNoiseFilter(settings.noiseLayers[i].noiseSettings));
  }

  function calculatePointOnPlanet(pointOnUnitSphere: THREE.Vector3)  {
    let elevation = 0;

    for (let i = 0; i < noiseFilters.length; i++) {
      if (settings.noiseLayers[i].enabled) {
        elevation += noiseFilters[i].evaluate(pointOnUnitSphere);
      }
    }

    return pointOnUnitSphere.clone().multiplyScalar(settings.radius * (1 + elevation));
  }

  return {
    calculatePointOnPlanet
  };
}

export { createShapeSettings, createShapeGenerator, SHAPE_GUI_PARAMS, ShapeSettings, ShapeGenerator };
