import React from 'react';

import './plot.scss';

class Plot extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: this.props.data,
            loading: false
        };
        this.svg = React.createRef();
    }

    componentDidMount() {
        this.paint();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.paint();
    }

    paint() {
        //default do nothing, override for individual views
    }

    render() {

        const {className} = this.props;

        return <div className={className}>
            <div className="title"> {this.props.title} </div>
            <svg className="canvas"
                 width={this.props.width}
                 height={this.props.height}
                 ref={this.svg}
            />
        </div>;
    }

}

Plot.defaultProps = {
    title: 'Plot',
    className: 'plot',
    width: 600,
    height: 600
};

export default Plot;