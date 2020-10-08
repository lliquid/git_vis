import React from "react";
import Plot from './plot.js';

import './number.scss';

class Number extends Plot {

    constructor(props) {
        super(props);
    }

    info() {
        return <div>
            <span style={{paddingRight: 20}}>{this.props.icon}</span><span>{this.props.number + ' ' + this.props.title}</span>
        </div>
    }
}

export default Number;

Number.defaultProps = {
    title: '',
    number: '',
    display: 'standalone',
    className: 'number plot',
    width: 200,
    height: 60,
    visible: true,
    maxWidth: 300,
    padding: {
        left: 10, right: 10, bottom: 10, top: 10
    }
};
