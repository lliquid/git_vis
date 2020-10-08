import Plot from './plot.js';
import * as d3 from "d3";
import {min, max, map} from "lodash";
import {transform} from "../util/svg-strings.js";

import {colorNull, colorDataSelection} from "./colors.js";

import './histogram.scss';

//this class is currently tailored for date distributions
class Histogram extends Plot {

    constructor(props) {
        super(props);
        const {data} = this.props;

        this.state = {
            data: data,
            fullRange: {
                startDate: data[0].date,
                endDate: data[data.length-1].date
            },
            range: {
                startDate: data[0].date,
                endDate: data[data.length-1].date
            }
        }
    }

    setData(data) {

        for (let d of data) {
            d.date = Date.parse(d.date);
        }

        this.setState({
            data: data,
            fullRange: {
                startDate: data[0].date,
                endDate: data[data.length-1].date
            },
            range: {
                startDate: data[0].date,
                endDate: data[data.length-1].date
            }
        })
    }

    setDateRange(startDate, endDate) {
        this.setState({
            range: {
                startDate: startDate,
                endDate: endDate
            }
        })
    }

    paint() {

        super.paint();

        const self = this;
        const {startDateFullRange, endDateFullRange} = this.state.fullRange;
        const {width, height, binSizes, minBinWidth, padding, nticks} = this.props;

        const {onSelectionChange} = this.props;

        const {data} = this.state;

        const [w, h] = [width - padding.left - padding.right,
            height - padding.top - padding.bottom];
        let {startDate, endDate} = this.state.range;

        let scale = d3.scaleTime()
            .domain([startDate, endDate])
            .range([0, w]);

        //choose a proper bin size
        let [binSize, interval] = [binSizes[0].milliseconds, binSizes[0].interval];
        for (let d of binSizes) {
             if (scale(startDate + d.milliseconds) - scale(startDate) > minBinWidth) {
                 binSize = d.milliseconds;
                 interval = d.interval;
                 break
             }
        }

        //adjust x scale
        [startDate, endDate] = [
            (new Date(interval.floor(startDate) - binSize)).getTime(),
            (new Date(interval.ceil(endDate) + binSize*2)).getTime()];
        scale = d3.scaleTime()
            .domain([startDate, endDate])
            .range([0, w]);

        //aggregate data by bin size
        let dataBinned = [];
        let nextDate = startDate;
        for (let d of data) {
            if (d.date >= nextDate && d.date < nextDate + binSize) {
                dataBinned.push({
                    date: nextDate,
                    value: d.value
                })
                nextDate += binSize;
            }
            else if (d.date < nextDate) {
                dataBinned[dataBinned.length-1].value += d.value;
            }
            else {
                nextDate =
                    Math.floor((d.date - startDate) / binSize) * binSize + startDate;
                dataBinned.push({
                    date: nextDate,
                    value: d.value
                })
                nextDate += binSize;
            }
        }

        //plot aggregated data
        const svg = d3.select(this.svg.current);
        const bars = svg.append('g')
            .attr('class', 'bars')
            .attr('transform', transform
                .begin().translate(padding.left, padding.top).end());

        const scaleValue = d3.scaleLinear()
            .domain([0, max(map(dataBinned, d=>d.value))])
            .range([0, h])

        bars.selectAll('.bar')
            .data(dataBinned)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => scale(d.date))
            .attr('y', d => h - scaleValue(d.value))
            .attr('width', d => scale(d.date+binSize)-scale(d.date))
            .attr('height', d => scaleValue(d.value))
            .style('fill', colorNull);

        //draw axis
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', transform.begin().translate(padding.left, h + padding.top).end())
            .call(d3.axisBottom().scale(scale).ticks(nticks));


        //
        let range = svg.append('text')
            .attr('transform', transform.begin()
                .translate(width-padding.left, padding.top-10).end())
            .attr('text-anchor', 'end');

        //brush select time range, automatically snap to grid
        let brush = d3.brushX()
            .extent([[0, 0], [w, h]])
            .on("end", brushend);

        function brushend() {

            const selection = d3.event.selection;
            if (!d3.event.sourceEvent || !selection) return;
            const [x0, x1] = selection.map(d => interval.round(scale.invert(d)));

            d3.select(this)
                .transition()
                .call(brush.move, x1 > x0 ? [x0, x1].map(scale) : null);

            const selected_range = {
                start_date_selected: x1>x0?x0:x1,
                end_date_selected: x1>x0?x1:x0}

            onSelectionChange(selected_range);

            range.text('Selected Range: ' +
                selected_range.start_date_selected.toISOString().slice(0, 10) +
                '  -  ' +
                selected_range.end_date_selected.toISOString().slice(0, 10));
        }

        bars.append("g")
            .attr("class", 'brush')
            .call(brush);

    }

}

export default Histogram;

Histogram.defaultProps = {
    title: 'Histogram',
    className: 'histogram plot',
    width: 200,
    height: 80,
    nticks: 5,
    padding: {
        left: 10, right: 10, bottom: 20, top: 20
    },
    minBinWidth: 6,
    binSizes: [
        {'milliseconds': 24 * 3600 * 1000, 'interval': d3.timeDay},
        {'milliseconds': 2 * 24 * 3600 * 1000, 'interval': d3.timeDay.every(2)},
        {'milliseconds': 7 * 24 * 3600 * 1000, 'interval': d3.timeWeek},
        {'milliseconds': 2 * 7 * 24 * 3600 * 1000, 'interval': d3.timeWeek.every(2)},
        {'milliseconds': 4 * 7 * 24 * 3600 * 1000, 'interval': d3.timeWeek.every(4)},
        {'milliseconds': 8 * 7 * 24 * 3600 * 1000, 'interval': d3.timeWeek.every(8)},
        {'milliseconds': 16 * 7 * 24 * 3600 * 1000, 'interval': d3.timeWeek.every(16)},
    ],
    onSelectionChange: () => {}
};
