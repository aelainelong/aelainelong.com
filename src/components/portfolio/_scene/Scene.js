import React from 'react';
import ReactDOM from 'react-dom';

import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import dodecahedron from '../_geometry/_dodecahedron/dodecahedron';
import icosahedron from '../_geometry/_icosahedron/icosahedron';

class Scene extends React.Component {
    constructor(props){
        super(props);

        this.maxZoom = 4.5;
        this.minZoom = 1;
        this.rotationSpeed = 0.0025;
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
        ReactDOM.findDOMNode(this).appendChild(this.canvas); // this.mount.appendChild(this.canvas);

        // Add our portfolio dodecahedron and the background icosahedron to the scene
        this.dodecahedron = dodecahedron(this.props.projects);
        this.icosahedron = icosahedron;
        this.scene.add(this.dodecahedron, this.icosahedron);

        // Add fog!
        this.scene.fog = new THREE.Fog(0x67418a, 7, 20);

        // Attach controls to enable group rotation on drag
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enablePan = false;
        this.controls.enableKeys = true;
        this.controls.maxDistance = this.maxZoom;

        // Add raycaster to catch mouse click events on the project faces
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        //window.addEventListener('click', this.handleMouseClick, false);

        // Add window and canvas event handlers
        window.addEventListener('resize', this.onWindowResize, false);
        //this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);

        // Add Axes Helper
        // const axesHelper = new THREE.AxesHelper(25);
        // this.scene.add(axesHelper);

        // Start scene
        // this.renderScene(); // load static
        this.animate(); // load w/ rotation
    }

    // Update app view
    componentDidUpdate(prevProps, prevState) {
        console.log("Component did update.");
        if (prevProps.explore !== this.props.explore) {
            this.updateCameraPosition();
        }
    }

    // Clean up our scene listeners when Scene unmounts
    componentWillUnmount(){
        this.dispose();
    }

    dispose = () => {
        // Remove all event listeners from the window and canvas objects
        window.removeEventListener('click', this.handleMouseClick);
        window.removeEventListener('resize', this.onWindowResize);
        this.canvas.removeEventListener('mousedown', this.handleMouseDown);
        this.canvas.removeEventListener('mouseup', this.handleMouseUp);

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
        //this.dodecahedron.rotation.y -= this.rotationSpeed; // rotate the polyhedron around the y axis
        //this.icosahedron.rotation.y += this.rotationSpeed; // rotate background wireframe around the y axis


        // Render scene
        this.controls.update();
        TWEEN.update();
        const thisAnimation = requestAnimationFrame(this.animate);
        this.renderScene();
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

    // Activate/Deactivate the portfolio
    handlePortfolioReady = () => {
        this.props.togglePortfolioReady();
    }

    animateToHome = () => {

        // Tween our dodecahedron to face the camera
        const qStart = this.dodecahedron.quaternion; // current rotation of dodecahedron
        // const qStartEuler = new THREE.Euler();
        // qStartEuler.setFromQuaternion(qStart);
        // const qStartVector3 = qStartEuler.toVector3();

        console.log(qStart);

        const qEnd = new THREE.Quaternion();
        qEnd.set(qStart.x, 2.2, qStart.z, qStart.w);
        // const qEndEuler = new THREE.Euler(0, 2.15, 0);
        // const qEndVector3 = qEndEuler.toVector3();

        // console.log(qStartVector3);
        // console.log(qEndVector3);

        //qEnd.setFromUnitVectors(qStartVector3, qEndVector3);

        // const polyStart = new THREE.Vector3(); // Vector 3 extracted from the quaternion
        // const polyQuaternion = new THREE.Quaternion().setFromUnitVectors(polyStart, polyEnd);

        const tweenA = new TWEEN.Tween({ t: 0 }).to({ t: 1 }, 2000)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate((tween) => { qStart.slerp(this.camera.quaternion, tween.t) })
            .start();

        // const tweenA = new TWEEN.Tween(this.dodecahedron.rotation)
        //     .to({ x: 0, y: 2.2, z: 0 }, 1000)
        //     .easing(TWEEN.Easing.Quadratic.Out)
        //     .start();

        // Tween our camera transition from Explore mode back to the home screen
        const cameraStart = this.camera.position,
            cameraEnd = new THREE.Vector3(this.minZoom, 0, 0);

        const tweenB = new TWEEN.Tween(cameraStart)
            .to(cameraEnd, 2000)
            .easing(TWEEN.Easing.Linear.None)
            .onComplete(() => {
                this.camera.updateProjectionMatrix();

                // Toggle the portfolio tooltip
                this.handlePortfolioReady();
            })
            .start();

        // Chain our tweens together
        //tweenA.chain(tweenB);
    }

    animateToExplore = () => {
        // Tween our dodecahedron to face the camera
        new TWEEN.Tween(this.dodecahedron.rotation)
            .to({ x: 0, y: 2.2, z: 0 }, 1000)
            .easing(TWEEN.Easing.Linear.None)
            .start();

        // Tween our camera transition from the home screen to Explore mode
        const cameraStart = this.camera.position,
            cameraEnd = new THREE.Vector3(2, 0, 4);

        new TWEEN.Tween(cameraStart)
            .to(cameraEnd, 5000)
            .delay(500)
            .easing(TWEEN.Easing.Linear.None)
            .onComplete(() => {
                this.camera.updateProjectionMatrix();

                // Toggle the portfolio tooltip
                this.handlePortfolioReady();
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
        this.canvas.classList.add("active-grab");
    }

    // Remove grabby cursor when no longer grabbing
    handleMouseUp = e => {
        this.canvas.classList.remove("active-grab");
    }

    // Add subtle shift of the background wireframe icosahedron
    handleMouseMove = e => {
        const mouse = new THREE.Vector3();
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        mouse.z = 0;
    }

    render(){
        return (
            <div></div>
        );
    }
}

export default Scene;