import NetworkVis from './network-vis';
import * as d3 from "d3";
import geometry from "../algo/geometry.js";
import {transform, path} from "../util/svg-strings.js";
import {sortBy, map} from "lodash";
import './matrix.scss';
import React from "react";
import Select from '../widgets/select.js';


class Matrix extends NetworkVis {

    constructor(props) {
        super(props);
        // this.state = {
        //     data: this.props.data,
        //     loading: false
        // };
        // this.svg = React.createRef();
    }

    layout() {

        const {layoutMethod, sortByAttribute,
            x0, y0,
            padding, cellSize} = this.props;
        const g = this.graph;

        let sortedNodes = g.nodes;

        if (layoutMethod === 'sort_by_attribute') {
            sortedNodes = sortBy(g.nodes, n=>n[sortByAttribute])
        }

        let [x, y] = [x0, y0];

        for (let node of sortedNodes) {
            node.coords = {
                x: x,
                y: y
            };
            x += padding + cellSize;
            y += padding + cellSize;
        }

        return sortedNodes;

    }

    controls() {

        return <Select title={'Sort by'} defaultValue={'cluster'} options={['cluster', 'commits', 'files']}/>;
    }

    highlight(data) {

        let {rows, cols} = data;
        const svg = d3.select(this.svg.current);

        console.info(data);

        svg.selectAll('.col-label')
            .each(function(n) {
                d3.select(this).classed('highlight', cols.has(n.id));
            });

        svg.selectAll('.row-label')
            .each(function(n) {
                d3.select(this).classed('highlight', rows.has(n.id));
            });


    }

    paint() {

        super.paint();
        const self = this;

        const {data} = this.props; if (data===undefined) return;

        const {cellSize, padding, x0, y0, labelPadding} = this.props;

        const sortedNodes = this.layout();
        const svg = d3.select(this.svg.current);

        const g = this.graph;

        const links = svg.append('g')
            .attr('class', 'links');

        links.selectAll('.link')
            .data(g.links)
            .enter().append('g')
            .attr('class', 'link')
            .each(function(l) {
                const source = g.node(l.source);
                const target = g.node(l.target);

                d3.select(this).append('rect')
                    .attr('width', cellSize).attr('height', cellSize)
                    .attr('x', source.coords.x).attr('y', target.coords.y);

                d3.select(this).append('rect')
                    .attr('width', cellSize).attr('height', cellSize)
                    .attr('x', target.coords.x).attr('y', source.coords.y);

            })
            .style('fill-opacity', l=>l.weight/10.0);

        const col_labels = svg.append('g')
            .attr('class', 'col-labels');

        col_labels.selectAll('col-label')
            .data(sortedNodes)
            .enter().append('g')
            .attr('class', 'col-label')
            .attr('transform', n=>{return transform.begin().translate(n.coords.x + cellSize, y0 - labelPadding).rotate(-60, 0, 0).end()})
            .append('text')
            .text(n=>n.id);

        const row_labels = svg.append('g')
            .attr('class', 'row-labels');

        row_labels.selectAll('row-label')
            .data(sortedNodes)
            .enter().append('g')
            .attr('class', 'row-label')
            .attr('transform', n=>{return transform.begin().translate(x0 - labelPadding, n.coords.y + cellSize).end()})
            .attr('text-anchor', 'end')
            .append('text')
            .text(n=>n.id);

        svg.attr('width', 1000).attr('height', 1000)
            .style('width', '1000px').style('height', '1000px');


        let brush = d3.brush();

        brush.extent([[x0 - padding, y0 - padding], [x0 + sortedNodes.length * (cellSize + padding), y0 + sortedNodes.length * (cellSize + padding)]]);

        brush.on('brush', function() {
            let [[x0, y0], [x1, y1]] = d3.event.selection;
            let [rows, cols] = [[], []];
            for (let node of sortedNodes){
                if (node.coords.x > x0 && node.coords.x + cellSize < x1) {
                    cols.push(node);
                }
                if (node.coords.y > y0 && node.coords.y + cellSize < y1) {
                    rows.push(node);
                }
            }

            self.highlight({'rows': new Set(map(rows, 'id')), 'cols': new Set(map(cols, 'id'))});

        });

        svg.append("g")
            .attr("class", "brush")
            .call(brush);


        //resize svg


    }
}


Matrix.defaultProps = {
    title: 'Matrix',
    className: 'matrix network-vis plot',
    width: 880,
    height: 880,
    x0: 100,
    y0: 100,
    padding: 1.5,
    labelPadding: 4,
    cellSize: 6,
    layoutMethod: 'sort_by_attribute', //or "sort_by_attribute"
    sortByAttribute: 'order', //sort by attribute. default order
    allAttributes: ['order', 'id'],
    ascending: false
};

export default Matrix;