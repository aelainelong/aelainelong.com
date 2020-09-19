import React from 'react';
import ReactGA from 'react-ga';
import * as Preloader from 'react-preloaded';

import Loading from '../components/loading/Loading';
import Header from '../components/header/Header';
import Portfolio from '../components/portfolio/Portfolio';

import client from '../data/client.js';
import './App.css';

class App extends React.Component {
  constructor(props){
    super(props);

    this.bgColorsTop = {
      home: "#83e2bd",
      explore: "#70bce3",
      about: "#e79d43",
      connect: "#eae96d"
    }

    this.bgColorsBottom = {
      fuschia: "#99478e"
    }

    this.state = {
      active: "home",
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
    if (view !== this.state.active) this.setState(() => ({ active: view }));
    if (view !== "home") this.setState(prevState => ({ [view]: !prevState[view] }));
    if (view === "home" && this.state.explore) this.setState(() => ({ explore: false }));
  }
  
  render() {
    const Preload = Preloader.Preload;
    const allThumbnails = client.getAllImages();
    
    return (
      <div 
        data-active-view={this.state.active} 
        className={`App ${this.state.explore ? `App-explore` : `App-home`} ${this.state.connect ? `App-connect` : ``} ${this.state.about ? `App-about` : ``}`}
        >
        <Preload
          loadingIndicator={Loading}
          images={allThumbnails}
          autoResolveDelay={3000}
          onError={this._handleImageLoadError}
          onSuccess={this._handleImageLoadSuccess}
          resolveOnError={true}
          mountChildren={true}
        > 
          {/* <div className="app-cover" style={{ background: `linear-gradient(to bottom, rgba(0, 0, 0, 0), ${this.state.bgColorBottom})` }}></div> */}
          <div className="app-wrapper">
            <Header updateView={this.updateView} toggleConnect={this.toggleConnect} about={this.state.about} connect={this.state.connect} />
            <Portfolio explore={this.state.explore} />
          </div>
        </Preload>
      </div>
    );
  }
}

export default App;
