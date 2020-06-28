import * as THREE from 'three';
import ProjectFace from './_projectFace';

// ==============================
// Dodecahedron project interface
// ==============================

const geometry = new THREE.DodecahedronGeometry(2.25);

class Dodecahedron extends THREE.Group {
    constructor(projects){
        super(projects);

        this.name = "Dodecahedron";
        this.rotationSpeed = -0.0025;
        this.rotating = null;

        // Create base dodecahedron geometry + edge geometry
        const edges = new THREE.EdgesGeometry(geometry);

        // Create base dodecahedron material
        const material = new THREE.LineBasicMaterial();

        // Create mesh from base dodecahedron geometry and material
        const dMesh = new THREE.LineSegments(edges, material);

        // Build the project faces to sit on top of the dodecahedron and add them to their own group
        const projectsLayer = new THREE.Group();
        projects = projects.map(project => {
            const projectFace = new ProjectFace(project);
            return projectsLayer.add(projectFace);
        });

        this.add(dMesh);
        this.add(projectsLayer);
    }
}

// Start auto-rotation of the polyhedron around the y-axis
Dodecahedron.prototype.startRotation = function() {
    this.rotation.y -= this.rotationSpeed;
}
// Stop auto-rotation of the polyhedron around the y-axis
Dodecahedron.prototype.stopRotation = function() {
    this.rotation.y = this.rotation.y;
}
// Grow and fade in our project faces
Dodecahedron.prototype.advanceAllProjects = function() {
    for (let i = 0; i < this.children[1].children.length; i++) {
        const projectFace = this.children[1].children[i];
        projectFace.advance();
    }
}
// Shrink and fade out our project faces
Dodecahedron.prototype.retreatAllProjects = function() {
    for (let i = 0; i < this.children[1].children.length; i++) {
        const projectFace = this.children[1].children[i];
        projectFace.retreat();
    }
}

export default Dodecahedron;
export { geometry };