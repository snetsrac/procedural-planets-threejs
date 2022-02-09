import * as THREE from "three";
import { createSimplexNoiseGenerator } from "./simplex";

// TYPES

interface NoiseSettings {
  roughness: number;
  strength: number;
  readonly center: THREE.Vector3;
}

interface NoiseFilter {
  evaluate: (point: THREE.Vector3) => number
}

// CONSTANTS/DEFAULTS

const DEFAULT_ROUGHNESS = 2.5;
const DEFAULT_STRENGTH = 0.5;

const NOISE_SETTINGS_LIMITS = Object.freeze({
  minRoughness: 0,
  maxRoughness: 5,
  minStrength: 0,
  maxStrength: 1,
  minCenter: -2,
  maxCenter: 2
});

// FUNCTIONS

function createNoiseSettings(): NoiseSettings {
  return {
    roughness: DEFAULT_ROUGHNESS,
    strength: DEFAULT_STRENGTH,
    center: new THREE.Vector3()
  };
}

function createNoiseFilter(): NoiseFilter {
  const noiseGenerator = createSimplexNoiseGenerator();

  return {
    evaluate: (point: THREE.Vector3) => {
      // Rescale from [-1, 1] to [0, 1]
      const noiseValue = (noiseGenerator.evaluate(point) + 1) * 0.5;
      return noiseValue;
    }
  };
}

export { createNoiseSettings, createNoiseFilter, NOISE_SETTINGS_LIMITS, NoiseSettings };
