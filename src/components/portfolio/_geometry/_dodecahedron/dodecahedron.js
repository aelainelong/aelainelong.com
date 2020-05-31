import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import ProjectFace from './_projectFace';

// ==============================
// Dodecahedron project interface
// ==============================

const geometry = new THREE.DodecahedronGeometry(2.25);

class Dodecahedron extends THREE.Group {
    constructor(projects){
        super(projects);

        this.name = "Dodecahedron";
        this.rotationSpeed = 0.0025;
        this.rotate = null;

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

        //this.rotation.set(-10.15, -3.25, -2.25);
    }
}

// Start auto-rotation of the polyhedron around the y-axis
Dodecahedron.prototype.startRotation = () => {
    console.log(this);
    //this.rotation.y -= this.rotationSpeed;
}
// Stop auto-rotation of the polyhedron around the y-axis
Dodecahedron.prototype.stopRotation = () => {
    // if(this.rotation.y !== 0){
    //     new TWEEN.Tween(this.rotation)
    //         .to({ y: 0 }, 500)
    //         .easing(TWEEN.Easing.Quadratic.Out)
    //         .onComplete(() => {
    //             cancelAnimationFrame(this.rotate);
    //         })
    //         .start();
    // }
}
// Rotate a specific project to face the camera
Dodecahedron.prototype.rotateToProject = function(projectID) {
    this.stopRotation();

    // const projectVector = this.children[1].children[projectID - 1].tVector;

    // new TWEEN.Tween(?)
    //     .to(?, 700)
    //     .easing(TWEEN.Easing.Quadratic.Out)
    //     .start();
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