import { createNoiseFilter, createNoiseSettings, type NoiseSettings } from "./noise";

// TYPES

interface ShapeSettings {
  radius: number;
  readonly noiseSettings: NoiseSettings
}

interface ShapeGenerator {
  calculatePointOnPlanet: (pointOnUnitSphere: THREE.Vector3) => THREE.Vector3
}

// CONSTANTS/DEFAULTS

const DEFAULT_RADIUS = 1.5;

const SHAPE_SETTINGS_LIMITS = Object.freeze({
  minRadius: 0.1,
  maxRadius: 10
});

// FUNCTIONS

function createShapeSettings(): ShapeSettings {
  return {
    radius: DEFAULT_RADIUS,
    noiseSettings: createNoiseSettings()
  }
}

function createShapeGenerator(settings: ShapeSettings): ShapeGenerator {
  const noiseFilter = createNoiseFilter();
  const { roughness, strength, center } = settings.noiseSettings;

  return {
    calculatePointOnPlanet: (pointOnUnitSphere: THREE.Vector3) => {
      const noiseValue = noiseFilter.evaluate(pointOnUnitSphere.clone().multiplyScalar(roughness).add(center)) + 1;
      const elevation = noiseValue * strength * 0.5;
      return pointOnUnitSphere.clone().multiplyScalar(settings.radius * (1 + elevation));
    }
  };
}

export { createShapeSettings, createShapeGenerator, SHAPE_SETTINGS_LIMITS, ShapeSettings, ShapeGenerator };
