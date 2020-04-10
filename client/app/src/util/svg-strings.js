class transform {

    static value = '';

    static begin() {
        this.value = '';
        return this;
    }

    static end() {
        return this.value;
    }

    static translate(dx, dy) {
        this.value += 'translate(' + dx + ',' + dy + ')';
        return this;
    }

    static rotate(theta, x0, y0) {
        this.value += 'rotate(' + theta + ',' + x0 + ',' + y0 + ')';
        return this;
    }

    static scale(fx, fy) {
        this.value += 'scale(' + fx + ',' + fy + ')';
        return this;
    }

}

class path {

    static value = '';
    static x = 0;
    static y = 0;
    static s = 0.5; //for curve easing

    static begin() {
        this.value = '';
        return this;
    }

    static move_to(arg0, arg1) {

        if (arguments.length === 1) {
            this.value += ' M ' + arg0.x + ' ' + arg0.y;
            this.x = arg0.x;
            this.y = arg0.y;
        }
        else {
            this.value += ' M ' + arg0 + ' ' + arg1;
            this.x = arg0;
            this.y = arg1;
        }
        return this;
    }

    static line_to(arg0, arg1) {

        if (arguments.length === 1) {
            this.value += ' L ' + arg0.x + ' ' + arg0.y;
            this.x = arg0.x;
            this.y = arg0.y;
        }
        else {
            this.value += ' L ' + arg0 + ' ' + arg1;
            this.x = arg0;
            this.y = arg1;
        }

        return this;
    }

    static eased_line_to(x, y) {
        let c0x = this.x,
            c0y = this.y,
            c1x = x,
            c1y = y;
        if ((x-this.x) * (y-this.y) > 0) {
            c0y = this.y * (1 - this.s) + y * this.s;
            c1x = this.x * this.s + x * (1 - this.s);
        }
        else {
            c0x = this.x * (1 - this.s) + x * this.s;
            c1y = this.y * this.s + y * (1 - this.s);
        }
        this.bezier_to(c0x, c0y, c1x, c1y, x, y);
        return this;
    }

    static h_eased_line_to(x, y) {
        this.bezier_to(this.x * (1-this.s) + x * this.s, this.y, this.x * this.s + x * (1-this.s) , y, x, y);
        return this;
    }

    static v_eased_line_to(x, y) {
        this.bezier_to(this.x, this.y * (1-this.s) + y * this.s, x, this.y * this.s + y * (1-this.s), x, y);
        return this;
    }

    static horizontal_to(x) {
        this.x = x;
        return this.line_to(x, this.y);
    }

    static vertical_to(y) {
        this.y = y;
        return this.line_to(this.x, y);
    }

    static horizontal_to_relative(x) {
        this.value += ' h ' + x;
        this.x = this.x + x;
        return this;
    }

    static vertical_to_relative(y) {
        this.value += ' v ' + y;
        this.y = this.y + y;
        return this;
    }

    static bezier_to(cx0, cy0, cx1, cy1, x1, y1) {
        this.x = x1;
        this.y = y1;
        this.value += ' C ' + cx0  + ',' + cy0 + ' ' + cx1 + ', ' + cy1 + ' ' + x1 + ', ' + y1;
        return this;
    }

    static close_path() {
        this.value += ' Z ';
        return this;
    }

    static end() {
        return this.value;
    }

}


export {transform, path};