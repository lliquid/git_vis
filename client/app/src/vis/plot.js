import React from 'react';

import './plot.scss';
import * as d3 from "d3";

import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

class Plot extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: this.props.data,
            updating: false,
        };
        this.svg = React.createRef();
    }

    componentDidMount() {
        this.paint();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.paint();
    }

    setLoadingStatus(loading) {
        this.setState({updating: loading});
    }

    setData(data) {
        this.setState({data: data});
    }

    paint() {
        d3.select(this.svg.current).selectAll('*').remove();
        //default do nothing, override for individual views
    }

    controls() {
        return <div/>
    }

    info() {
        return <div/>
    }

    title() {
        return <div/>
    }

    content() {
        return <div/>
    }

    zoomControls() {
        return <div/>
    }

    render() {

        const {className, display, visible} = this.props;
        const {width, maxWidth, height} = this.props;

        const classCss = className + ' ' + display;

        return <div className={classCss} style={{width: width, height: height, maxWidth:maxWidth, display: visible? 'inline-block':'none', opacity:visible? 1.0: 0}}>
            {<div className="title"> {this.title()} </div>}
            {<div className="zoom-controls"> {this.zoomControls()} </div>}

            {this.state.updating ? <Spin className={"spinner"} style={{marginTop: (height/2 - 17) + 'px'}}
                                         indicator={<LoadingOutlined style={{ fontSize: 34 }} spin />} /> :
                <>
            <div className="controls"> {this.controls()} </div>
            <div className="info"> {this.info()} </div>
                    <div className="content"> {this.content()} </div>
                    <svg className="svg-container" ref={this.svg} width={width} height={height}/>
                    </> }

        </div>;
    }

}

Plot.defaultProps = {
    title: 'Plot',
    className: 'plot',
    about: 'Plot',
    display: 'standalone', // or embeded
    visible: true,
    width: 600,
    height: 600,
    tooltip: undefined
};

export default Plot;