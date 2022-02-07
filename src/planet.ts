import * as THREE from 'three';
import * as BGU from 'three/examples/jsm/utils/BufferGeometryUtils';
import { type NoiseSettings, DEFAULT_NOISE_SETTINGS, createNoiseGenerator } from './noise';
import { createTerrainFace } from './terrainFace';

// TYPES

interface ColorSettings {
  color: THREE.ColorRepresentation;
}

interface ShapeSettings {
  resolution: number;
  radius: number;
  noiseSettings: NoiseSettings
}

type ShapeGenerator = (point: THREE.Vector3) => THREE.Vector3;

interface Planet {
  mesh: THREE.Mesh;
  getColorSettings: () => ColorSettings;
  getShapeSettings: () => ShapeSettings;
  setColorSettings: (colorSettings: Partial<ColorSettings>) => void;
  setShapeSettings: (shapeSettings: Partial<Omit<ShapeSettings, 'noiseSettings'>>) => void;
  setNoiseSettings: (noiseSettings: Partial<NoiseSettings>) => void;
  toggleVisibility: () => void
}

// CONSTANTS/DEFAULTS

const DIRECTIONS: THREE.Vector3[] = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1),
];

const DEFAULT_COLOR_SETTINGS: ColorSettings = {
  color: 0x009900
};

const DEFAULT_SHAPE_SETTINGS: ShapeSettings = {
  resolution: 10,
  radius: 1,
  noiseSettings: DEFAULT_NOISE_SETTINGS
};

const SHAPE_SETTINGS_LIMITS = {
  minResolution: 2,
  maxResolution: 256,
  minRadius: 0.1,
  maxRadius: 10
};

// FUNCTIONS

// Create a planet object using the passed in or default settings. Generates new
// geometry, material, and mesh. Includes functions to modify the planet's settings
// after creation.
function createPlanet(colorSettings?: ColorSettings, shapeSettings?: ShapeSettings): Planet {
  let _colorSettings = colorSettings ?? DEFAULT_COLOR_SETTINGS;
  let _shapeSettings = shapeSettings ?? DEFAULT_SHAPE_SETTINGS;
  const geometry = constructGeometry(_shapeSettings);
  const material = constructMaterial(_colorSettings);
  const mesh = new THREE.Mesh(geometry, material);

  function setColorSettings(this: Planet, colorSettings: Partial<ColorSettings>): void {
    _colorSettings = { ..._colorSettings, ...colorSettings };

    if (this.mesh.material instanceof THREE.Material) {
      this.mesh.material.dispose();
    } else {
      this.mesh.material.forEach((material) => material.dispose());
    }

    this.mesh.material = constructMaterial(_colorSettings);
  }

  function setShapeSettings(this: Planet, shapeSettings: Partial<Omit<ShapeSettings, 'noiseSettings'>>): void {
    _shapeSettings = { ..._shapeSettings, ...shapeSettings };
    this.mesh.geometry.dispose();
    this.mesh.geometry = constructGeometry(_shapeSettings);
  }

  function setNoiseSettings(this: Planet, noiseSettings: Partial<NoiseSettings>) {
    _shapeSettings.noiseSettings = { ..._shapeSettings.noiseSettings, ...noiseSettings };
    this.mesh.geometry.dispose();
    this.mesh.geometry = constructGeometry(_shapeSettings);
  }

  return {
    mesh,
    getColorSettings: () => ({ ..._colorSettings }),
    getShapeSettings: () => ({ ..._shapeSettings }),
    setColorSettings,
    setShapeSettings,
    setNoiseSettings,
    toggleVisibility: () => { mesh.visible = !mesh.visible; }
  };
}

// Create the six terrain faces in each direction, then merge into a single geometry
function constructGeometry(shapeSettings: ShapeSettings): THREE.BufferGeometry {
  const shapeGenerator = createShapeGenerator(shapeSettings);
  const faces: THREE.BufferGeometry[] = [];

  DIRECTIONS.forEach((direction) => {
    faces.push(createTerrainFace(direction, shapeSettings.resolution, shapeGenerator));
  });

  const geometry = BGU.mergeVertices(BGU.mergeBufferGeometries(faces));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  geometry.computeVertexNormals();

  return geometry;
}

// Construct a terrain material
function constructMaterial(colorSettings: ColorSettings) {
  return new THREE.MeshStandardMaterial({ color: colorSettings.color, flatShading: true });
}

// Generate a point on the planet surface from a point on the unit sphere, using
// the information in shapeSettings
function createShapeGenerator(shapeSettings: ShapeSettings): ShapeGenerator {
  const noiseGenerator = createNoiseGenerator();
  const { roughness, strength, center } = shapeSettings.noiseSettings;

  return function (point: THREE.Vector3) {
    const elevation =
      (noiseGenerator.evaluate(point.clone().multiplyScalar(roughness).add(center)) + 1)
      * strength * 0.5;
    
    return point.clone().multiplyScalar(shapeSettings.radius * (1 + elevation));
  };
}

export {
  ColorSettings,
  ShapeSettings,
  Planet,
  ShapeGenerator,
  SHAPE_SETTINGS_LIMITS,
  createPlanet
};
