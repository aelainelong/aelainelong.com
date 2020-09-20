import React from 'react';

import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import utils from '../../../utils/three';

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
        this.DodecahedronRotation = true;
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

        // Add fog!
        this.scene.fog = new THREE.Fog(0x67418a, 7, 20);

        // Attach controls to enable camera and group rotation / dragging behaviors
        this.orbitControls = new OrbitControls(this.camera, this.canvas);
        this.orbitControls.enablePan = false;
        this.orbitControls.enableZoom = false;
        this.orbitControls.enableKeys = true;
        this.orbitControls.maxDistance = this.getMaxZoom();

        // Add raycaster to catch mouse click events on the project faces
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // Add other window / canvas event handlers
        window.addEventListener('resize', this.onWindowResize, false);

        // Add Axes Helper
        // const axesHelper = new THREE.AxesHelper(25);
        // this.scene.add(axesHelper);

        // Start scene
        // this.renderScene(); // load static
        this.animate(); // load w/ rotation

        // Animate To Home //

        this.animateToHome = () => {
            const exitRotation = utils.getTransitionRotation(this.Dodecahedron.rotation.y);

            // Set our ending quaternion based on the opening side closest to the dodecahedron's current rotation
            const qStart = new THREE.Quaternion().copy(this.Dodecahedron.quaternion), // starting dodecahedron quaternion
                qEnd = new THREE.Quaternion().setFromEuler(exitRotation), // ending dodecahedron quaternion
                time = { t: 0 };

            const tweenA = new TWEEN.Tween(time)
                .to({ t: 1 }, 800)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((tween) => {
                    THREE.Quaternion.slerp(qStart, qEnd, this.Dodecahedron.quaternion, tween.t);
                    this.Dodecahedron.quaternion.normalize();
                });

            const cameraPosStart = this.camera.position,
                cameraPosEnd = new THREE.Vector3(this.minZoom, 0, 0);

            const tweenB = new TWEEN.Tween(cameraPosStart)
                .to(cameraPosEnd, 4000)
                .easing(TWEEN.Easing.Cubic.Out)
                .onStart(() => {
                    this.turnInteractionsOff();
                    this.Dodecahedron.advanceAllProjects();
                    if (this.props.currentProject) this.props.handleProjectClose();
                })
                .onStop(() => {
                    //console.log("ANIMATION TO HOME STOPPED.");
                    this.Dodecahedron.retreatAllProjects();
                })
                .onComplete(() => {
                    this.camera.updateProjectionMatrix();
                    //console.log("ANIMATION TO HOME IS DONE");
                });
            
            return tweenA.chain(tweenB);               
        }

        // Animate to Explore // //#endregion

        this.animateToExplore = () => {
            const exitRotation = utils.getTransitionRotation(this.Dodecahedron.rotation.y);
            
            // Set our ending quaternion based on the opening side closest to the dodecahedron's current rotation
            const qStart = new THREE.Quaternion().copy(this.Dodecahedron.quaternion), // starting dodecahedron quaternion
                qEnd = new THREE.Quaternion().setFromEuler(exitRotation), // ending dodecahedron quaternion
                time = {t: 0};

            const tweenA = new TWEEN.Tween(time)
                .to({t:1}, 800)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate(() => {
                    THREE.Quaternion.slerp(qStart, qEnd, this.Dodecahedron.quaternion, time.t );
                    this.Dodecahedron.quaternion.normalize();
                });
            
            const cameraStart = this.camera.position,
                cameraEnd = new THREE.Vector3(this.maxZoom, 0, 0);

            const tweenB = new TWEEN.Tween(cameraStart)
                .to(cameraEnd, 4000)
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

            return tweenA.chain(tweenB);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        // If we have entered/exited 'explore' mode, move our camera in/out accordingly
        if (prevProps.explore !== this.props.explore) this.updateCameraPosition(); 

        // If we have completed an update to the camera positioning, turn our Dodecahedron controls on/off accordingly
        if (prevState.ready !== this.state.ready) this.toggleControls();

        // If there is no selected project, restart the Dodecahedron rotation
        if (!this.props.currentProject) this.startDodecahedron();

        // If our selected project has changed, advance/retreat project faces on the Dodecahedron based on the selected project
        if (prevProps.currentProject !== this.props.currentProject) {
            if (prevProps.currentProject) {
                this.Dodecahedron.children[1].children[prevProps.currentProject.id - 1].retreat();
            }
            if (this.props.currentProject) {
                this.Dodecahedron.children[1].children[this.props.currentProject.id - 1].advance();

                // Move the camera to face the current project
                this.rotateToProject(this.Dodecahedron.children[1].children[this.props.currentProject.id - 1]);
            }
        }
    }

    // Clean up our scene controls and window event listeners when Scene unmounts
    componentWillUnmount(){
        // Remove all event listeners from the window and canvas objects
        this.orbitControls.dispose();
        window.removeEventListener('resize', this.onWindowResize);

        // Stop the rotation animation
        this.stopDodecahedron();
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
        if (this.DodecahedronRotation){
            this.startDodecahedron();
        }
        this.Icosahedron.startRotation();

        // Render scene
        TWEEN.update();
        this.orbitControls.update();

        requestAnimationFrame(this.animate);
        this.renderScene();
    }

    startDodecahedron = () => {
        this.Dodecahedron.startRotation();
        this.DodecahedronRotation = true;
    }

    stopDodecahedron = () => {
        if (!this.DodecahedronRotation) return;
        this.Dodecahedron.stopRotation();
        this.DodecahedronRotation = false;
    }

    // Update camera position
    updateCameraPosition = e => {
        if (this.props.explore) {
            this.animateToHome().stop();
            this.animateToExplore().start();
        } else {
            this.animateToExplore().stop();
            this.animateToHome().start();
        }
    }

    // Rotate the camera to the active project
    rotateToProject = project => {
        const projectPosition = new THREE.Vector3();
        const zoomFactor = this.maxZoom;
        project.getWorldPosition(projectPosition);
        const endPosition = projectPosition.multiplyScalar(zoomFactor * 8);

        new TWEEN.Tween(this.camera.position)
            .to(endPosition, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
    }

    // Turn on the scene's ready state to enable mouse interactions
    turnInteractionsOn = () => this.setState({ ready: true });

    // Turn off the scene's ready state to disable mouse interactions
    turnInteractionsOff = () => this.setState({ ready: false });

    // Get our scene ready for mouse interactions (dragging / hovering / clicking)
    toggleControls = () => {
        if(this.state.ready){
            //this.canvas.addEventListener('mousemove', this.handleMouseMove);
            this.canvas.addEventListener('click', this.handleMouseClick, false);
            this.canvas.addEventListener('touchstart', this.handleMouseClick, false);
        } else {
            this.Dodecahedron.retreatAllProjects();
            //this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('click', this.handleMouseClick, false);
            this.canvas.removeEventListener('touchstart', this.handleMouseClick, false);
        }
    }

    // Get min camera zoom based on window width
    getMinZoom = () => {
        if (window.innerWidth > 1200) return 1.25;
        if (window.innerWidth > 768) return 1.35;
        return 1.75;
    }

    // Get max camera zoom based on window width
    getMaxZoom = () => {
        if (window.innerWidth > 1200) return 4.5;
        if (window.innerWidth > 768) return 5.5;
        return 5.75;
    }

    // Update our threeJS scene on window resize
    onWindowResize = () => {
        const currentZoom = this.cameraZoom,
              newMinZoom = this.getMinZoom(),
              newMaxZoom = this.getMaxZoom();

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
        e.stopPropagation();

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

            // // Make sure all projects are retreated from Dodecahedron surface
            this.Dodecahedron.retreatAllProjects();

            // Activate only the selected project
            if(!clickedProject.active){
                // Update the active project's active flag
                clickedProject.active = true;

                // Stop the rotation of the parent Dodecahedron
                this.stopDodecahedron();

                // Move the active project's face forward
                clickedProject.advance();

                // Move the camera to face the current project
                this.rotateToProject(clickedProject);

                // Open the project details panel
                this.props.handleProjectOpen(clickedProject.projectID);
            } else {
                // Close the project details panel
                this.props.handleProjectClose(clickedProject.projectID);

                // Move the inactive project's face back
                clickedProject.retreat();

                // Restart the rotation of the parent Dodecahedron
                this.startDodecahedron();

                // Update the inactive project's active flag
                clickedProject.active = false;
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
        const showTooltip = this.state.ready && !this.props.currentProject;
        return (
            <div className={`Scene ${this.state.ready ? `Scene-ready` : ``}`}>
                <div className="scene-wrapper" ref={this.sceneWrapper}></div>
                <ToolTip showTooltip={showTooltip} ref={this.toolTip} />
            </div>
        );
    }
}

export default Scene;