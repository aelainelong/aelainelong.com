import * as THREE from 'three';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';

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
    }
}

export default utils;