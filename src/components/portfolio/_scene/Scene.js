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
        this.icosaRotationSpeed = 0.0025;
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
        // this.dodecahedronControls.addEventListener("hoveron", );
        // this.dodecahedronControls.addEventListener("hoveroff", );

        // Add raycaster to catch mouse click events on the project faces
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        //window.addEventListener('click', this.handleMouseClick, false);

        // Add other window / canvas event handlers
        window.addEventListener('resize', this.onWindowResize, false);

        // Set a constant quaternion for our explore mode transitions
        this.endingEuler = new THREE.Euler(0, 2.15, 0);
        this.endingEulerV3 = this.endingEuler.toVector3();

        // Add Axes Helper
        const axesHelper = new THREE.AxesHelper(25);
        this.scene.add(axesHelper);

        // Start scene
        // this.renderScene(); // load static
        this.animate(); // load w/ rotation
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
        //window.removeEventListener('click', this.handleMouseClick);

        // Remove the model controls

        // Stop the rotation animation
        // this.stopRotation();

        // Remove the threeJS scene from the DOM
        ReactDOM.findDOMNode(this).removeChild(this.canvas); // this.mount.removeChild(this.canvas);
    }

    // Render method for the threeJS scene
    renderScene = () => {
        // Get the objects which intersect the picking ray
        //this.raycaster.setFromCamera(this.mouse, this.camera);
        //this.intersects = this.raycaster.intersectObjects(this.group.children, true);

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
        //this.dodecahedron.rotation.y -= this.dodecaRotationSpeed; // rotate the polyhedron around the y axis
        this.icosahedron.rotation.y += this.icosaRotationSpeed; // rotate background wireframe around the y axis


        // Render scene
        TWEEN.update();
        this.orbitControls.update();

        requestAnimationFrame(this.animate);
        this.renderScene();
    }

    turnInteractionsOn = () => {
        // Turn on the scene's ready state to enable mouse interactions
        this.setState(() => ({ ready: true }));
    }

    turnInteractionsOff = () => {
        // Turn off the scene's ready state to disable mouse interactions
        this.setState(() => ({ ready: false }));
    }

    // Get our scene ready for mouse interactions (dragging / hovering / clicking)
    toggleControls = () => {
        if(this.state.ready){
            this.dodecahedronControls.activate();
            this.canvas.addEventListener('mousemove', this.handleMouseMove);
        } else {
            this.dodecahedronControls.deactivate();
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        }
    }

    // Update our threeJS scene on window resize
    onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Update camera position
    updateCameraPosition = (e) => {
        if (this.props.explore) {
            this.animateToExplore();
        } else {
            this.animateToHome();
        }
    }

    animateToHome = () => {
        // PROJECT FACES //
        // Grow and fade in our project faces
        for (let i = 0; i < this.dodecahedron.children[1].children.length; i++) {
            const projectFace = this.dodecahedron.children[1].children[i];
            projectFace.advance();
        }

        // DODECAHEDRON //
        // Rotation
        // const dodecaStart = this.dodecahedron.quaternion;
        // const dodecaEnd = this.originalDQ;

        // const dodecaRotation = new TWEEN.Tween({ t: 0 }).to({ t: 1 }, 5000)
        //     .easing(TWEEN.Easing.Quadratic.In)
        //     .onUpdate((tween) => { dodecaStart.slerp(dodecaEnd, tween.t) })
        //     .start();

        // CAMERA //
        // Rotation
        const cameraRotStart = this.camera.quaternion,
            cameraRotEnd = this.originalCameraQuaternion;
        const cameraRotation = new TWEEN.Tween(cameraRotStart)
            .to(cameraRotEnd, 500)
            .easing(TWEEN.Easing.Quadratic.InOut);
        
        // Position
        const cameraPosStart = this.camera.position,
            cameraPosEnd = new THREE.Vector3(this.minZoom, 0, 0);
        const cameraPosition = new TWEEN.Tween(cameraPosStart)
            .to(cameraPosEnd, 2000)
            .easing(TWEEN.Easing.Cubic.Out)
            .onComplete(() => {
                this.camera.updateProjectionMatrix();
            });
        
        // SEQUENCE //
        cameraPosition.onStart(this.turnInteractionsOff);
        cameraPosition.start();
        // Compare the camera's starting and ending quaternions
        // If they don't match, run both the rotational and positional tweens
        // Otherwise, just run the positional tween
        //console.log(this.originalCameraQuaternion, this.camera.quaternion);
        // if (!utils.equivalentQuaternions(this.camera.rotation, this.originalCameraRotation)){
        //     //console.log("We have rotation and position to reset.");
        //     cameraRotation.chain(cameraPosition);
        //     cameraRotation.onStart(this.turnInteractionsOff);
        //     //cameraRotation.start();
        // } else {
        //     //console.log("We only have position to reset.");
        //     cameraPosition.onStart(this.turnInteractionsOff);
        //     cameraPosition.start();
        // }
    }

    animateToExplore = () => {
        // PROJECT FACES //
        // Shrink and fade out our project faces
        for (let i = 0; i < this.dodecahedron.children[1].children.length; i++) {
            const projectFace = this.dodecahedron.children[1].children[i];
            projectFace.retreat();
        }

        // Tween our dodecahedron to face the camera
        // const qStart = this.camera.quaternion; // current rotation of dodecahedron
        // const qStartingEuler = new THREE.Euler(0, 0, 0);
        // qStartingEuler.setFromQuaternion(qStart);
        // const qStartingEulerV3 = qStartingEuler.toVector3();

        // const qEnd = new THREE.Quaternion();
        // qEnd.setFromUnitVectors(qStartingEulerV3, this.endingEulerV3);

        // const tweenA = new TWEEN.Tween({ t: 0 }).to({ t: 1 }, 5000)
        //     .easing(TWEEN.Easing.Quadratic.Out)
        //     .onUpdate((tween) => { qStart.slerp(qEnd, tween.t) })
        //     .start();

        // Tween our camera transition from the home screen to Explore mode
        const cameraStart = this.camera.position,
            cameraEnd = new THREE.Vector3(this.maxZoom, 0, 0);

        new TWEEN.Tween(cameraStart)
            .to(cameraEnd, 5000)
            .delay(500)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(() => {
                this.camera.updateProjectionMatrix();
                this.turnInteractionsOn();
            })
            .start();

        // Chain our tweens together
        // tweenA.chain(tweenB);
    }

    // Raycasting event handler
    handleMouseClick = e => {
        e.preventDefault();
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;

        // if (this.intersects.length > 0) {
        //   this.intersects.forEach((intersection, index) => {
        //     if(!index === 0){
        //       console.log(intersection);
        //       intersection.object.material.opacity = 0.95;
        //     }
        //   });
        // } else {
        //   console.log("Nothing to see here.");
        // }
    }

    // Set grabby cursor when grabbing
    handleMouseDown = e => {
        e.preventDefault();
        this.canvas.classList.add("active-grab");
    }

    // Remove grabby cursor when no longer grabbing
    handleMouseUp = e => {
        e.preventDefault();
        this.canvas.classList.remove("active-grab");
    }

    // Add subtle shift of the background icosahedron wireframe on mouse move (this is extra, but it looks nice)
    handleMouseMove = e => {
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