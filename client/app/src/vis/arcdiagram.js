import NetworkVis from './network-vis';
import * as d3 from "d3";
import './arcdiagram.scss';

class ArcDiagram extends NetworkVis {

    paint() {
        super.paint();
        const {data} = this.props; if (data===undefined) return;

        const graph = this.graph;
        const layout = this.layout({method: 'spectral', dimension: 1});

        const svg = d3.select(this.svg.current);

        //draw arc diagram to show the collaborative relations




    }

}


ArcDiagram.defaultProps = {
    title: 'Plot',
    className: 'arc-diagram network-vis plot',
    width: 600,
    height: 600,
    r_inner: 200,
    r_outer: 220,
};

export default ArcDiagram;