import * as THREE from 'three';

const utils = {
    getCenterVertex(mesh){
        const centerVertex = new THREE.Vector3();
        const geometry = mesh.geometry;
        geometry.computeBoundingBox();

        centerVertex.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2;
        centerVertex.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2;
        centerVertex.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2;

        mesh.localToWorld(centerVertex);
        return centerVertex;
    },
    translateMeshFromCenter(mesh, translation){
        const centerVertex = this.getCenterVertex(mesh);

        const translateX = centerVertex.x !== 0 ? (centerVertex.x < 0 ? -translation : translation) : 0;
        const translateY = centerVertex.y !== 0 ? (centerVertex.y < 0 ? -translation : translation) : 0;
        const translateZ = centerVertex.z !== 0 ? (centerVertex.z < 0 ? -translation : translation) : 0;

        mesh.geometry.translate(translateX, translateY, translateZ);
    },
    getTransitionRotation(rotationTarget){
        // Set a constant quaternion for our explore/home mode transitions
        const default_Yaxis_angle = -3.107499999999945;
        const rotation1 = new THREE.Euler(0, 0, 0),
              rotation2 = new THREE.Euler(0, default_Yaxis_angle, 0);

        let transitionRotation; // the ending Euler (amount of rotation) that will rotate our object to face the rotationTarget
        transitionRotation = rotationTarget < 0 && rotationTarget > -3 ? rotation1 : rotation2;

        return transitionRotation;
    }
}

export default utils;