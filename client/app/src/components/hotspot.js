import TreeMap from "../vis/treemap.js";
import React from "react";

class HotSpot extends React.Component {

    constructor(props) {
        super(props);
        this.state = {data: {}};
    }


    //filter by file type

    //filter by author

    //filter commit range by specifying two commits (start and end)

    //filter commit range by specifying a time interval

    render() {

        return <TreeMap data={this.state.data}/>;
    }

}