import Plot from './plot.js';
import Graph from '../algo/graph.js';

class NetworkVis extends Plot {

    constructor(props) {
        super(props);
        this.graph = Graph();
    }


    layout(options) {

        const {method, dimension} = options;

        if (method === 'precomputed') {
            //precomputed layout in node data
            return;
        }

        if (method === 'spectral') {

        }

        if (method === 'tsne') {

        }

    }

    paint() {
        super.paint();
        const {data} = this.props;

        this.graph.clear();
        this.graph.load_nx_json(data);


    }

}

export default NetworkVis;