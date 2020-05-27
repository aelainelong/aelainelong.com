import React from 'react';
import ReactDOM from 'react-dom';

import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';

import ToolTip from '../_tooltip/ToolTip';
import dodecahedron from '../_geometry/_dodecahedron/dodecahedron';
import icosahedron from '../_geometry/_icosahedron/icosahedron';

class Scene extends React.Component {
    constructor(props){
        super(props);

        this.sceneWrapper = React.createRef();

        this.state = {
            ready: false
        }

        this.minZoom = 1;
        this.maxZoom = 4.5;
        this.dodecaRotationSpeed = 0.0025;
        this.icosaRotationSpeed = 0.0020;
    }

    // Set up our threeJS portfolio scene //

    // Initialize our scene
    componentDidMount(){
        // Add Scene
        this.scene = new THREE.Scene();

        // Add Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(this.minZoom, 0, 0);

        // Add Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setClearColor(0.000000, 0);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.gammaFactor = 2.2;
        this.renderer.gammaOutput = true;
        this.canvas = this.renderer.domElement;
        this.sceneWrapper.current.appendChild(this.canvas);

        // Add our portfolio dodecahedron and the background icosahedron to the scene
        this.dodecahedron = dodecahedron(this.props.projects);
        this.icosahedron = icosahedron;
        this.scene.add(this.dodecahedron, this.icosahedron);

        // Take snapshots of our starting quaternions for reference when we run our rotational tweens later
        this.originalDodecahedronQuaternion = this.dodecahedron.quaternion.clone();
        this.originalCameraQuaternion = this.camera.quaternion.clone();
        //console.log(this.originalCameraQuaternion);
        this.originalCameraRotation = this.camera.rotation.clone();
        //console.log(this.originalCameraRotation);

        // Add fog!
        this.scene.fog = new THREE.Fog(0x67418a, 7, 20);

        // Attach controls to enable camera and group rotation / dragging behaviors
        this.orbitControls = new OrbitControls(this.camera, this.canvas);
        this.orbitControls.target = this.dodecahedron.position;
        this.orbitControls.autoRotate = true;
        this.orbitControls.autoRotateSpeed = this.dodecaRotationSpeed;
        this.orbitControls.enablePan = false;
        this.orbitControls.enableZoom = false;
        this.orbitControls.enableKeys = true;
        this.orbitControls.maxDistance = this.maxZoom;

        this.dodecahedronControls = new DragControls(this.dodecahedron, this.camera, this.canvas);
        this.dodecahedronControls.addEventListener("dragstart", this.handleMouseDown);
        this.dodecahedronControls.addEventListener("dragend", this.handleMouseUp);
        // this.dodecahedronControls.addEventListener("hoveron", this.handleHoverOn);
        // this.dodecahedronControls.addEventListener("hoveroff", this.handlehoverOff);

        // Add raycaster to catch mouse click events on the project faces
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        //this.mouse = new THREE.Vector2(), this.INTERSECTED;

        // Add other window / canvas event handlers
        window.addEventListener('resize', this.onWindowResize, false);

        // Set a constant quaternion for our explore mode transitions
        this.endingEuler = new THREE.Euler(0, 2.15, 0);
        this.endingEulerV3 = this.endingEuler.toVector3();

        // Add Axes Helper
        // const axesHelper = new THREE.AxesHelper(25);
        // this.scene.add(axesHelper);

        // Start scene
        // this.renderScene(); // load static
        this.animate(); // load w/ rotation

        // Animate To Home
        const cameraPosStart = this.camera.position,
            cameraPosEnd = new THREE.Vector3(this.minZoom, 0, 0);

        this.animateToHome = new TWEEN.Tween(cameraPosStart)
            .to(cameraPosEnd, 4000)
            .easing(TWEEN.Easing.Cubic.Out)
            .onStart(() => {
                this.turnInteractionsOff();
                this.advanceAllProjects();
            })
            .onStop(() => {
                //console.log("ANIMATION TO HOME STOPPED.");
                this.retreatAllProjects();
            })
            .onComplete(() => {
                this.camera.updateProjectionMatrix();
                //console.log("ANIMATION TO HOME IS DONE");
            });

        // Animate to Explore
        const cameraStart = this.camera.position,
            cameraEnd = new THREE.Vector3(this.maxZoom, 0, 0);

        this.animateToExplore = new TWEEN.Tween(cameraStart)
            .to(cameraEnd, 4000)
            .delay(500)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onStop(() => {
                //console.log("ANIMATION TO EXPLORE STOPPED.");
                this.advanceAllProjects();
            })
            .onComplete(() => {
                this.retreatAllProjects();
                this.camera.updateProjectionMatrix();
                this.turnInteractionsOn();
                //console.log("ANIMATION TO EXPLORE IS DONE.");
            });

        console.log(this.dodecahedron);
    }

    componentDidUpdate(prevProps, prevState) {
        console.log("Component did update.");

        // Move our camera in/out if we have entered/exited 'explore' mode
        if (prevProps.explore !== this.props.explore) {
            this.updateCameraPosition(); 
        }

        // Turn our dodecahedron controls on/off if we have completed an update to the camera positioning
        if(prevState.ready !== this.state.ready){
            this.toggleControls();
        }
    }

    // Clean up our scene controls and window event listeners when Scene unmounts
    componentWillUnmount(){
        // Remove all event listeners from the window and canvas objects
        this.dodecahedronControls.dispose();
        window.removeEventListener('resize', this.onWindowResize);

        // Remove the model controls

        // Stop the rotation animation
        // this.stopRotation();

        // Remove the threeJS scene from the DOM
        this.sceneWrapper.current.removeChild(this.canvas); // this.mount.removeChild(this.canvas);
    }

