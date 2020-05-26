import * as THREE from 'three';
import ProjectFace from './_projectFace';

// ==============================
// Dodecahedron project interface
// ==============================

const geometry = new THREE.DodecahedronGeometry(2);
const dodecahedron = (projects) => {
    // Create group to hold our base geometry + custom project faces //
    const group = new THREE.Group();

    // Create base dodecahedron geometry + edge geometry
    const edges = new THREE.EdgesGeometry(geometry);

    // Create base dodecahedron material
    const material = new THREE.LineBasicMaterial();

    // Create mesh from base dodecahedron geometry and material
    const dodecahedron = new THREE.LineSegments(edges, material);

    // Build the project faces to sit on top of the dodecahedron and add them to their own group
    const projectGroup = new THREE.Group();
    projects = projects.map(project => {
        const projectFace = new ProjectFace(project);
        projectGroup.add(projectFace);
    });

    // Add the dodecahedron and its custom faces to the main group
    group.add(dodecahedron, projectGroup);

    // Motion
    // rotateLeft = () => {
    //     this.rotation.y -= this.rotationSpeed; // rotate negatively around its y-axis
    // }
    // rotateRight = () => {
    //     this.rotation.y += this.rotationSpeed; // rotate positively around its y-axis
    // }
    // startRotation = () => {
    //     if (!this.rotateForm) {
    //         this.rotateForm = requestAnimationFrame(this.animate);
    //     }
    // }
    // stopRotation = () => {
    //     cancelAnimationFrame(this.rotateForm);
    // }
    // slowRotation = (e) => {
    //     // this.group.rotation.x -= this.state.rotationSpeed; // rotation around the x axis
    //     e.object.rotation.y -= this.state.rotationSpeed; // rotation around the y axis
    // }
    // speedRotation = (e) => {
    //     // this.group.rotation.x += this.state.rotationSpeed * 2; // rotation around the x axis
    //     e.object.rotation.y += this.state.rotationSpeed * 2; // rotation around the y axis
    // }

    // Interaction

    return group;
}

export default dodecahedron;
export { geometry };