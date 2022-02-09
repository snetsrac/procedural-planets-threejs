import * as THREE from "three";
import { createSimplexNoiseGenerator } from "./simplex";

// TYPES

interface NoiseSettings {
  strength: number;
  roughness: number;
  readonly center: THREE.Vector3;
  numPasses: number;
  strengthFactor: number;
  roughnessFactor: number;
  minValue: number;
}

interface NoiseLayer {
  enabled: boolean;
  readonly noiseSettings: NoiseSettings;
}

interface NoiseFilter {
  evaluate: (point: THREE.Vector3) => number
}

// CONSTANTS/DEFAULTS

const DEFAULT_STRENGTH = 0.5;
const DEFAULT_ROUGHNESS = 1;
const DEFAULT_CENTER_XYZ = 0;
const DEFAULT_NUM_PASSES = 4;
const DEFAULT_STRENGTH_FACTOR = 0.5;
const DEFAULT_ROUGHNESS_FACTOR = 2;
const DEFAULT_MIN_VALUE = 0.9;

const NOISE_GUI_PARAMS = {
  strength: [0, 1],
  roughness: [0, 5],
  centerXYZ: [-2, 2],
  numPasses: [1, 8, 1],
  strengthFactor: [0, 1],
  roughnessFactor: [0, 3],
  minValue: [0, 2]
};

// FUNCTIONS

function createNoiseSettings(): NoiseSettings {
  return {
    strength: DEFAULT_STRENGTH,
    roughness: DEFAULT_ROUGHNESS,
    center: new THREE.Vector3(DEFAULT_CENTER_XYZ, DEFAULT_CENTER_XYZ, DEFAULT_CENTER_XYZ),
    numPasses: DEFAULT_NUM_PASSES,
    strengthFactor: DEFAULT_STRENGTH_FACTOR,
    roughnessFactor: DEFAULT_ROUGHNESS_FACTOR,
    minValue: DEFAULT_MIN_VALUE
  };
}

function createNoiseFilter(settings: NoiseSettings): NoiseFilter {
  const noiseGenerator = createSimplexNoiseGenerator();

  return {
    evaluate: (point: THREE.Vector3) => {
      // Rescale from [-1, 1] to [0, 1]
      let noiseValue = 0;
      let frequency = settings.roughness;
      let amplitude = 1;
      
      for (let i = 0; i < settings.numPasses; i++) {
        const noise = noiseGenerator.evaluate(point.clone().multiplyScalar(frequency).add(settings.center));
        noiseValue += (noise + 1) * 0.5 * amplitude;
        frequency *= settings.roughnessFactor;
        amplitude *= settings.strengthFactor;
      }

      noiseValue = Math.max(0, noiseValue - settings.minValue);
      return noiseValue * settings.strength;
    }
  };
}

export { createNoiseSettings, createNoiseFilter, NOISE_GUI_PARAMS, NoiseSettings, NoiseLayer, NoiseFilter };
