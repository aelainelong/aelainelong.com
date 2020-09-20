import React from 'react';
import Fade from 'react-reveal/Fade';
import './ToolTip.css';

const ToolTip = props => {
    return (
        <div className="ToolTip">
            <Fade opposite when={props.showTooltip}>
                <i className="fas fa-dice-d20"></i><p>Rotate the polyhedron to view different projects</p>
            </Fade>
        </div>
    );
}

export default ToolTip;