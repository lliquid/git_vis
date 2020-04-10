import {keys} from 'lodash';


class geometry {

    static polar2Cartians(center, radius, theta) {
        /*
        angle must be specified in radians (Math.PI)
         */
        return {
            x: center[0] + radius * Math.cos(theta),
            y: center[1] + radius * Math.sin(theta)
        };
    }

    static interpolate(coord0, coord1, theta) {
        /*
        return interpolated position between coord0 and coord1, theta \in [0, 1]
         */
        return {
            x: coord0.x + theta * (coord1.x - coord0.x),
            y: coord0.y + theta * (coord1.y - coord0.y)
        }
    }

}

export default geometry;

