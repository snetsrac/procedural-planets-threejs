/**
 * Terrain face generation adapted from code by Sebastian Lague:
 * https://github.com/SebLague/Procedural-Planets
 */

import * as THREE from 'three';
import { ShapeSettings } from './planet';

function createTerrainFace(localUp: THREE.Vector3, shapeSettings: ShapeSettings): THREE.BufferGeometry {
  const resolution = shapeSettings.resolution;
  const axisA = new THREE.Vector3(localUp.y, localUp.z, localUp.x);
  const axisB = localUp.clone().cross(axisA);

  const vertices = new Float32Array(resolution * resolution * 3);
  const triangles = new Uint32Array((resolution - 1) * (resolution - 1) * 6);
  let triIndex = 0;

  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const index = x + y * resolution;
      const percent = new THREE.Vector2(x, y).divideScalar(resolution - 1);
      const aVector = axisA.clone().multiplyScalar((percent.x * 2) - 1);
      const bVector = axisB.clone().multiplyScalar((percent.y * 2) - 1);
      const pointOnUnitCube = localUp.clone().add(aVector).add(bVector);
      const pointOnUnitSphere = mapCubeToSphere(pointOnUnitCube);
      const pointOnPlanetSurface = pointOnUnitSphere.multiplyScalar(shapeSettings.radius);
      pointOnPlanetSurface.toArray(vertices, index * 3);

      if (x != resolution - 1 && y != resolution - 1) {
        triangles[triIndex] = index;
        triangles[triIndex + 1] = index + resolution + 1;
        triangles[triIndex + 2] = index + resolution;
        triangles[triIndex + 3] = index;
        triangles[triIndex + 4] = index + 1;
        triangles[triIndex + 5] = index + resolution + 1;
        triIndex += 6;
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(new THREE.BufferAttribute(triangles, 1));

  return geometry;
}

function mapCubeToSphere(vertex: THREE.Vector3): THREE.Vector3 {
  const x = vertex.x;
  const y = vertex.y;
  const z = vertex.z;
  const x2 = x * x;
  const y2 = y * y;
  const z2 = z * z;

  return new THREE.Vector3(
    x * Math.sqrt(1 - (y2 / 2) - (z2 / 2) + (y2 * z2 / 3)),
    y * Math.sqrt(1 - (z2 / 2) - (x2 / 2) + (z2 * x2 / 3)),
    z * Math.sqrt(1 - (x2 / 2) - (y2 / 2) + (x2 * y2 / 3))
  );
}

export { createTerrainFace };
