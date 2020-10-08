import React from 'react';
import {keys, map} from 'lodash';

import 'antd/dist/antd.css';
import './widget.scss';
import './tooltip.scss';


class ToolTip extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            coords: {
                x: 0,
                y: 0
            },
            data: {},
            name: 'tooltip'
        }
    }

    render() {
        return <div className={this.props.className}
                    style={{
                        visibility: this.state.visible ? 'visible' : 'hidden',
                        top: this.state.coords.y,
                        left: this.state.coords.x
                    }} >
            <p className={"tooltip-title"}>{this.state.name}</p>
            <>
            {map(keys(this.state.data), k=><p> <strong>{k}</strong>: {this.state.data[k]}</p>)}
            </>
        </div>;
    }

    hide() {
        this.setState({
            visible: false
        })
    }

    show(x, y, data, name) {
        this.setState({
            visible:true,
            coords: {
                x: x,
                y: y
            },
            data: data,
            name: name
        })
    }

    setPosition(x, y) {
        this.setState({
            coords :{
                x: x,
                y: y
            }
        })
    }

}

ToolTip.defaultProps = {
    title: 'tooltip',
    className: 'tooltip'
};

export default ToolTip;