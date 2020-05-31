import React from 'react';

import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';

import ToolTip from '../_tooltip/ToolTip';
import Dodecahedron from '../_geometry/_dodecahedron/dodecahedron';
import Icosahedron from '../_geometry/_icosahedron/icosahedron';

class Scene extends React.Component {
    constructor(props){
        super(props);

        this.sceneWrapper = React.createRef();

        this.state = {
            ready: false
        }

        this.minZoom = "";
        this.maxZoom = "";
        this.DodecahedronRotation;
    }

    // Set up our threeJS portfolio scene //

    // Initialize our scene
    componentDidMount(){
        // Add Scene
        this.scene = new THREE.Scene();

        // Add Camera
        this.minZoom = this.getMinZoom();
        this.maxZoom = this.getMaxZoom();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(this.minZoom, 0, 0);
        this.cameraZoom = this.camera.position; // store this for comparison on window resize

        // Add Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setClearColor(0.000000, 0);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.gammaFactor = 2.2;
        this.renderer.gammaOutput = true;
        this.canvas = this.renderer.domElement;
        this.sceneWrapper.current.appendChild(this.canvas);

        // Add our portfolio Dodecahedron and the background icosahedron to the scene
        this.Dodecahedron = new Dodecahedron(this.props.projects);
        this.Icosahedron = new Icosahedron();
        this.scene.add(this.Dodecahedron, this.Icosahedron);

        // Take snapshots of our starting quaternions for reference when we run our rotational tweens later
        this.originalDodecahedronQuaternion = this.Dodecahedron.quaternion.clone();
        this.originalCameraQuaternion = this.camera.quaternion.clone();
        //console.log(this.originalCameraQuaternion);
        this.originalCameraRotation = this.camera.rotation.clone();
        //console.log(this.originalCameraRotation);

        // Add fog!
        this.scene.fog = new THREE.Fog(0x67418a, 7, 20);

        // Attach controls to enable camera and group rotation / dragging behaviors
        this.orbitControls = new OrbitControls(this.camera, this.canvas);
        this.orbitControls.enablePan = false;
        this.orbitControls.enableZoom = false;
        this.orbitControls.enableKeys = true;
        this.orbitControls.maxDistance = this.getMaxZoom();

        this.DodecahedronControls = new DragControls(this.Dodecahedron, this.camera, this.canvas);

        // Add raycaster to catch mouse click events on the project faces
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

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
                this.Dodecahedron.advanceAllProjects();
                if(this.props.currentProject){
                    this.props.closeProject(this.props.currentProject.id);
                }
            })
            .onStop(() => {
                //console.log("ANIMATION TO HOME STOPPED.");
                this.Dodecahedron.retreatAllProjects();
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
                this.Dodecahedron.advanceAllProjects();
            })
            .onComplete(() => {
                this.Dodecahedron.retreatAllProjects();
                this.camera.updateProjectionMatrix();
                this.turnInteractionsOn();
                //console.log("ANIMATION TO EXPLORE IS DONE.");
            });

        //console.log(this.Dodecahedron);
    }

    componentDidUpdate(prevProps, prevState) {
        console.log("Component did update.");

        // Move our camera in/out if we have entered/exited 'explore' mode
        if (prevProps.explore !== this.props.explore) {
            this.updateCameraPosition(); 
        }

        // Advance/retreat project faces on the Dodecahedron based on the selected project (if any)
        if (prevProps.currentProject !== this.props.currentProject) {
            if (prevProps.currentProject){
                this.Dodecahedron.children[1].children[prevProps.currentProject - 1].retreat();
            }
            if (this.props.currentProject) {
                this.Dodecahedron.children[1].children[this.props.currentProject - 1].advance();
            }
        } else if (!prevProps.currentProject){
            //this.Dodecahedron.retreatAllProjects();
        }

        // Turn our Dodecahedron controls on/off if we have completed an update to the camera positioning
        if(prevState.ready !== this.state.ready){
            this.toggleControls();
        }
    }

    // Clean up our scene controls and window event listeners when Scene unmounts
    componentWillUnmount(){
        // Remove all event listeners from the window and canvas objects
        this.DodecahedronControls.dispose();
        window.removeEventListener('resize', this.onWindowResize);

        // Remove the model controls

        // Stop the rotation animation
        this.Dodecahedron.stopRotation();
        this.Icosahedron.stopRotation();

        // Remove the threeJS scene from the DOM
        this.sceneWrapper.current.removeChild(this.canvas); // this.mount.removeChild(this.canvas);
    }

    // Render method for the threeJS scene
    renderScene = () => {
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

        // Rotate the background icosahedron
        //this.rotateDodecahedron = requestAnimationFrame(this.startDodecahedron);
        this.startDodecahedron();
        this.Icosahedron.startRotation();

        // Render scene
        TWEEN.update();
        this.orbitControls.update();

        requestAnimationFrame(this.animate);
        this.renderScene();
    }

    startDodecahedron = () => {
        if(!this.DodecahedronRotation){
            this.DodecahedronRotation = requestAnimationFrame(this.Dodecahedron.startRotation);
        }
    }

    stopDodecahedron = () => {
        if (this.DodecahedronRotation) {
            cancelAnimationFrame(this.DodecahedronRotation);
            this.DodecahedronRotation = null;
        }
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

    // Get our scene ready for mouse interactions (dragging / hovering / clicking)
    toggleControls = () => {
        if(this.state.ready){
            this.DodecahedronControls.activate();
            this.canvas.addEventListener('mousemove', this.handleMouseMove);
            this.canvas.addEventListener('click', this.handleMouseClick, false);
            this.canvas.addEventListener('touchstart', this.handleMouseClick, false);
        } else {
            this.Dodecahedron.retreatAllProjects();
            this.DodecahedronControls.deactivate();
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('click', this.handleMouseClick, false);
            this.canvas.removeEventListener('touchstart', this.handleMouseClick, false);
        }
    }

    // Get min camera zoom based on window width
    getMinZoom = () => {
        let zoom;
        if (window.innerWidth > 1200) {
            zoom = 1.25;
        } else if (window.innerWidth > 768) {
            zoom = 1.35;
        } else {
            zoom = 1.75;
        }
        return zoom;
    }

    // Get max camera zoom based on window width
    getMaxZoom = () => {
        let zoom;
        if (window.innerWidth > 1200) {
            zoom = 4.5;
        } else if (window.innerWidth > 768) {
            zoom = 5.5;
        } else {
            zoom = 6.5;
        }
        return zoom;
    }

    // Update our threeJS scene on window resize
    onWindowResize = () => {
        const currentZoom = this.cameraZoom;
        const newMinZoom = this.getMinZoom();
        const newMaxZoom = this.getMaxZoom();

        if (this.props.explore && currentZoom !== newMaxZoom){
            new TWEEN.Tween(this.camera.position)
                .to({ x: newMaxZoom}, 200)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
        } else if(!this.props.explore && currentZoom !== newMinZoom) {
            new TWEEN.Tween(this.camera.position)
                .to({ x: newMinZoom }, 200)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
        }

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Raycasting event handler
    handleMouseClick = e => {
        e.preventDefault();

        if(e.changedTouches && e.changedTouches.length > 0){
            // Update our touch positioning for the raycaster
            this.mouse.x = (e.changedTouches[0].pageX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.changedTouches[0].pageY / window.innerHeight) * 2 + 1;
        } else {
            // Update our mouse positioning for the raycaster
            this.mouse.x = (e.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
        }

        // Tell our raycaster what to look for
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.Dodecahedron.children[1].children, true);

        if (intersects.length > 0) {
            const clickedProject = intersects[0].object.parent;
            //console.log("Selected project:", clickedProject);

            // // Make sure all projects are retreated from Dodecahedron surface
            this.Dodecahedron.retreatAllProjects();

            // Activate only the selected project
            if(!clickedProject.active){
                // Update the active project's active flag
                clickedProject.active = true;
                clickedProject.advance();
                this.props.openProject(clickedProject.projectID);
                this.stopDodecahedron();

            } else {
                clickedProject.active = false;
                clickedProject.retreat();
                this.props.closeProject(clickedProject.projectID);
                this.startDodecahedron();
                

                // this.Dodecahedron.updateMatrixWorld();
                // const childPosition = new THREE.Vector3();
                // childPosition.setFromMatrixPosition(clickedProject.matrixWorld);
                // this.camera.lookAt(childPosition);

                // Rotate the camera and project to face each other's directions
                // const cameraDir = new THREE.Vector3(0, 0, -1);
                // cameraDir.applyQuaternion(this.camera.quaternion);
                // cameraDir.add(this.camera.position);

                // const DodecahedronDir = new THREE.Vector3(0, 0, -1);
                // DodecahedronDir.applyQuaternion(this.Dodecahedron.quaternion);

                // const projectDir = new THREE.Vector3(0, 0, -1);
                // projectDir.applyQuaternion(clickedProject.quaternion);
                // projectDir.add(clickedProject.position);

                //clickedProject.localToWorld(projectDir);
                //this.camera.applyQuaternion(this.Dodecahedron.quaternion);
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
        this.Icosahedron.rotation.y += e.movementX * 0.0005;
        this.Icosahedron.rotation.z -= e.movementY * 0.0005;
    }

    render(){
        return (
            <div className={`Scene ${this.state.ready ? `Scene-ready` : ``}`}>
                <div className="scene-wrapper" ref={this.sceneWrapper}></div>
                {this.state.ready ? <ToolTip currentProject={this.props.currentProject} ref={this.toolTip} /> : null}
            </div>
        );
    }
}

export default Scene;