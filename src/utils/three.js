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
    translateGroupFromCenter(group, translation){
        
    },
    equivalentQuaternions(a, b){
        // Create arrays of property names
        const aProps = Object.getOwnPropertyNames(a);
        const bProps = Object.getOwnPropertyNames(b);

        // If number of properties is different, the objects are not equivalent
        if (aProps.length != bProps.length) {
            return false;
        }

        for (let i = 0; i < aProps.length; i++) {
            const propName = aProps[i];

            // If values of same property are not equal, the objects are not equivalent
            if (a[propName] !== b[propName]) {
                return false;
            }
        }
        // If we made it this far, the objects can be considered equivalent
        return true;
    }
}

export default utils;