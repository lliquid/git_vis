import NetworkVis from './network-vis.js';
import * as d3 from "d3";
import {transform, path} from "../util/svg-strings.js";

import './node-link-graph.scss';
import {map, sortBy} from "lodash";
import React from "react";

import {
    ShareAltOutlined,
    InfoOutlined,
    ZoomInOutlined,
    UndoOutlined,
} from "@ant-design/icons";
import {Button, Select, Tooltip} from "antd";

import {
    interpolatorColorDiverging21,
    colorNull
} from "./colors.js";


class NodeLinkGraph extends NetworkVis {

    constructor(props) {
        super(props);
        this.scaleXs = [];
        this.scaleYs = [];
    }

    title() {
        return <h3> <ShareAltOutlined size={"24px"}/> {this.props.title} </h3>
    }

    info() {

        return <div>
            <Tooltip color={"#888"} placement="top" title={"About"}>
                <Button shape="circle" size={"small"} icon={<InfoOutlined />}/>
            </Tooltip>

        </div>
    }

    zoomControls() {
        const self = this;
        return <>
            {/*<Tooltip placement="top" title="Zoom In" >*/}
            {/*        <Button onClick={()=>{*/}
            {/*            self.zoomable = true*/}
            {/*        }} disabled={self.zoomable} shape="circle" icon={<ZoomInOutlined />} />*/}
            {/*    </Tooltip>*/}
            {/*    &nbsp;&nbsp;*/}
                <Tooltip placement="top" title="Reset">
                    <Button onClick={()=>{
                        this.scaleXs = [];
                        this.scaleYs = [];
                        this.zoom([], [])
                    }} shape="circle" icon={<UndoOutlined />} />
                </Tooltip>
        </>
    }

    zoom(scaleXs, scaleYs) {

        const graph = this.state.data;
        if (graph === undefined || graph.nodes.length === 0) { return; }
        const svg = d3.select(this.svg.current);
        const {zoomAnimationTransition} = this.props;

        let scaleX = (x) => {
            for (let s of scaleXs) {
                x = s(x)
            }
            return x;
        };

        let scaleY = (y) => {
            for (let s of scaleYs) {
                y = s(y)
            }
            return y
        }

        svg.selectAll('.link path')
            .each(function(l) {
                let source = graph.node(l.source);
                let target = graph.node(l.target);

                d3.select(this)
                    .transition().ease(d3.easeCubicInOut).duration(zoomAnimationTransition)
                    .attr('d', path.begin()
                        .move_to(scaleX(source.coords.x), scaleY(source.coords.y))
                        .arc_to(scaleX(target.coords.x), scaleY(target.coords.y))
                        .end()
                    )
            });

        svg.selectAll('.node')
            .transition().ease(d3.easeCubicInOut).duration(zoomAnimationTransition)
            .attr('transform', n=>transform.begin()
                .translate(scaleX(n.coords.x), scaleY(n.coords.y)).end());

        svg.selectAll('.node_label')
            .transition().ease(d3.easeCubicInOut).duration(zoomAnimationTransition)
            .attr('transform', n=>transform.begin()
                .translate(scaleX(n.coords.x), scaleY(n.coords.y)).end());

        if (scaleX(1) - scaleX(0) > 1) {
            svg.selectAll('.node_label');

        }


    }

    paint() {

        super.paint();

        const graph = this.state.data;
        const self = this;
        if (graph === undefined || graph.nodes.length === 0) { return; }
        const {width, height, layout, padding, tooltip} = this.props;
        const zoomable = this.zoomable;
        let [innerWidth, innerHeight] = [width - padding.left - padding.right,
            height - padding.top - padding.bottom];
        graph.layout(layout, innerWidth, innerHeight);

        const {nodeColor} = this.props;

        const svg = d3.select(this.svg.current)
            .append('g').attr('transform',
                transform.begin().translate(padding.left, padding.top).end());

        console.info(graph)

        const links = svg.append('g')
            .attr('class', 'links');

        links.selectAll('.link')
            .data(graph.links)
            .enter()
            .append('g')
            .attr('class', 'link')
            .append('path')
            .each(function(l) {
                let source = graph.node(l.source);
                let target = graph.node(l.target);

                d3.select(this)
                    .attr('d', path.begin()
                        .move_to(source.coords.x, source.coords.y)
                        .arc_to(target.coords.x, target.coords.y)
                        .end()
                    )
            });

        const nodes = svg.append('g')
            .attr('class', 'nodes')
            .selectAll('.node')
            .data(sortBy(graph.nodes, n=>n.type === 'author_name'? 1 : 0))
            .enter().append('g')
            .attr('class', n=> 'node' + ' ' + n.type)
            .attr('transform', n=>transform.begin().translate(n.coords.x, n.coords.y).end());

        nodes.append('circle')
            .attr('r',  n=> n.type === 'author_name' ? 18: 10)
            .style('fill', nodeColor)
            .style('fill-opacity', 0.5)
            .style('stroke', 'none');


        nodes.append('circle')
            .attr('r',  n=> n.type === 'author_name' ? 12: 6)
            .style('fill', nodeColor)
            .style('stroke', 'none');


        const node_labels = svg.append('g')
            .attr('class', 'node_labels')
            .selectAll('.node_label')
            .data(sortBy(graph.nodes, n=>n.type === 'author_name'? 1 : 0))
            .enter().append('g')
            .attr('class', n=> 'node_label' + ' ' + n.type)
            .attr('transform', n=>transform.begin().translate(n.coords.x, n.coords.y).end());


        node_labels.append('rect')
            .attr('x', -5).attr('y', -15).attr('width', 150).attr('height', 20);


        node_labels.append('text')
            .text(n=>n.id);



      const brush = d3.brush()
          .on("end", function() {
              if (d3.event === undefined || d3.event.selection === undefined || d3.event.selection === null) {return}
              if (!d3.event.sourceEvent) return;

              let [[x0, y0], [x1, y1]] = d3.event.selection;
              let scaleX = d3.scaleLinear().domain([x0, x1]).range([0, innerWidth]);
              let scaleY = d3.scaleLinear().domain([y0, y1]).range([0, innerHeight]);

              self.scaleXs.push(scaleX);
              self.scaleYs.push(scaleY);

              self.zoom(self.scaleXs, self.scaleYs);
              d3.select(this).call(brush.move, null);

          })

      svg.append('g').attr('class', 'brush').call(brush);

    }
}

NodeLinkGraph.defaultProps = {
    title: 'NodeLinkGraph',
    className: 'node-link-graph network-vis plot',
    width: 800,
    height: 800,
    padding: {
        left: 150, right: 150, bottom: 60, top: 90
    },
    nodeSize: 3,
    zoomAnimationTransition: 1500,
    nodeColor: (n)=>{return n.type==='author_name'? '#f4a261': '#a8dadc'},
    linkStyle: 'straight',
    tooltip: undefined,
    layout: 'precomputed' //use precomputed layout
};


export default NodeLinkGraph;

