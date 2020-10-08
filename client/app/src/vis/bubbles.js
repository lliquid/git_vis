import React from "react";
import Plot from './plot.js';
import * as d3 from "d3";
import {min, max, map} from "lodash";
import {transform} from "../util/svg-strings.js";

import './bubbles.scss';

import {colorNull} from "./colors.js";

//this class is currently tailored for date distributions
class Bubbles extends Plot {

    constructor(props) {
        super(props);
        const {data} = this.props;

    }

    info() {
        // return <h4>This is an info box</h4>
    }

    paint() {

        super.paint();

        const {width, height, padding} = this.props;
        const {data} = this.state;

        let [w, h] = [width - padding.right - padding.left, height - padding.top - padding.bottom];
        let packable_data = {
            name: "root",
            children: data
        };// data = [{name: xx, value: 10}, {name: xx, value: 10}]

        let root = d3.pack()
            .size([w, h]).padding(1)(d3.hierarchy(packable_data).sum(d=>d.value));

        //plot aggregated data
        const svg = d3.select(this.svg.current);


        const circles = svg.append('g')
            .attr('class', 'circles')
            .attr('transform', transform.begin().translate(padding.right, padding.top).end())
            .selectAll('.circle')
            .data(root.descendants().slice(1))
            .enter()
            .append('g')
            .attr('class', 'circle')
            .attr('transform', d=>transform.begin().translate(d.x, d.y).end());

        circles.append('circle')
            .style("fill", colorNull)
            .attr('r', d=>d.r);

        circles.filter(d=>d.r > 20).append('text')
            .attr('class', 'label')
            .attr('text-anchor', 'middle')
            .text(d=>d.data.name);
    }

}

export default Bubbles;

Bubbles.defaultProps = {
    title: 'Bubbles',
    className: 'bubbles plot',
    width: 200,
    height: 200,
    visible: true,
    padding: {
        left: 5, right: 5, bottom: 5, top: 5
    }
};
