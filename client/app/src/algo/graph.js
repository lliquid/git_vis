import {max, min, map, keys, values} from 'lodash';
import * as d3 from 'd3';

class Graph {
    /*
    undirected, single link graph
     */

    constructor() {
        this._nodes = {};
        this._links = {};
        this._adjacency_list = {};
    }

    clear() {
        this._nodes = {};
        this._links = {};
        this._adjacency_list = {};
    }

    get nodes() {
        return values(this._nodes);
    }

    get links() {
        return values(this._links);
    }

    get num_nodes() {
        return this.nodes.length;
    }


    add_node(nid, data) {

        if (this.has_node(nid)) {
            console.warn('node ' + nid + ' already in graph');
            return this;
        }

        const n = {...{id: nid + ''}, ...data};

        this._nodes[n.id] = n;
        this._adjacency_list[n.id] = [];

        return this;
    }

    add_link(source, target, data) {

        if (this.has_link(source, target)) {
            console.info('link ' + source + '-' + target + 'already in');
            return this;
        }

        if (!this.has_node(source)) this.add_node(source);
        if (!this.has_node(target)) this.add_node(target);

        const e = {...{
            src: source + '',
            tgt: target + ''
        }, ...data};

        this._links[source + '-' + target] = e;
        this._adjacency_list[source+''][target+''] = e;
    }

    has_node(nid) {
        return this.node(nid) !== undefined;
    }

    has_link(source, target) {
        return this.link(source, target) !== undefined;
    }

    node(nid) {
        return this._nodes[nid+''];
    }

    link(source, target) {

        if (!this.has_node(source)) {return undefined;}
        if (!this.has_node(target)) {return undefined;}

        return this._adjacency_list[source+''][target+''];
    }

    degree(nid) {
        if (!this.has_node(nid)) {return undefined;}
        return this.neighbors(nid).length;
    }

    neighbors(nid) {
        if (!this.has_node(nid)) {return undefined;}
        const n = this.node(nid);
        return keys(this._adjacency_list[n.id]);
    }

    adjacents(nid) {
        if (!this.has_node(nid)) {return undefined;}
        const n = this.node(nid);
        return values(this._adjacency_list[n.id]);
    }

    layout(method, width, height) {
        if (method === 'precomputed') { //use precomputed layout
            let xs = map(this.nodes, n=>n.precomputed_layout.x);
            let ys = map(this.nodes, n=>n.precomputed_layout.y);
            let [xmin, xmax, ymin, ymax] = [min(xs), max(xs), min(ys), max(ys)];
            let xscale = d3.scaleLinear().domain([xmin, xmax]).range([0, width]);
            let yscale = d3.scaleLinear().domain([ymin, ymax]).range([0, height]);
            for (let n of this.nodes) {
                n.coords = {
                    x: xscale(n.precomputed_layout.x),
                    y: yscale(n.precomputed_layout.y)
                }
            }
        }
    }

    //IO functions
    load_nx_json(json) {
        /* load json format exported from networkx lib in python*/

        const nodes = json.nodes,
            links = json.links;

        let i = -1;
        while(++i < nodes.length) {
            this.add_node(nodes[i].id, nodes[i])
        }

        i = -1;
        while(++i < links.length) {
            this.add_link(links[i].source, links[i].target, links[i]);

        }

    }

}

export default Graph;