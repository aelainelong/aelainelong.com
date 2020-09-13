import React from 'react';
import Slide from 'react-reveal/Slide';
import './About.css';

const About = props => {
    return(
        <div className="About">
            <Slide top when={props.show} collapse>
                <div className="about-wrapper">
                    <div className="about-inner">
                        <p>{props.bio}</p>
                    </div>
                </div>
            </Slide>
        </div>
    );
}

export default About;