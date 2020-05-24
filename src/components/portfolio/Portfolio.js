import React from 'react';
import ReactDOM from 'react-dom';

import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import utils from '../../utils/three.js';
import icosahedronWireframe from '../geometries/icosahedron.js';

import PropTypes from 'prop-types';
import Project from '../project/Project';
import './Portfolio.css';

class Portfolio extends React.Component {
  constructor(props){ 
    super(props);
    
    this.state = {
      portfolioOpen: false,
      portfolioSize: this.props.allProjects.length,
      portfolioStart: false,
      portfolioEnd: false,
      activeCategory: null, 
      currentProject: null,
      rotationSpeed: 0.0025,
      projectOpacity: 0.85,
      projectScale: 0.80,
      projectTranslation: 0.20,
      maxZoom: 4.5,
      minZoom: 1
    }
  }
  
  // Fire up our portfolio geometries upon mounting

  componentDidMount(){

    // Add Scene
    this.scene = new THREE.Scene();

    // Add Camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(this.state.minZoom, 0, this.state.minZoom);

    // Add Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0.000000, 0);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.gammaFactor = 2.2;
    this.renderer.gammaOutput = true;
    this.canvas = this.renderer.domElement;
    ReactDOM.findDOMNode(this).appendChild(this.canvas); // this.mount.appendChild(this.canvas);

    // Add geometric dodecahedron
    this.geometry = new THREE.DodecahedronGeometry(2);
    const edges = new THREE.EdgesGeometry(this.geometry);
    this.dodecahedron = new THREE.LineSegments(edges, new THREE.LineBasicMaterial());

    // Add project faces on top of the dodecahedron
    const sides = this.props.allProjects.map(project => this.createProjectFace(project));

    // Add the dodecahedron and its custom faces to an object group, then add the group to the scene
    this.group = new THREE.Group();
    this.group.add(this.dodecahedron);
    sides.forEach(side => this.group.add(side));
    this.scene.add(this.group);

    // Add the background icosahedron wireframe & fog to the scene
    this.icosahedronWireframe = icosahedronWireframe();
    this.scene.add(this.icosahedronWireframe);
    this.scene.fog = new THREE.Fog(0x67418a, 7, 20);

    // Attach controls to enable group rotation on drag
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enablePan = false;
    this.controls.enableKeys = true;
    this.controls.maxDistance = this.state.maxZoom;

    // Add raycaster to catch mouse click events on the project faces
    this.raycaster =  new THREE.Raycaster();
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
  componentDidUpdate(prevProps, prevState){
    console.log("Component did update.");
    if (prevProps.home !== this.props.home){
      this.updateCameraPosition();
    }
  }
  
  // Update portfolio state upon unmounting
  componentWillUnmount(){

    // Remove all event listeners from the window and canvas objects
    window.removeEventListener('click', this.handleMouseClick);
    window.removeEventListener('resize', this.onWindowResize);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);

    // Remove the model controls

    // Stop the rotation animation
    this.stopRotation();

    // Remove the threeJS scene from the DOM
    ReactDOM.findDOMNode(this).removeChild(this.canvas); // this.mount.removeChild(this.canvas);

    // Change portfolio state to closed
    this.setState({ portfolioOpen: false });
  }

  // Render method for the threeJS scene
  renderScene(){
    // Get the objects which intersect the picking ray
    //this.raycaster.setFromCamera(this.mouse, this.camera);
    //this.intersects = this.raycaster.intersectObjects(this.group.children, true);

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }

