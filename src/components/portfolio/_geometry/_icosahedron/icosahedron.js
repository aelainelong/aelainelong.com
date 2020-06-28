import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

// ================================
// Background icosahedron wireframe
// ================================

class Icosahedron extends THREE.Group {
    constructor(props){
        super(props);

        this.name = "Icosahedron";
        this.color = 0x67418a;
        this.opacity = 0.2;
        this.rotationSpeed = 0.0020;

        // Create base icosahedron geometry
        const baseGeometry = new THREE.IcosahedronGeometry(20, 3);

        // Create base icosahedron material
        const baseMaterial = new THREE.MeshPhongMaterial({ color: this.color, wireframe: true, opacity: this.opacity, transparent: true });

        // Create mesh from base icosahedron geometry and material
        const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);

        // Derive set of vertices as framework for our points layer
        const baseVertices = baseGeometry.vertices;
        const pointPositions = new Float32Array(baseVertices.length * 3);
        baseVertices.forEach((vertex, i) => vertex.toArray(pointPositions, i * 3));

        // Create points layer buffer geometry from icosahedron vertices
        const pointsGeometry = new THREE.BufferGeometry();
        pointsGeometry.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));

        // Create points layer material & points layer mesh
        const pointsMaterial = new THREE.PointsMaterial({ size: 0.2, color: this.color });
        const pointsMesh = new THREE.Points(pointsGeometry, pointsMaterial);

        // Create new composite 3D object from base icosahedron mesh and points layer mesh
        this.add(baseMesh, pointsMesh);
    }
}

// Start auto-rotation of the polyhedron around the y-axis
Icosahedron.prototype.startRotation = function () {
    this.rotation.y += this.rotationSpeed;
}

// Stop auto-rotation of the polyhedron around the y-axis
Icosahedron.prototype.stopRotation = function () {
    if (this.rotation.y !== 0) {
        new TWEEN.Tween(this.rotation)
            .to({ y: 0 }, 500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
    }
}

export default Icosahedron;