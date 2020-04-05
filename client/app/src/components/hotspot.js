import TreeMap from "../vis/treemap.js";
import React from "react";

class HotSpot extends React.Component {

    constructor(props) {
        super(props);
        this.state = {data: {}, loading: false};
    }


    //filter by file type

    //filter by author

    //filter commit range by specifying two commits (start and end)

    //filter commit range by specifying a time interval


    render() {

        return <div>
                <TreeMap data={this.state.data} loading={this.state.loading}/>;
            </div>
    }

}


class Controls extends React.Component {

    //controls to select file type, authors, and so on

}

export default HotSpot;