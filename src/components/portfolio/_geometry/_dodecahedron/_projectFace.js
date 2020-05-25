import * as THREE from 'three';
import utils from '../../../../utils/three.js';
import { geometry as parentGeometry } from './dodecahedron';

// ===================
// Custom project face
// ===================

class ProjectFace extends THREE.Group {
    constructor(project){
        super(project);

        this.projectID = project.id;
        this.name = project.title;
        this.image = require(`./../../../../assets/images/portfolio/_thumbs/${project.thumbnail}`);
        this.color = parseInt(project.color.replace("#", "0x"), 16);

        // Build our project face as a clickable pentagon //

        // Create positioned pentagon geometry from one side of the parent dodecahedron
        const tGeometry = new THREE.Geometry();
        const tVertices = this.getVertices();
        tGeometry.setFromPoints(tVertices);
        tGeometry.mergeVertices();

        // Create a sister pentagon geometry to impart correct UV mapping - replace this later, you should not need it!
        const pGeometry = new THREE.CircleGeometry(2, 5);

        // Create pentagon's material
        const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: this.opacity, side: THREE.DoubleSide, color: this.color });
        material.color.convertSRGBToLinear();
        material.map = this.getTexture();

        // Create two meshes; one from each pentagon's geometry and our material
        const tMesh = new THREE.Mesh(tGeometry, material);
        const pMesh = new THREE.Mesh(pGeometry, material);

        // Set the correct center vertex based on the geometry
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

        // Scale project pentagon down slightly
        utils.translateFromCenter(tMesh, this.scale);
        tMesh.geometry.scale(this.scale, this.scale, this.scale); // same values for x, y & z

        this.add(tMesh);
    }

    // Get correct vertices from the parent dodecahedron using the project ID //
    getVertices = () => {
        let parentVertices = [];

        // Grab a set of 3 faces (triangles) from the base polyhedron, based on the project index
        const setSize = 3;
        const indexFloor = this.projectID * setSize;
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
                    parentVertices.push(
                        new THREE.Vector3(vertex.x, vertex.y, vertex.z)
                    );
                });
        }

        return parentVertices;
    }
    // Create texture using the project thumbnail //
    getTexture = () => {
        const texture = new THREE.TextureLoader().load(this.image);
        texture.minFilter = THREE.LinearFilter;
        texture.encoding = THREE.sRGBEncoding;
        texture.anisotropy = 16;

        return texture;
    }
    // Create overlay text using project title //
    getOverlay = () => {
        
    }
}

export default ProjectFace;