    // Render method for the threeJS scene
    renderScene = () => {
        // Get the objects which intersect the picking ray
        // this.raycaster.setFromCamera(this.mouse, this.camera);
        //this.intersects = this.raycaster.intersectObject(this.dodecahedron, true);
        
        // this.intersects = this.raycaster.intersectObjects(this.dodecahedron.children[1].children, true);

        // if (this.intersects.length > 0) {
        //     console.log("We have intersects!");
        //     if (this.INTERSECTED != this.intersects[0].object) {
        //         if (this.INTERSECTED) {
        //             //this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);
        //         }
        //         this.INTERSECTED = this.intersects[0].object;
        //         //this.INTERSECTED.currentHex = this.INTERSECTED.material.emissive.getHex();
        //         //this.INTERSECTED.material.emissive.setHex(0xff0000);
        //     }
        // } else {
        //     //console.log("No intersects.");
        //     if (this.INTERSECTED){
        //         //this.INTERSECTED.material.emissive.setHex(this.INTERSECTED.currentHex);
        //     }
        //     this.INTERSECTED = null;
        // }

        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }

    // Define scene animations
    animate = () => {

        // Set canvas size responsively
        if (this.canvas.width !== window.innerWidth || this.canvas.height !== window.innerHeight) {
            this.renderer.setSize(window.innerWidth, window.innerHeight, false);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }

        // Set rotation parameters
        this.dodecahedron.rotation.y -= this.dodecaRotationSpeed; // rotate the polyhedron around the y axis
        this.icosahedron.rotation.y += this.icosaRotationSpeed; // rotate background wireframe around the y axis

        // Render scene
        TWEEN.update();
        this.orbitControls.update();

        requestAnimationFrame(this.animate);
        this.renderScene();
    }

    // Update camera position
    updateCameraPosition = e => {
        if (this.props.explore) {
            this.animateToHome.stop();
            this.animateToExplore.start();
        } else {
            this.animateToExplore.stop();
            this.animateToHome.start();
        }
    }

    // Turn on the scene's ready state to enable mouse interactions
    turnInteractionsOn = () => {
        this.setState(() => ({ ready: true }));
    }

    // Turn off the scene's ready state to disable mouse interactions
    turnInteractionsOff = () => {
        this.setState(() => ({ ready: false }));
    }

    // Grow and fade in our project faces
    advanceAllProjects = () => {
        for (let i = 0; i < this.dodecahedron.children[1].children.length; i++) {
            const projectFace = this.dodecahedron.children[1].children[i];
            projectFace.advance();
        }
    }

    // Shrink and fade out our project faces
    retreatAllProjects = () => {
        for (let i = 0; i < this.dodecahedron.children[1].children.length; i++) {
            const projectFace = this.dodecahedron.children[1].children[i];
            projectFace.retreat();
        }
    }

    // Get our scene ready for mouse interactions (dragging / hovering / clicking)
    toggleControls = () => {
        if(this.state.ready){
            this.dodecahedronControls.activate();
            this.canvas.addEventListener('mousemove', this.handleMouseMove);
            this.canvas.addEventListener('click', this.handleMouseClick, false);
        } else {
            this.retreatAllProjects();
            this.dodecahedronControls.deactivate();
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('click', this.handleMouseClick, false);
        }
    }

    // Update our threeJS scene on window resize
    onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Raycasting event handler
    handleMouseClick = e => {
        e.preventDefault();

        // Update our mouse positioning for the raycaster
        this.mouse.x = (e.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

        // Tell our raycaster what to look for
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.dodecahedron.children[1].children, true);

        if (intersects.length > 0) {
            const clickedProject = intersects[0].object.parent;
            console.log("Selected project:", clickedProject);

            // // Make sure all projects are retreated from dodecahedron surface
            this.retreatAllProjects();

            // Activate only the selected project
            if(!clickedProject.active){
                // Update the active project's active flag
                clickedProject.active = true;
                clickedProject.advance();
                clickedProject.showTitle();  
            } else {
                clickedProject.active = false;
                clickedProject.retreat();
                clickedProject.hideTitle();

                // Rotate the camera and project to face each other's directions
                // const cameraDir = new THREE.Vector3(0, 0, -1);
                // cameraDir.applyQuaternion(this.camera.quaternion);
                // cameraDir.add(this.camera.position);

                // const dodecahedronDir = new THREE.Vector3(0, 0, -1);
                // dodecahedronDir.applyQuaternion(this.dodecahedron.quaternion);

                // const projectDir = new THREE.Vector3(0, 0, -1);
                // projectDir.applyQuaternion(clickedProject.quaternion);
                // projectDir.add(clickedProject.position);

                //clickedProject.localToWorld(projectDir);
                //this.camera.applyQuaternion(this.dodecahedron.quaternion);
                //this.camera.lookAt(clickedProject.tVector);
            }
        }
    }

    // Set grabby cursor when grabbing and update our raycaster
    handleMouseDown = e => {
        e.preventDefault();
        this.canvas.classList.add("active-grab");
    }

    // Remove grabby cursor when no longer grabbing
    handleMouseUp = e => {
        e.preventDefault();
        this.canvas.classList.remove("active-grab");
    }

    // Add subtle shift of the background and update our raycaster mouse movements
    handleMouseMove = e => {
        e.preventDefault();

        // Add subtle vertical and horizontal shift to the background
        this.icosahedron.rotation.y += e.movementX * 0.0005;
        this.icosahedron.rotation.z -= e.movementY * 0.0005;
    }

    render(){
        return (
            <div className={`Scene ${ this.state.ready ? `Scene-ready` : ``}`}>
                <div className="scene-wrapper" ref={this.sceneWrapper}></div>
                {this.state.ready ? <ToolTip ref={this.toolTip} /> : null}
            </div>
        );
    }
}

export default Scene;