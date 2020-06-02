import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import utils from '../../../../utils/three.js';
import { geometry as parentGeometry } from './dodecahedron';

// ===================
// Custom project face
// ===================

class ProjectFace extends THREE.Group {
    constructor(project){
        super(project);

        this.active = false;
        this.projectID = project.id;
        this.name = project.title;
        this.opacityIn = 0.75;
        this.opacityOut = 1;
        this.sizeIn = 0.825;
        this.sizeOut = 0.9;
        this.translationIn = 0.06;
        this.translationOut = 0.10;
        this.image = require(`./../../../../assets/media/_thumbs/${project.thumbnail}`);
        this.colorIn = parseInt(project.color.replace("#", "0x"), 16);
        this.colorOut = 0xe3e3e3;
        this.textSprites = [];

        // Build our project face as a clickable pentagon //

        // Create positioned pentagon geometry from one side of the parent dodecahedron
        const tGeometry = new THREE.Geometry();
        const tVertices = this.getVertices(this.projectID);
        tGeometry.setFromPoints(tVertices);
        tGeometry.mergeVertices();

        // Create a sister pentagon geometry to impart correct UV mapping - replace this later, you should not need it!
        const pGeometry = new THREE.CircleGeometry(2, 5);

        // Create pentagon's material
        const texture = this.getTexture(this.image);
        const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: this.opacityOut, color: this.colorIn });
        material.color.convertSRGBToLinear();
        material.map = texture;

        // Create two meshes; one from each pentagon's geometry and our material
        const pMesh = new THREE.Mesh(pGeometry, material);
        const tMesh = new THREE.Mesh(tGeometry, material);

        // Set the correct center vertex based on the geometry
        tMesh.geometry.computeBoundingBox();
        const centerVertex = utils.getCenterVertex(tMesh);
        tMesh.geometry.vertices[5] = centerVertex;

        // Set the correct faces on the geometry
        tMesh.geometry.faces.push(new THREE.Face3(1, 3, 5));
        tMesh.geometry.faces.push(new THREE.Face3(3, 4, 5));
        tMesh.geometry.faces.push(new THREE.Face3(4, 2, 5));
        tMesh.geometry.faces.push(new THREE.Face3(2, 0, 5));
        tMesh.geometry.faces.push(new THREE.Face3(0, 1, 5));

        tMesh.geometry.elementsNeedUpdate = true;

        // Merge meshes
        tMesh.geometry.merge(pMesh.geometry, tMesh.matrix);
        tMesh.geometry.faces.splice(5);
        tMesh.geometry.vertices.splice(6);
        tMesh.geometry.verticesNeedUpdate = true;

        // Store the local translation vector
        this.tVector = new THREE.Vector3();
        this.tVector.copy(tMesh.geometry.vertices[5]);
        this.tVector.applyMatrix4(tMesh.matrix);

        // Add our reverse side
        const rMesh = new THREE.Mesh(tGeometry.clone(), material.clone());
        const rMeshTexture = this.getTexture(this.image);
        rMeshTexture.wrapS = THREE.RepeatWrapping;
        rMeshTexture.repeat.x = -1;
        rMesh.material.map = rMeshTexture;
        rMesh.material.side = THREE.BackSide;
        utils.translateMeshFromCenter(rMesh, -0.001);

        // Add our edge border mesh and scale it up slightly from the face
        // const bGeometry = new THREE.EdgesGeometry(tGeometry.clone());
        // const bMaterial = new THREE.LineBasicMaterial();
        // const bMesh = new THREE.LineSegments(bGeometry, bMaterial);
        // utils.translateMeshFromCenter(bMesh, -0.001);
        //bMesh.scale.set(1.01, 1.01, 1.01);
        
        this.add(tMesh);
        this.add(rMesh);
        //this.add(bMesh);

        // Scale entire project pentagon down slightly
        this.scale.set(this.sizeOut, this.sizeOut, this.sizeOut); // same values for x, y & z

        // Translate the project pentagon back slightly from the dodecahedron face
        
        this.translateOnAxis(this.tVector, this.translationOut);
    }

    // Get correct vertices from the parent dodecahedron using the project ID //
    getVertices = (projectID) => {
        let parentVertices = [];

        // Grab a set of 3 faces (triangles) from the base polyhedron, based on the project index
        const setSize = 3;
        const indexFloor = (projectID - 1) * setSize;
        const indexCeil = indexFloor + setSize;
        const parentFaces = parentGeometry.faces.slice(indexFloor, indexCeil);

        for (let f = 0; f < parentFaces.length; f++) {
            // Create an array of the XYZ vertices (by index) associated with the face
            let faceVertices = [];
            faceVertices.push(parentFaces[f].a);
            faceVertices.push(parentFaces[f].b);
            faceVertices.push(parentFaces[f].c);

            // Push the face's XYZ vertices (by index) into the new geometry's vertice array as Vector3s
            faceVertices
                .map(verticeIndex => parentGeometry.vertices[verticeIndex])
                .forEach(vertex => {
                    parentVertices.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z));
                });
        }
        return parentVertices;
    }
    // Create texture using the project thumbnail //
    getTexture = (projectImage) => {
        const texture = new THREE.TextureLoader().load(projectImage);
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.encoding = THREE.sRGBEncoding;
        texture.anisotropy = 16;
        return texture;
    }
    // Create overlay text sprite using project title //
    getSprite = (projectTitle) => {
        const sprite = utils.generateTextSprite();
        sprite.setHTML("label" + projectTitle);
        sprite.setParent(this);
        this.textSprites.push(sprite);
        document.querySelector('canvas').appendChild(sprite.element);
        return sprite;
    }
}

// Move the project face forwards (towards camera), scale it up and fade it in a little
ProjectFace.prototype.advance = function () {
    // OPACITY //
    for (let i = 0; i < this.children.length; i++) {
        const thisLayer = this.children[i];
        if (thisLayer.material) {
            new TWEEN.Tween(thisLayer.material)
                .to({ opacity: this.opacityOut }, 500)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
        }
    }

    // SIZE //
    new TWEEN.Tween(this.scale)
        .to({ x: this.sizeOut, y: this.sizeOut, z: this.sizeOut }, 500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();
}

// Move the project face backwards (towards origin), scale it down and fade it out a little
ProjectFace.prototype.retreat = function(){
    // OPACITY //
    const opacityFront = this.opacityIn;
    const opacityBack = this.opacityIn / 0.95; // the back side of the project face will be a bit more transparent
    for (let i = 0; i < this.children.length; i++) {
        const thisLayer = this.children[i];
        if(thisLayer.material){
            const opacityEnd = thisLayer.material.side === 0 ? opacityFront : opacityBack;
            new TWEEN.Tween(thisLayer.material)
                .to({ opacity: opacityEnd }, 500)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
        }
    }

    // SIZE //
    new TWEEN.Tween(this.scale)
        .to({x: this.sizeIn, y: this.sizeIn, z: this.sizeIn}, 500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => {
            this.active = false;
        })
        .start();
}

// Display the project's title sprite
ProjectFace.prototype.showTitle = function(){
    
}

// Hide the project's title sprite
ProjectFace.prototype.hideTitle = function () {

}

export default ProjectFace;