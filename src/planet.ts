import * as THREE from 'three';
import * as BGU from 'three/examples/jsm/utils/BufferGeometryUtils';
import { createTerrainFace } from './terrainFace';

interface ColorSettings {
  color: THREE.ColorRepresentation;
}

interface ShapeSettings {
  resolution: number;
  radius: number;
}

interface Planet {
  mesh: THREE.Mesh;
  getColorSettings: () => ColorSettings;
  getShapeSettings: () => ShapeSettings;
  setColorSettings: (colorSettings: ColorSettings) => void;
  setShapeSettings: (shapeSettings: ShapeSettings) => void;
  toggleVisibility: () => void
}

const DIRECTIONS: THREE.Vector3[] = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(-1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, -1, 0),
  new THREE.Vector3(0, 0, 1),
  new THREE.Vector3(0, 0, -1),
];

const DEFAULT_COLOR_SETTINGS: ColorSettings = {
  color: 0x000099
};

const DEFAULT_SHAPE_SETTINGS: ShapeSettings = {
  resolution: 10,
  radius: 1
};

function createPlanet(colorSettings?: ColorSettings, shapeSettings?: ShapeSettings) {
  let _colorSettings = colorSettings ?? DEFAULT_COLOR_SETTINGS;
  let _shapeSettings = shapeSettings ?? DEFAULT_SHAPE_SETTINGS;
  const geometry = constructGeometry(_shapeSettings);
  const material = constructMaterial(_colorSettings);
  const mesh = new THREE.Mesh(geometry, material);

  function setColorSettings(this: Planet, colorSettings: ColorSettings): void {
    _colorSettings = colorSettings;
  
    if (this.mesh.material instanceof THREE.Material) {
      this.mesh.material.dispose();
    } else {
      this.mesh.material.forEach((material) => material.dispose());
    }
  
    this.mesh.material = constructMaterial(_colorSettings);
  }
  
  function setShapeSettings(this: Planet, shapeSettings: ShapeSettings): void {
    _shapeSettings = shapeSettings;
    this.mesh.geometry.dispose();
    this.mesh.geometry = constructGeometry(_shapeSettings);
  }

  return {
    mesh,
    getColorSettings: () => ({ ..._colorSettings }),
    getShapeSettings: () => ({ ..._shapeSettings }),
    setColorSettings,
    setShapeSettings,
    toggleVisibility: () => { mesh.visible = !mesh.visible; } 
  };
}

function constructGeometry(shapeSettings: ShapeSettings): THREE.BufferGeometry {
  const faces: THREE.BufferGeometry[] = [];

  DIRECTIONS.forEach((direction) => {
    faces.push(createTerrainFace(direction, shapeSettings));
  });

  const geometry = BGU.mergeVertices(BGU.mergeBufferGeometries(faces));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  geometry.computeVertexNormals();

  return geometry;
}

function constructMaterial(colorSettings: ColorSettings) {
  return new THREE.MeshPhongMaterial({ color: colorSettings.color, flatShading: true });
}

export {
  ColorSettings,
  ShapeSettings,
  Planet,
  createPlanet
};
