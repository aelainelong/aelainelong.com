import React from 'react';

import Scene from './_scene/Scene';
import Project from './_project/Project';

import './Portfolio.css';

import client from '../../data/client.js';

class Portfolio extends React.Component {
  constructor(props){ 
    super(props);
    
    this.state = {
      portfolioOpen: false,
      portfolioSize: client.allProjects.length,
      portfolioStart: false,
      portfolioEnd: false,
      activeCategory: null, 
      currentProject: null
    }
  }
  
  // Update portfolio state upon unmounting
  componentWillUnmount(){
    // Change portfolio state to closed
    this.setState({ portfolioOpen: false });
  }

  // Trigger open event upon project selection
  handleProjectOpen = projectID => this.openProject(projectID);
  
  // Trigger close event upon project close
  handleProjectClose = () => this.closeProject();
  
  // Open selected project by passing project ID into state
  openProject = projectID => {
    this.setState({ currentProject: projectID }, function(){
      this.manageProgress();
    });
  }

  // Close current project by clearing project ID from state
  closeProject = () => this.setState({ currentProject: null });
  
  // Keep track of our place in the portfolio
  manageProgress = () => {
    const { currentProject, portfolioSize } = this.state;
    //console.log("Current Project is project #" + currentProject);
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
      portfolioStart,
      portfolioEnd
    });
  }
  
  // Navigate between projects by incrementing/decrimenting project ID in state
  traverseProjects = direction => {
    let currProject = this.state.currentProject;
    let newProject;
    
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
      setTimeout(() => this.closeProject(), 500);
    }
  }
  
  render(){
    const portfolioProgress = {
      start: this.state.portfolioStart,
      end: this.state.portfolioEnd
    }
  
    return (
      <div className={this.state.portfolioOpen ? `Portfolio open` : `Portfolio` }>
        <Scene 
          explore={this.props.explore} 
          projects={client.allProjects} 
          closeProject={this.handleProjectClose} 
          openProject={this.handleProjectOpen} 
          currentProject={this.state.currentProject}
        />
        { this.state.currentProject ? 
          <Project 
            project={client.getProjectByID(this.state.currentProject)} 
            closeProject={this.handleProjectClose} 
            traverseProjects={this.traverseProjects} 
            portfolioProgress={portfolioProgress} 
        />
         : null }
      </div>
    );
  }
}

export default Portfolio;