  // Update our threeJS scene on window resize
  onWindowResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight );
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

  // Create a clickable side of the polyhedron from a project
  createProjectFace = project => {
    
    const getTemplateVertices = () => {
      let templateVertices = [];
      // Grab a set of 3 faces (triangles) from the base polyhedron, based on the project index
      const setSize = 3;
      const indexFloor = project.id * setSize;
      const indexCeil = indexFloor + setSize;
      const parentFaces = this.geometry.faces.slice(indexFloor, indexCeil);

      for (let f = 0; f < parentFaces.length; f++) {
        // Create an array of the XYZ vertices (by index) associated with the face
        let faceVertices = [];
        faceVertices.push(parentFaces[f].a);
        faceVertices.push(parentFaces[f].b);
        faceVertices.push(parentFaces[f].c);

        // Push the face's XYZ vertices (by index) into the new geometry's vertice array as Vector3s
        faceVertices
        .map(verticeIndex => this.geometry.vertices[verticeIndex])
        .forEach(vertex => {
          templateVertices.push(
            new THREE.Vector3(vertex.x, vertex.y, vertex.z)
          );
        });
      }

      return templateVertices;
    }

    // Create positioned pentagon geometry from original polyhedron side
    const tGeometry = new THREE.Geometry();
    const tVertices = getTemplateVertices();
    tGeometry.setFromPoints(tVertices);
    tGeometry.mergeVertices();
    
    // Create a sister pentagon geometry for imparting correct UV mapping, etc.
    const pGeometry = new THREE.CircleGeometry(2, 5);
    
    // Load project thumbnail as our texture
    let pTexture;
    const pMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: this.state.projectOpacity, side: THREE.DoubleSide, color: parseInt(project.color.replace("#", "0x"), 16) });
    pMaterial.color.convertSRGBToLinear();

    if(project.thumbnail){
      pTexture = new THREE.TextureLoader().load(project.thumbnail);
      pTexture.minFilter = THREE.LinearFilter;
      pTexture.encoding = THREE.sRGBEncoding;
      pTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      pMaterial.map = pTexture;
    }

    // Create the project mesh
    const pMesh = new THREE.Mesh(pGeometry, pMaterial);
    const tMesh = new THREE.Mesh(tGeometry, pMaterial);

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
    const scale = this.state.projectScale;
    utils.translateFromCenter(tMesh, this.state.projectTranslation);
    tMesh.geometry.scale(scale, scale, scale);

    // Create overlay text using project title


    // Group the project's pentagon faces, link and title into one 2D object -> project face

    const pFace = new THREE.Group();
    pFace.name = project.title;
    pFace.add(tMesh);

    return pFace;
  }

  // Define dodecahedron & wireframe animations
  animate = () => {

    // Set canvas size responsively
    const canvas = this.canvas;
    if(canvas.width !== window.innerWidth || canvas.height !== window.innerHeight){
      this.renderer.setSize(window.innerWidth, window.innerHeight, false);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }

    // Set rotation parameters
    this.group.rotation.y -= this.state.rotationSpeed; // rotate the polyhedron around the y axis
    this.icosahedronWireframe.rotation.y += this.state.rotationSpeed; // rotate background wireframe around the y axis

    // Render scene
    this.controls.update();
    TWEEN.update();
    requestAnimationFrame(this.animate);
    this.renderScene();
  }

  // Start animation
  startRotation = () => {
    if(!this.rotateForm){
      this.rotateForm = requestAnimationFrame(this.animate);
    }
  }

  // Stop animation
  stopRotation = () => {
    cancelAnimationFrame(this.rotateForm);
  }

  // Slow model rotation (used on mouseover)
  slowRotation = (e) => {
    // this.group.rotation.x -= this.state.rotationSpeed; // rotation around the x axis
    e.object.rotation.y -= this.state.rotationSpeed; // rotation around the y axis
  }

  // Reset model rotation (used on mouseout)
  speedRotation = (e) => {
    // this.group.rotation.x += this.state.rotationSpeed * 2; // rotation around the x axis
    e.object.rotation.y += this.state.rotationSpeed * 2; // rotation around the y axis
  }

  // Update camera position
  updateCameraPosition = (e) => {
    if(!this.props.home){
      this.animateFromHome();
    } else {
      this.animateToHome();
    }
    // this.camera.updateProjectionMatrix();
    // this.controls.update();
    // this.renderScene();
  }

  animateToHome = () => {
    // Tween our dodecahedron to face the camera
    const tweenA = new TWEEN.Tween(this.group.rotation)
                            .to({ x: 0, y: 2, z: 0 }, 1000)
                            .easing(TWEEN.Easing.Quadratic.Out)
                            .start();

    // Tween our camera transition from Explore mode back to the home screen
    const cameraStart = this.camera.position,
          cameraEnd = new THREE.Vector3(this.state.minZoom, 0, this.state.minZoom);

    const tweenB = new TWEEN.Tween(cameraStart)
                            .to(cameraEnd, 5000)
                            .delay(500)
                            .easing(TWEEN.Easing.Quadratic.Out)
                            .onComplete(() => this.camera.updateProjectionMatrix())
                            .start();

    // Chain our tweens together
    //tweenA.chain(tweenB);
  }

  animateFromHome = () => {
    // Tween our dodecahedron to face the camera
    const tweenA = new TWEEN.Tween(this.group.rotation)
                            .to({ x: 0, y: -4, z: 0 }, 1000)
                            .easing(TWEEN.Easing.Quadratic.Out)
                            .start();

    // Tween our camera transition from the home screen to Explore mode
    const cameraStart = this.camera.position,
          cameraEnd = new THREE.Vector3(2, 0, 4);

    const tweenB = new TWEEN.Tween(cameraStart)
                            .to(cameraEnd, 5000)
                            .delay(500)
                            .easing(TWEEN.Easing.Quadratic.Out)
                            .onComplete(() => this.camera.updateProjectionMatrix())
                            .start();

    // Chain our tweens together
    // tweenA.chain(tweenB);
  }
  
  // Trigger open event upon project selection
  handleProjectOpen = (projectID) => {
    this.openProject(projectID);
  }
  
  // Trigger close event upon project close
  handleProjectClose = () => {
    this.closeProject();
  }
  
  // Open selected project by passing project ID into state
  openProject = (projectID) =>{
    console.log("Running the open project event handler.");
    this.setState({ currentProject: projectID }, function(){
      // Manage portfolio progress
      this.manageProgress();
    });
  }
  
  // Keep track of our place in the portfolio
  manageProgress = () => {
    const { currentProject, portfolioSize } = this.state;
    console.log("Current Project is project #" + currentProject);
    let portfolioStart;
    let portfolioEnd;
    
    if(currentProject && currentProject === 1){
      portfolioStart = true;
      portfolioEnd = false;
    } else if(currentProject && currentProject >= portfolioSize){
      portfolioStart = false;
      portfolioEnd = true;
    } else {
      portfolioStart = false;
      portfolioEnd = false;
    }
    
    this.setState({
      portfolioStart: portfolioStart,
      portfolioEnd: portfolioEnd
    });
    
    // console.log("Beginning is " + portfolioStart);
    // console.log("Ending is " + portfolioEnd);
  }
  
  // Navigate between projects by incrementing/decrimenting project ID in state
  traverseProjects = (direction) => {
    let currProject = this.state.currentProject;
    let newProject;
    
    // alert("At click, current project is project #" + currProject);
    
    // Check if we have hit the beginning or end of portfolio
    if(direction === "prev" && currProject !== 1){
      newProject = --currProject;
      this.closeProject();
      this.openProject(newProject);
    } else if (direction === "next" && !this.state.portfolioEnd){
      newProject = ++currProject;
      this.closeProject();
      this.openProject(newProject);
    } else {
      setTimeout(function(){
        this.closeProject();
      }.bind(this), 500);
    }
  }
  
  // Close current project by clearing project ID from state
  closeProject = () => {
    this.setState({ currentProject: null });
  }
  
  render(){
    const allProjects = this.props.allProjects;
    const portfolioOpen = this.state.portfolioOpen;
    const currentProject = this.state.currentProject;
    const projectInfo = this.props.getProjectByID(currentProject);
    const handleProjectOpen = this.handleProjectOpen;
    const handleProjectClose = this.handleProjectClose;
    const traverseProjects = this.traverseProjects;
    const allProjectObjects = buildPortfolio(allProjects);
    const portfolioProgress = {
      start: this.state.portfolioStart,
      end: this.state.portfolioEnd
    }
    
    // console.log(portfolioProgress);
    
    // Fetch and build our portfolio items, with all projects passed in
    function buildPortfolio(projects){
      const projectObjects = projects.map((object, index) => {
        const projectID = object.id;
        const projectThumb = {
          backgroundImage: 'url(' + process.env.PUBLIC_URL + '/img/portfolio' + object.thumbnail + ')'
        }
        
        return (
          <div key={`item-`+ index} className="item" onClick={() => handleProjectOpen(projectID)}>
            <div className="item-wrap">
              <div className="item-info">
                <div className="item-info-front">
                  <div className="item-frame" style={projectThumb}>
                    <div className="item-text"><span>view project</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      });
      
      return projectObjects;
    }
    
    // Split our projects into 4 sets, one for left and right and one for top and bottom
    function splitPortfolio(allProjectObjects){
      const set1 = Array.from(allProjectObjects.filter((obj, index, arr) => index < (arr.length / 2) ));
      const set2 = Array.from(allProjectObjects.filter((obj, index, arr) => index >= (arr.length / 2) ).reverse());
      
      // Return our split portfolio sets
      return {
        set1: set1,
        set2: set2
      }
    }
  
    return(
      <div className={ portfolioOpen ? `Portfolio open` : `Portfolio` }>
        <div className="portfolio-tooltip">
          <i className="fas fa-dice-d20"></i><p>Interact with the polyhedron to view different projects</p>
        </div>
        { currentProject ? <Project projectInfo={projectInfo} handleProjectClose={handleProjectClose} traverseProjects={traverseProjects} portfolioProgress={portfolioProgress} /> : null }
      </div>
    );
  }
}

export default Portfolio;

Portfolio.propTypes = {
  allProjects: PropTypes.array,
  getCategories: PropTypes.array,
  getProjectByID: PropTypes.func,
  getCategoryProjects: PropTypes.func, 
  portfolioInfo: PropTypes.object
}

