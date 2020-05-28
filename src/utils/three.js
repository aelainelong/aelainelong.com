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
    },
    generateTextSprite(){
        var div = document.createElement('div');
        div.className = 'text-label';
        div.style.position = 'absolute';
        div.style.width = 100;
        div.style.height = 100;
        div.innerHTML = "hi there!";
        div.style.top = -1000;
        div.style.left = -1000;

        var _this = this;

        return {
            element: div,
            parent: false,
            position: new THREE.Vector3(0, 0, 0),
            setHTML: function (html) {
                this.element.innerHTML = html;
            },
            setParent: function (threejsobj) {
                this.parent = threejsobj;
            },
            updatePosition: function () {
                if (this.parent) {
                    this.position.copy(this.parent.position);
                }

                var coords2d = this.get2DCoords(this.position, _this.camera);
                this.element.style.left = coords2d.x + 'px';
                this.element.style.top = coords2d.y + 'px';
            },
            get2DCoords: function (position, camera) {
                var vector = position.project(camera);
                vector.x = (vector.x + 1) / 2 * window.innerWidth;
                vector.y = -(vector.y - 1) / 2 * window.innerHeight;
                return vector;
            }
        };
    }
}

export default utils;