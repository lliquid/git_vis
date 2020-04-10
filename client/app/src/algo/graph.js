import {keys, values} from 'lodash';

class Graph {
    /*
    undirected, single link graph
     */

    constructor() {
        this.nodes = {};
        this.links = {};
        this.adjacency_list = {};
    }

    clear() {
        this.nodes = {};
        this.links = {};
        this.adjacency_list = {};
    }

    add_node(nid, data) {

        if (this.has_node(nid)) {
            console.warn('node ' + nid + ' already in graph');
            return this;
        }

        const n = {...{id: nid + ''}, ...data};

        this.nodes[n.id] = n;
        this.adjacency_list[n.id] = [];

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

        this.links[source + '-' + target] = e;
        this.adjacency_list[source+''][target+''] = e;
        this.adjacency_list[target+''][source+''] = e;
    }

    has_node(nid) {
        return this.node(nid) !== undefined;
    }

    has_link(source, target) {
        return this.link(source, target) !== undefined;
    }

    node(nid) {
        return this.nodes[nid+''];
    }

    link(source, target) {
        if (!this.has_node(source)) {return undefined;}
        return this.adjacency_list[source+''][target+''];
    }

    degree(nid) {
        if (!this.has_node(nid)) {return undefined;}
        return this.neighbors(nid).length;
    }

    neighbors(nid) {
        if (!this.has_node(nid)) {return undefined;}
        const n = this.node(nid);
        return keys(this.adjacency_list[n.id]);
    }

    adjacents(nid) {
        if (!this.has_node(nid)) {return undefined;}
        const n = this.node(nid);
        return values(this.adjacency_list[n.id]);
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
            this.add_link(links[i].source, links[i].target, links[i])
        }

    }

}

export default Graph;