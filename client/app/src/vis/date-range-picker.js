import React from 'react';
import DayPicker, {DateUtils} from 'react-day-picker';
import './date-range-picker.scss';
import Plot from './plot.js';
import {Button} from 'antd';
import {max, map} from 'lodash';
import moment from 'moment';
import {transform, path} from "../util/svg-strings.js";


import {
    CalendarOutlined,
} from '@ant-design/icons';
import * as d3 from "d3";

class DateRangePicker extends Plot {

    constructor(props) {
        super(props);
        this.handleDayClick = this.handleDayClick.bind(this);
        this.state = this.getInitialState();
    }

    getInitialState() {
        return {
            from: undefined,
            to: undefined,
        };
    }

    setSelection(from, to) {
        this.setState({
            from: new Date(from + 'T00:00:00-0700'),
            to: new Date(to + 'T00:00:00-0700')
        })
    }

    handleDayClick(day) {
        const range = DateUtils.addDayToRange(day, this.state);
        const {onRangeChanged} = this.props;
        if (range.from !== undefined && range.to !== undefined) {
            onRangeChanged(range);
        }
        this.setState(range);
    }

    handleResetClick() {
        this.setState(this.getInitialState());
    }


    renderDay(day) {
        const date = day.getDate();
        const dateString = day.toISOString().slice(0, 10)

        let size = 0;
        if (this.cache[dateString] !== undefined) {
            size = Math.min(this.cache[dateString] * 6, 18);
        }

        return (
            <div className="day-cell">
                <div className="overlay">
                    <span className="dot" style={{
                        width: size + 'px',
                        height: size + 'px',
                    }}/>
                </div>
                <div className="date">{date}</div>
            </div>
        );
    }

    content() {

        const {data} = this.state;
        const {from, to} = this.state;
        const {metric} = this.props;

        if (data === undefined) {return; }

        this.cache = {};
        for (let d of this.state.data) {
            this.cache[d['date']] = d[metric]
        }

        const fullRange = {
            from: new Date(this.state.data[0].date + 'T00:00:00-0700'),
            to: new Date(this.state.data[this.state.data.length - 1].date + 'T00:00:00-0700')
        }

        const modifiers = {start: from, end: to};

        const calendarStartMonthDft = moment(fullRange.to).subtract(1, 'months').toDate();

        return <div style={{marginTop: '75px'}}>
            <DayPicker
                numberOfMonths={2}
                selectedDays={[from, {from, to}]}
                modifiers={modifiers}
                month={ calendarStartMonthDft || new Date()}
                onDayClick={this.handleDayClick}
                renderDay={this.renderDay.bind(this)}
                disabledDays={[
                    {after: fullRange.to || new Date()},
                    {before: fullRange.from || new Date()}]}
            />
        </div>;
    }

    info() {
        const {from, to} = this.state;
        if (from !== undefined && to !== undefined) {
            return <div>{from.toISOString().slice(0, 10) + ' - ' + to.toISOString().slice(0, 10)} </div>;
        }
        else {
            return <div/>
        }
    }

    controls() {
        return <Button shape="round" size={'small'}
                       onClick={this.handleResetClick.bind(this)}>Reset</Button>
    }

    paint() {
        super.paint();

        const {data} = this.state;
        const {from, to} = this.state;
        const {metric} = this.props;

        if (data === undefined) {return;}
        const fullRange =  {
            from: new Date(data[0].date + 'T00:00:00-0700'),
            to: new Date(data[data.length - 1].date + 'T00:00:00-0700')
        }

        const {width, height, padding, timelineY, timelineH} = this.props;
        const svg = d3.select(this.svg.current);

        let [innerWidth, innerHeight] = [width - padding.left - padding.right,
            height - padding.top - padding.bottom];

        let scale = d3.scaleTime()
            .domain([fullRange.from, fullRange.to])
            .range([0, innerWidth]);

        let maxVal = max(map(this.state.data, d=>d[metric]));
        let scaleY = d3.scaleLinear()
            .domain([0, maxVal]).range([0, timelineH]);


        svg.append('g')
            .attr('class', 'line')
            .attr('transform', transform.begin().translate(padding.left,  timelineY).end())
            .selectAll('.day')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', d=>scale(new Date(d.date)))
            .attr('y', d=>-scaleY(d[metric]))
            .attr('height', d=>scaleY(d[metric]))
            .attr('width', 1);


        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', transform.begin().translate(padding.left,  timelineY).end())
            .call(d3.axisBottom().scale(scale).ticks(4));

        if (from !== undefined && to !== undefined) {
            svg.append('g')
                .attr('class', 'selection')
               .attr('transform', transform.begin().translate(padding.left,  timelineY).end())
                .append('rect')
                .attr('x', scale(from))
                .attr('y', -timelineH)
                .attr('width', scale(to) - scale(from))
                .attr('height', timelineH);


        }


        svg.attr('width', width)
            .attr('height', 80)


    }


}

export default DateRangePicker;

DateRangePicker.defaultProps = {
    title: '',
    number: '',
    display: 'embedded',
    className: 'date-range-picker plot',
    width: 400,
    height: 330,
    tooltip: undefined,
    visible: true,
    metric: 'commits',
    padding: {
        left: 20, right: 30, bottom: 10, top: 60
    },
    timelineY: 55,
    timelineH: 30,
    onHoverOverDay: () => {
        //TODO: display information (number of commits when hover over day)
    },
    onRangeChanged: () => {
        // call back on range change, by default do nothing
    },
};
