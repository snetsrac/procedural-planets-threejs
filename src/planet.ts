import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
import { ColorSettings, createColorSettings } from './color';
import { createShapeGenerator, createShapeSettings, ShapeGenerator, type ShapeSettings } from './shape';
import { createTerrainFace } from './terrainFace';

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

const DIRECTIONS: THREE.Vector3[] = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1),
];

// FUNCTIONS

// Create a planet object using the passed in or default settings. Generates new
// geometry, material, and mesh. Includes functions to modify the planet's settings
// after creation.
function createPlanet(): Planet {
  let resolution = DEFAULT_RESOLUTION;
  const shapeSettings = createShapeSettings();
  const colorSettings = createColorSettings();

  let shapeGenerator: ShapeGenerator;
  let terrainFaces: THREE.BufferGeometry[];
  const mesh: THREE.Mesh = new THREE.Mesh();

  generatePlanet();

  // Create the six terrain faces in each direction, then merge into a single geometry
  function constructGeometry() {
    shapeGenerator = createShapeGenerator(shapeSettings);
    terrainFaces = [];

    DIRECTIONS.forEach((direction) => {
      terrainFaces.push(createTerrainFace(direction, resolution, shapeGenerator));
    });

    mesh.geometry.dispose();  
    mesh.geometry = BufferGeometryUtils.mergeVertices(BufferGeometryUtils.mergeBufferGeometries(terrainFaces));
    mesh.geometry.computeBoundingBox();
    mesh.geometry.computeBoundingSphere();
    mesh.geometry.computeVertexNormals();
  }

  // Construct a terrain material
  function constructMaterial() {
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach(material => { material.dispose(); });
    } else {
      mesh.material.dispose();
    }

    mesh.material = new THREE.MeshStandardMaterial({ ...colorSettings, flatShading: true });
  }

  function generatePlanet() {
    constructGeometry();
    constructMaterial();
  }

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
}

export { createPlanet, PLANET_GUI_PARAMS, ColorSettings, Planet };
