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
      currentProject: null
    }
  }
  
  componentWillUnmount(){
    // Change portfolio state to closed
    this.setState({ portfolioOpen: false });
  }

  // Trigger open event upon project selection
  openProject = projectID => {
    if (isNaN(projectID) || projectID > this.state.portfolioSize) return;

    if(!this.state.currentProject || this.state.currentProject.id !== projectID){
      this.setState({ currentProject: client.getProjectByID(projectID) });
    }
  }
  
  // Trigger close event upon project close
  closeProject = () => this.setState({ currentProject: null });
  
  // Navigate between projects by incrementing/decrimenting project ID in state
  traverseProjects = direction => {
    if (direction !== "prev" && direction !== "next") return;

    let currProject = this.state.currentProject.id;
    let portfolioEnd = currProject >= this.state.portfolioSize;
    
    // Check if we have hit the beginning or end of portfolio
    if(direction === "prev" && currProject !== 1){
      this.closeProject();
      this.openProject(--currProject);
      return;
    }
    if (direction === "next" && !portfolioEnd){
      this.closeProject();
      this.openProject(++currProject);
      return;
    }
    setTimeout(() => this.closeProject(), 500);
  }
  
  render(){
    return (
      <div className={this.state.portfolioOpen ? `Portfolio open` : `Portfolio` }>
        <Scene 
          explore={this.props.explore} 
          projects={client.allProjects} 
          handleProjectClose={this.closeProject} 
          handleProjectOpen={this.openProject} 
          currentProject={this.state.currentProject}
        />
        { this.state.currentProject ? 
          <Project 
            project={this.state.currentProject} 
            handleProjectClose={this.closeProject} 
            traverseProjects={this.traverseProjects} 
            portfolioSize={this.state.portfolioSize} 
        />
         : null }
      </div>
    );
  }
}

export default Portfolio;

