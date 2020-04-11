import NetworkVis from './network-vis';
import * as d3 from "d3";
import geometry from "../algo/geometry.js";
import {transform, path} from "../util/svg-strings.js";


import './arcdiagram.scss';

class ArcDiagram extends NetworkVis {

    circularLayout() {

        const {center, r_inner} = this.props;

        const g = this.graph;
        const step = Math.PI * 2 / g.num_nodes;

        for (let node of g.nodes) {
            node.polar_coords = {
                center: center,
                r: r_inner,
                theta: node.order * step
            };

            node.coords =
                geometry.polar2Cartians(
                    node.polar_coords.center,
                    node.polar_coords.r,
                    node.polar_coords.theta
                );
        }

    }

    paint() {

        super.paint();
        const {data} = this.props; if (data===undefined) return;

        const {center} = this.props;

        this.circularLayout();
        // const layout = this.layout({method: 'precomputed', dimension: 1});
        const svg = d3.select(this.svg.current);

        //draw arc diagram to show the collaborative relations
        const g = this.graph;

        const nodes = svg.append('g')
            .attr('class', 'nodes')
            .selectAll('.node')
            .data(g.nodes)
            .enter().append('g')
            .attr('transform', n=> transform.begin().translate(n.coords.x, n.coords.y).end())
            .attr('class', 'node');

        nodes.append('circle')
            .attr('r', n=> 2 * n.weight);

        nodes.append('text')
            .text(n=>n.id)
            .attr('text-anchor', n => {
                const theta = n.polar_coords.theta / Math.PI * 180;
                return theta > 90.0 && theta < 270.0 ? 'end' : 'start';
            })
            .attr('transform', n => {
                    let theta = n.polar_coords.theta / Math.PI * 180;
                    let [translateX, translateY] = [6, 6];
                    if (theta > 90.0 && theta < 270.0 ) {
                        theta += 180;
                        translateX = -translateX;
                    }
                    return transform
                        .begin()
                        .rotate(theta, 0, 0)
                        .translate(translateX, translateY)
                        .end()
                }
            );

        const links = svg.append('g')
            .attr('class', 'links');


        links.selectAll('.link')
            .data(g.links)
            .enter().append('g')
            .attr('class', 'link')
            .append('path')
            .attr('d', l=>{
                const source_node = g.node(l.source);
                const target_node = g.node(l.target);
                const c = {x: center[0], y: center[1]};
                const c0 = geometry.interpolate(source_node.coords, c,
                    Math.abs(source_node.order - target_node.order) * 2.0 / g.num_nodes);
                const c1 = geometry.interpolate(target_node.coords, c,
                    Math.abs(source_node.order - target_node.order) * 2.0 / g.num_nodes);

                return path.begin()
                    .move_to(source_node.coords.x, source_node.coords.y)
                    .bezier_to(
                        c0.x, c0.y,
                        c1.x, c1.y,
                        target_node.coords.x, target_node.coords.y)
                    .end();
            })
            .style("stroke-width", l=>l.weight)
            .style("stroke-opacity", l=>l.weight/6);

    }

}


ArcDiagram.defaultProps = {
    title: 'Plot',
    className: 'arc-diagram network-vis plot',
    width: 800,
    height: 800,
    center: [400, 400], // if undefined, use [width/2, height/2]
    r_inner: 300, //
    r_outer: 360, // space between inner radius and outer radius can be used to encode auxiliary information of nodes
};

export default ArcDiagram;