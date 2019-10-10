import React from 'react';

import './container.css';

class Container extends React.Component {

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
        return <div className="container" >
            <div className="title"> {this.props.title} </div>
            <svg className="canvas"
                 width={this.props.width}
                 height={this.props.height}
                 ref={this.svg}
            />
        </div>;
    }

}

Container.defaultProps = {
    title: 'title',
    width: 600,
    height: 600
};

export default Container;