import React from 'react';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import ReactFancyBox from 'react-fancybox';
import 'react-fancybox/lib/fancybox.css';

import './Project.css';

class Project extends React.Component {
  constructor(props){
    super(props);
    
    this.state = {
      projectOpen: false,
      projectExpanded: false,
      atStart: this.props.portfolioProgress.start,
      atEnd: this.props.portfolioProgress.end
    }
  }
  
  // Update portfolio progress prior to mounting 
  componentWillMount(){
    //console.log("Receiving initial props now. Do something.");
  }
  
  // Update project state upon mounting
  componentDidMount(){
    setTimeout(function(){
      this.setState({ projectOpen: true });
    }.bind(this), 200);

    // Portfolio Progress
    const { atEnd } = this.state;

    // Project meta info
    const projectImages = this.props.project.images;
    this.projImageList = projectImages.map((image, index) => {
      return (
        <li key={`image-` + index}>
          <ReactFancyBox
            thumbnail={process.env.PUBLIC_URL + '/img/portfolio' + image}
            image={process.env.PUBLIC_URL + '/img/portfolio' + image} />
        </li>
      )
    });

    const projectCategories = this.props.project.categories;
    this.projCatList = projectCategories.map((category, index) => {
      return (
        <li key={`category-` + index}>
          <span>{category}</span>
        </li>
      )
    });

    const projectTools = this.props.project.tools;
    this.projToolList = projectTools.map((tool, index) => {
      return tool.toString();
    }).join(", ");
  }
  
  // Update project state upon unmounting
  componentWillUnmount(){
    this.setState({ projectOpen: false });
  }
  
  componentWillReceiveProps(newProps){
    this.setState({
      atStart: newProps.portfolioProgress.start,
      atEnd: newProps.portfolioProgress.end
    });
  }

  // Expand/collapse the project details
  handleToggle = () => {
    this.setState(() => ({ projectExpanded: !this.state.projectExpanded }));
  }
  
  // Update project state upon unmounting
  handleClose = () => {
    if(this.state.projectExpanded){
      this.setState(() => ({ projectExpanded: false }));
    } else {
      this.setState(() => ({ projectOpen: false }));
      setTimeout(function () {
        this.props.closeProject();
      }.bind(this), 1000);
    }
  }
  
  // Load previous/next project upon click of project nav
  handleProjectNav = (direction) => {
    const { atStart, atEnd } = this.state;
    
    if((atStart && direction === "prev") || (atEnd && direction === "next")){
      // console.log("We are at the beginning or at the end");
      this.setState({ projectOpen: false });
      setTimeout(function(){
        this.props.handleProjectClose();
      }.bind(this), 500);
    } else {
      this.props.traverseProjects(direction);
    }
  }
  
  // Track project link clicks via Google Analytics
  handleLinkClick = e => {
    const linkTitle = e.target.getAttribute("title");
    ReactGA.event({
      category: 'externalSiteLink',
      action: 'click',
      label: linkTitle
    });
  }
  
  render(){
    const projectThumb = this.props.project.thumbnail;
    //style={{ backgroundImage: `url(${require(`./../../../assets/images/portfolio/_thumbs/${projectThumb}`)})`}}
    
    return(
      <div className={`Project ${this.state.projectOpen ? `Project--open` : ``} ${this.state.projectExpanded ? `Project--expanded` : ``}`}>
        <div className="project-wrapper">
        <div className="project-cover"></div>
        
          <div className="project-content">

            <div className="project-header">
              <h2 className="project-title">{this.props.project.title}</h2>
              {this.props.project.deliverables ? <h3 className="project-subtitle">{this.props.project.deliverables}</h3> : null}
              {this.props.project.url ? <a href={this.props.project.url} className="project-link" target="_blank" title={this.props.project.title} rel="noopener noreferrer" onClick={(e) => this.handleLinkClick(e)}><i className="fa fa-link" aria-hidden="true"></i> Visit site</a> : null}
            </div>

            <div className="project-meta">
              {this.props.project.description ? <p className="project-description">{this.props.project.description}</p> : null}
              {this.projToolList ? <h4><span>Technologies:</span> {this.projToolList}</h4> : null}
              {this.props.project.client ? <h4><span>Client:</span> {this.props.project.client}</h4> : null}
              {this.props.project.agency ? <h4><span>Agency:</span> {this.props.project.agency}</h4> : null}
            </div>

            <div className="project-media">
              <div className="project-images">
                <ul>{this.projImageList}</ul>
              </div>
            </div>
          
          </div>

          <div className="project-nav">
            {this.state.projectExpanded ? null : <button className="btn btn-toggle" onClick={() => this.handleToggle()}>View</button>}
            { !this.state.projectExpanded ? null : <button className="btn btn-close" onClick={() => this.handleClose()}>close</button>}
            { this.state.atEnd ? null : <button className="btn btn-next" onClick={() => this.handleProjectNav("next")}>next</button> }
            {this.state.atStart ? null : <button className="btn btn-prev" onClick={() => this.handleProjectNav("prev")}>prev</button>}
          </div>
      </div>
      </div>
    )
  }
}

export default Project;

Project.propTypes = {
  project: PropTypes.object,
  handleProjectClose: PropTypes.func,
  traverseProjects: PropTypes.func,
  portfolioProgress: PropTypes.object
}