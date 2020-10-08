import NodeLinkGraph from './node-link-graph.js';
import * as d3 from "d3";
import {transform, path} from "../util/svg-strings.js";

import './bipartite-node-link-graph.scss';
import {sortBy} from "lodash";


class BipartiteNodeLinkGraph extends NodeLinkGraph {


    paint() {
        super.paint();
    }
}

BipartiteNodeLinkGraph.defaultProps = {
    title: 'NodeLinkGraph',
    className: 'bipartite-node-link-graph node-link-graph network-vis plot',
    width: 880,
    height: 880,
    x0: 100,
    y0: 100,
    nodeSize: 3,
    linkStyle: 'straight',
};

export default BipartiteNodeLinkGraph;

