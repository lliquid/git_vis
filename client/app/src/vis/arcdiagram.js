import NetworkVis from './network-vis';
import * as d3 from "d3";
import geometry from "../algo/geometry.js";
import {transform, path} from "../util/svg-strings.js";
import {sortBy} from "lodash";


import './arcdiagram.scss';
import React from "react";

import {
    TeamOutlined,
    InfoOutlined
} from "@ant-design/icons";
import {Button, Tooltip} from "antd";

class ArcDiagram extends NetworkVis {

    constructor(props) {
        super(props);
    }

    title() {
        return <h3> <TeamOutlined size={"24px"}/> {this.props.title} </h3>
    }

    info() {

        return <div>
            <Tooltip color={"#888"} placement="top" title={"About"}>
                <Button shape="circle" size={"small"} icon={<InfoOutlined />}/>
            </Tooltip>
        </div>
    }

    // circularLayout() {
    //
    //     const {center, r_inner} = this.props;
    //
    //     const g = this.graph;
    //
    //     const gap = Math.PI / g.num_nodes;
    //
    //     let node_weight_sum = 0;
    //     for (let node of g.nodes) {
    //         node_weight_sum += Math.log(node.weight) + 1.0;
    //     }
    //
    //     const scale = Math.PI / node_weight_sum;
    //     let theta = 0;
    //
    //     let sortedNodes = sortBy(g.nodes, n=>n.order);
    //
    //     for (let node of sortedNodes) {
    //
    //         node.polar_coords = {
    //             center: center,
    //             r: r_inner,
    //             theta: theta + (Math.log(node.weight) + 1.0) * scale / 2
    //         };
    //
    //         theta += gap + (Math.log(node.weight) + 1.0) * scale;
    //
    //         node.coords =
    //             geometry.polar2Cartians(
    //                 node.polar_coords.center,
    //                 node.polar_coords.r,
    //                 node.polar_coords.theta
    //             );
    //     }
    //
    // }

    paint() {

        super.paint();

        const graph = this.state.data;
        if (graph === undefined || graph.nodes.length === 0) { return; }
        const {width, height, layout, padding, tooltip} = this.props;
        let [innerWidth, innerHeight] = [width - padding.left - padding.right,
            height - padding.top - padding.bottom];

        graph.layout(layout, innerWidth, innerHeight);


        // const {center} = this.props;
        //
        // this.circularLayout();
        // // const layout = this.layout({method: 'precomputed', dimension: 1});
        // const svg = d3.select(this.svg.current);
        //
        // //draw arc diagram to show the collaborative relations
        // const g = this.graph;
        //
        // const nodes = svg.append('g')
        //     .attr('class', 'nodes')
        //     .selectAll('.node')
        //     .data(g.nodes)
        //     .enter().append('g')
        //     .attr('transform', n=> transform.begin().translate(n.coords.x, n.coords.y).end())
        //     .attr('class', 'node');
        //
        // nodes.append('circle')
        //     .attr('r', n=> n.weight);
        //
        // nodes.append('text')
        //     .text(n=>n.id)
        //     .attr('text-anchor', n => {
        //         const theta = n.polar_coords.theta / Math.PI * 180;
        //         return theta > 90.0 && theta < 270.0 ? 'end' : 'start';
        //     })
        //     .attr('transform', n => {
        //             let theta = n.polar_coords.theta / Math.PI * 180;
        //             let [translateX, translateY] = [6, 6];
        //             if (theta > 90.0 && theta < 270.0 ) {
        //                 theta += 180;
        //                 translateX = -translateX;
        //             }
        //             return transform
        //                 .begin()
        //                 .rotate(theta, 0, 0)
        //                 .translate(translateX, translateY)
        //                 .end()
        //         }
        //     );
        //
        // const links = svg.append('g')
        //     .attr('class', 'links');
        //
        // links.selectAll('.link')
        //     .data(g.links)
        //     .enter().append('g')
        //     .attr('class', 'link')
        //     .append('path')
        //     .attr('d', l=>{
        //
        //         const source_node = g.node(l.source);
        //         const target_node = g.node(l.target);
        //         const c = {x: center[0], y: center[1]};
        //         let theta_diff = Math.abs(source_node.polar_coords.theta - target_node.polar_coords.theta);
        //         theta_diff = Math.min(theta_diff, Math.PI * 2 - theta_diff);
        //         const c0 = geometry.interpolate(source_node.coords, c, theta_diff / Math.PI);
        //         const c1 = geometry.interpolate(target_node.coords, c, theta_diff / Math.PI);
        //
        //         return path.begin()
        //             .move_to(source_node.coords.x, source_node.coords.y)
        //             .bezier_to(
        //                 c0.x, c0.y,
        //                 c1.x, c1.y,
        //                 target_node.coords.x, target_node.coords.y)
        //             .end();
        //     })
        //     .style("stroke-width", l=>l.weight)
        //     .style("stroke-opacity", l=>l.weight/6);

    }

}


ArcDiagram.defaultProps = {
    title: 'Collaboration Network',
    className: 'arc-diagram network-vis plot',
    width: 1000,
    height: 1000,
    padding: {
        left: 150, right: 150, bottom: 60, top: 90
    },

};

export default ArcDiagram;