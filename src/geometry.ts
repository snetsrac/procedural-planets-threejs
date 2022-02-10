import * as THREE from 'three';
import { type ShapeGenerator } from './shape';

// TYPES

interface Face {
  localZenith: THREE.Vector3;
  localNorth: THREE.Vector3;
  localEast: THREE.Vector3;
  indices: number[][]
}

interface EdgeList {
  north?: number[];
  south?: number[];
  east?: number[];
  west?: number[];
}

type Direction = '+x' | '-x' | '+y' | '-y' | '+z' | '-z';
type FaceMap = Map<Direction, Face>;

// CONSTANTS/DEFAULTS

const DIRECTIONS = new Map<Direction, THREE.Vector3>([
  ['+x', new THREE.Vector3(1, 0, 0)],
  ['-x', new THREE.Vector3(-1, 0, 0)],
  ['+y', new THREE.Vector3(0, 1, 0)],
  ['-y', new THREE.Vector3(0, -1, 0)],
  ['+z', new THREE.Vector3(0, 0, 1)],
  ['-z', new THREE.Vector3(0, 0, -1)],
]);

// FUNCTIONS

function constructGeometry(resolution: number, shapeGenerator: ShapeGenerator): THREE.BufferGeometry {
  const faces: FaceMap = new Map<Direction, Face>();
  const vertices: number[] = [];
  const triangles: number[] = [];

  constructFaces();
  constructTriangles();

  const position = new Float32Array(vertices);
  const index = new Uint32Array(triangles);

  return buildGeometry(position, index);


  // HELPER FUNCTIONS

  // Local north (and thus other compass directions) are arbitrary have no
  // relationship to world directions. In other words, "north" could be any
  // direction and is not necessarily up (+y). The exact mapping of
  // <zenith, "north"> as used in constructUnitCubeFace() below is
  // <+x, +z>, <-x, -z>, <+y, +x>, <-y, -x>, <+z, +y>, and <-z, -y>.

  // Vertex indices start in the southwest corner of each face at (0, 0). Increasing
  // x is in the east direction and increasing y is in the north direction.

  // Edge and corner vertices should not be duplicated, so as successive faces
  // are added we pass in the existing edge vertex indices. The index order should
  // be in the north/east direction for the new face, so sometimes we need to
  // reverse the order provided by the existing face.

  function constructFaces(): void {
    // Faces +x and -x have no neighbors yet
    constructUnitCubeFace('+x');
    constructUnitCubeFace('-x');

    // Faces +y and -y share edges with +x and -x
    constructUnitCubeFace('+y', {
      north: getEast(faces.get('+x')!.indices),
      south: getEast(faces.get('-x')!.indices, true)
    });
    constructUnitCubeFace('-y', {
      north: getWest(faces.get('-x')!.indices, true),
      south: getWest(faces.get('+x')!.indices)
    });

    // Faces +z and -z share edges with all four of the other faces
    constructUnitCubeFace('+z', {
      north: getEast(faces.get('+y')!.indices),
      south: getEast(faces.get('-y')!.indices, true),
      east: getNorth(faces.get('+x')!.indices),
      west: getSouth(faces.get('-x')!.indices)
    });
    constructUnitCubeFace('-z', {
      north: getWest(faces.get('-y')!.indices, true),
      south: getWest(faces.get('+y')!.indices),
      east: getSouth(faces.get('+x')!.indices, true),
      west: getNorth(faces.get('-x')!.indices, true)
    });
  }

  function constructUnitCubeFace(dir: Direction, edges?: EdgeList): void {
    const localZenith = DIRECTIONS.get(dir)!;
    const localNorth = new THREE.Vector3(localZenith.y, localZenith.z, localZenith.x);
    const localEast = localNorth.clone().cross(localZenith);
    const indices: number[][] = [];

    const face = {
      localZenith,
      localNorth,
      localEast,
      indices
    } as Face;    

    // x increases to the east and y increases to the north
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        if (y === 0) indices.push([]);

        getOrCalculateVertex(x, y, face, edges);
      }
    }

    faces.set(dir, face);
  }

  function getOrCalculateVertex(x: number, y: number, face: Face, edges?: EdgeList): void {
    // If an edge is passed in then use its vertices, otherwise create a new one
    if (y === resolution - 1 && edges?.north !== undefined) {
      face.indices[x][y] = edges.north[x];
    } else if (y === 0 && edges?.south !== undefined) {
      face.indices[x][y] = edges.south[x];
    } else if (x === resolution - 1 && edges?.east !== undefined) {
      face.indices[x][y] = edges.east[y];
    } else if (x === 0 && edges?.west !== undefined) {
      face.indices[x][y] = edges.west[y];
    } else {
      const vertex = calculateVertex(x, y, face);
      face.indices[x][y] = vertices.push(vertex.x, vertex.y, vertex.z) - 3;
    }
  }

  function calculateVertex(x: number, y: number, face: Face): THREE.Vector3 {
    // Calculate the fraction of the edge length represented by the coordinates
    const percentY = y / (resolution - 1);
    const percentX = x / (resolution - 1);

    // Scale to [-1, 1] for the unit cube
    const north = face.localNorth.clone().multiplyScalar((percentY * 2) - 1);
    const east = face.localEast.clone().multiplyScalar((percentX * 2) - 1);
    const pointOnUnitCube = face.localZenith.clone().add(north).add(east);

    const pointOnUnitSphere = mapCubeToSphere(pointOnUnitCube);
    const pointOnPlanetSurface = shapeGenerator.calculatePointOnPlanet(pointOnUnitSphere);

    return pointOnPlanetSurface;
  }

  function constructTriangles(): number[] {
    for (let face of faces.values()) {
      // For each vertex not on the north or east edges, add two triangles.
      // (x, y) is the current vertex, (0, 0) is the southwest corner.
      
      for (let y = 0; y < resolution - 1; y++) {
        for (let x = 0; x < resolution - 1; x++) {
          triangles.push(face.indices[x][y] / 3);
          triangles.push(face.indices[x + 1][y + 1] / 3);
          triangles.push(face.indices[x][y + 1] / 3);
          triangles.push(face.indices[x][y] / 3);
          triangles.push(face.indices[x + 1][y] / 3);
          triangles.push(face.indices[x + 1][y + 1] / 3);
        }
      }
    }

    return triangles;
  }
}

function getNorth(indices: number[][], reverse?: boolean): number[] {
  const north = indices.map(column => column[indices.length - 1]);
  return reverse ? north.reverse() : north;
}

function getSouth(indices: number[][], reverse?: boolean): number[] {
  const south = indices.map(column => column[0]);
  return reverse ? south.reverse() : south;
}

function getEast(indices: number[][], reverse?: boolean): number[] {
  return reverse ? indices[indices.length - 1].slice().reverse() : indices[indices.length - 1];
}

function getWest(indices: number[][], reverse?: boolean): number[] {
  return reverse ? indices[0].slice().reverse() : indices[0];
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
  
function buildGeometry(position: Float32Array, index: Uint32Array): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
  geometry.setIndex(new THREE.BufferAttribute(index, 1));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  geometry.computeVertexNormals();

  return geometry;
}

export { constructGeometry };
