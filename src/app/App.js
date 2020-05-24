import React from 'react';
import ReactGA from 'react-ga';
import * as Preloader from 'react-preloaded';


import client from '../data/client.js';
import Loading from '../components/loading/Loading';
import Header from '../components/header/Header';
import Portfolio from '../components/portfolio/Portfolio';

import './App.css';

class App extends React.Component {
  constructor(props){
    super(props);

    this.bgColorsTop = {
      home: "#95dcc0",
      explore: "#70bce3",
      about: "#e39f4d",
      connect: "#eae96d"
    }

    this.bgColorsBottom = {
      fuschia: "#99478e"
    }

    this.state = {
      home: true,
      explore: false,
      about: false,
      connect: false,
      bgColorTop: this.bgColorsTop.home, // bgColorsTop[Object.keys(this.bgColorsTop)[Math.floor(Math.random() * Object.keys(this.bgColorsTop).length)]],
      bgColorBottom: this.bgColorsBottom[Object.keys(this.bgColorsBottom)[Math.floor(Math.random() * Object.keys(this.bgColorsBottom).length)]]
    };
  }

  componentDidMount(){
    ReactGA.initialize('UA-111080612-1');
  }

  updateView = view => {
    if(view !== "home"){
      this.setState(() => ({ home: false }));
      this.setState(() => ({ [view]: !this.state[view] }));
    } else {
      this.setState(() => ({ home: true }));
    }
  }

  toggleConnect = () => {
    this.setState(() => ({ connect: !this.state.connect }));
  }
  
  render() {
    const portfolioInfo = client.getPortfolioInfo();
    const socialLinks = client.getAllSocial();
    const allProjects = client.getAllProjects();
    const allCategories = client.getAllCategories();
    const allImages = client.getAllImages();
    
    const { getCategoryProjects, getProjectByID } = client;
    const Preload = Preloader.Preload;
    
    return (
      <div className="App" className={`App ${this.state.home ? `App-home` : `App-explore`} ${this.state.connect ? `App-connect` : ``} ${this.state.about ? `App-about` : ``}`}>
        {/* <Preload
          loadingIndicator={Loading}
          images={allImages}
          autoResolveDelay={3000}
          onError={this._handleImageLoadError}
          onSuccess={this._handleImageLoadSuccess}
          resolveOnError={true}
          mountChildren={true}
        >  */}
          <div className="app-cover" style={{ background: `linear-gradient(to bottom, rgba(0, 0, 0, 0), ${this.state.bgColorBottom})` }}></div>
        <div className="app-wrapper">
          <Header portfolioInfo={portfolioInfo} updateView={this.updateView} toggleConnect={this.toggleConnect} connect={this.state.connect} socialLinks={socialLinks} />
            <Portfolio
              home={this.state.home}
              allProjects={allProjects} 
              getCategories={allCategories}
              getCategoryProjects={getCategoryProjects} 
              getProjectByID={getProjectByID}
            />
          </div>
        {/* </Preload> */}
      </div>
    );
  }
}

export default App;
