import * as THREE from 'three';

// ================================
// Background icosahedron wireframe
// ================================

const icosahedron = () => {
    const color = 0x67418a;

    // Create base icosahedron geometry
    this.baseGeometry = new THREE.IcosahedronGeometry(20, 3);

    // Create base icosahedron material
    this.baseMaterial = new THREE.MeshPhongMaterial({ color: color, wireframe: true, opacity: 0.2, transparent: true });

    // Create mesh from base icosahedron geometry and material
    this.baseMesh = new THREE.Mesh(this.baseGeometry, this.baseMaterial);

    // Derive set of vertices as framework for our points layer
    this.baseVertices = this.baseGeometry.vertices;
    this.pointPositions = new Float32Array(this.baseVertices.length * 3);
    this.baseVertices.forEach((vertex, i) => vertex.toArray(this.pointPositions, i * 3));

    // Create points layer buffer geometry from icosahedron vertices
    this.pointsGeometry = new THREE.BufferGeometry();
    this.pointsGeometry.setAttribute('position', new THREE.BufferAttribute(this.pointPositions, 3));

    // Create points layer material & points layer mesh
    this.pointsMaterial = new THREE.PointsMaterial({ size: 0.2, color: color});
    this.pointsMesh = new THREE.Points(this.pointsGeometry, this.pointsMaterial);

    // Create new composite 3D object from base icosahedron mesh and points layer mesh
    this.wireframe = new THREE.Group();
    this.wireframe.add(this.baseMesh, this.pointsMesh);

    return this.wireframe;
}

export default icosahedron();