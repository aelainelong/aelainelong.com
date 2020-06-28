import React from 'react';
import Stagger from 'react-css-stagger';
import './About.css';

class About extends React.Component {
    constructor(props){
        super(props)

        this.aboutWrapper = React.createRef();
    }
    componentDidMount(){
        this.showBio();
    }
    componentWillUnmount(){
        if (this.aboutWrapper.current){
            this.aboutWrapper.current.classList.remove("aboutIn");
        }
        clearTimeout(this.showBio);
    }
    showBio = () => {
        if (this.aboutWrapper.current){
            setTimeout(() => {
                this.aboutWrapper.current.classList.add("aboutIn");
            }, 200);
        }
    }

    render(){
        return (
            <div className="About">
                {/* <Stagger transition={"aboutIn"} delay={150} initialDelay={200}> */}
                <div className="about-wrapper" ref={this.aboutWrapper}>
                    <p>{this.props.bio}</p>
                </div>
                {/* </Stagger> */}
            </div>
        );
    }
}

export default About;