import Plot from './plot.js';

class NetworkVis extends Plot {


    layout(options, data) {

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

    }

}

export default NetworkVis;