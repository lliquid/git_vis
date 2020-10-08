import React from "react";
import Plot from './plot.js';
import * as d3 from 'd3';
import {legendColor} from 'd3-svg-legend';
import {transform} from "../util/svg-strings.js";
import {map, join, reverse, max, min, sortBy, groupBy, keys} from "lodash";

import {
    Button,
    Tooltip,
    Select,
} from 'antd';

import {
    InfoOutlined,
    FireOutlined
} from "@ant-design/icons";

import {
    interpolatorColorDiverging21,
    colorNull
} from "./colors.js";

import './treemap.scss';

const { Option } = Select;


class TreeMap extends Plot {

    constructor(props) {
        super(props);
    }

    title() {
        return <h3> <FireOutlined size={"24px"}/> HotSpots </h3>
    }

    info() {

        const {attrColorOptions, attrSizeOptions} = this.props;

        function Settings() {
            return <div style={{display: 'inline-block'}}>
                <span className={'widget-title'}>color:</span>
                <Select defaultValue={attrColorOptions[0]} bordered={false} style={{ minWidth: 120 }}>
                    {map(attrColorOptions, a=><Option key={a} value={a}>{a}</Option>)}
                </Select>&nbsp;&nbsp;
                <span className={'widget-title'}>size:</span>
                <Select defaultValue={attrSizeOptions[0]} bordered={false} style={{ minWidth: 120 }}>
                    {map(attrSizeOptions, a=><Option key={a} value={a}>{a}</Option>)}
                </Select>
            </div>
        }

        return <div>
            {Settings()}
            <Tooltip color={"#888"} placement="top" title={"About"}>
                <Button shape="circle" size={"small"} icon={<InfoOutlined />}/>
            </Tooltip>
        </div>
    }

    changeColorAttribute(newColorAttr) {
        //TODO:

    }

    changeSizeAttribute(newSizeAttr) {
        //TODO:

    }

    changeVisibility(newVisibilityFunc) {
        //TODO:

    }

    changeParentNodeLabelDisplay(newParentNodeLabelDisplayMode) {
        //TODO: change label display function

    }

    paint() {

        // clean up svg
        super.paint();

        // get attributes
        const svg = d3.select(this.svg.current);
        const {width, height, padding, attrSize, textHeight, textFontSize,
            textTitleHeight, textPaddingLeft, textPaddingBottom, textTitleFontSize, tooltip} = this.props;
        const {leafText} = this.props;
        const {treemapPaddingOutter, treemapPaddingInner, treemapPaddingTop, borderRadius} = this.props;
        let [innerWidth, innerHeight] = [width - padding.left - padding.right,
            height - padding.top - padding.bottom];

        const self = this;
        let root = this.state.data;

        if (root === undefined) {return;}

        // gradient
        svg.html("<defs>\n" +
            "<linearGradient id=\"grad1\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">\n" +
            "<stop offset=\"0%\" style=\"stop-color:rgb(255,255,255);stop-opacity:1.0\" />\n" +
            "<stop offset=\"100%\" style=\"stop-color:rgb(255,255,255);stop-opacity:0.0\" />\n" +
            "</linearGradient>\n" +
            "</defs>\n" +
            "<radialGradient id=\"grad2\" cx=\"30%\" cy=\"30%\" r=\"90%\" fx=\"30%\" fy=\"20%\">\n" +
            "<stop offset=\"0%\" style=\"stop-color:rgb(255,255,255);stop-opacity:0.9\" />\n" +
            "<stop offset=\"100%\" style=\"stop-color:rgb(255,255,255);stop-opacity:0.2\" />\n" +
            "</radialGradient>"
        )

        // root = d3.hierarchy(root).sum(d=>d['developers'] === undefined ? 0.1: d['developers']);
        root = d3.hierarchy(root).sum(d=>d['commits']||.0);

        console.info(root);

        const rootSelection = svg.append('g')
                .datum(root)
                .attr('transform',
                    transform.begin().translate(padding.left, padding.top).end())

        self.focus = root;

        // layout
        d3.treemap()
            .tile(d3.treemapSquarify)
            .paddingOuter(d=>treemapPaddingOutter(d.depth, d.height))
            .paddingTop(d=>treemapPaddingTop(d.depth, d.height))
            .paddingInner(d=>treemapPaddingInner(d.depth, d.height))
            .size([innerWidth, innerHeight])(root);

        let color = d3.scaleSequential([
            0,
            10], interpolatorColorDiverging21);

        const textShorthand = function (text, width, height) {

            if (width > 20 && height > 15) {
                return width/8 > text.length ? text: text.slice(0, Math.floor(width/8)) + '..' ;
            }
            else {
                return '';
            }

        }

        const fullPath = function (node) {
            return node === root ? '/' : join(map(reverse(node.ancestors()), a=>a.data.name), '/');
        }

        const zoom = function (focus, node, selection, xRescale, yRescale) {

            let [x, y, w, h] = [xRescale(node.x0), yRescale(node.y0),
                xRescale(node.x1) - xRescale(node.x0), yRescale(node.y1) - yRescale(node.y0)]

            if (h < 0) {
                h = 0;
            }

            selection.selectAll('rect')
                .transition().duration(1500)
                .attr('x', x).attr('y', y)
                .attr('width', w).attr('height', h);

            selection.selectAll('text.title')
                .transition().duration(1500)
                .attr('x', x + textPaddingLeft).attr('y', y + textHeight - textPaddingBottom)
                .text(textShorthand((node.children?'/':'') + node.data.name, w, h));

            let description = selection.select('g.description')
                .attr('transform', transform.begin().translate(x, y).end())
                .attr('visibility', (w > 50 && h > textHeight * 2) ? 'visible': 'hidden');

            description.selectAll('text').remove();
            description.selectAll('text')
                .data(leafText(node).slice(0, Math.floor(h / textHeight) - 1))
                .enter()
                .append('text')
                .attr('x', textPaddingLeft).attr('y', (t, i)=> (i + 2) * textHeight)
                .text(t=>t);


            // redefine the rescale function
            if (node.children && focus.descendants().includes(node)) {

                for (let child of node.children) {
                    child.x0_ = xRescale(child.x0);
                    child.x1_ = xRescale(child.x1);
                    child.y0_ = yRescale(child.y0);
                    child.y1_ = yRescale(child.y1);
                }

                let xMin = min(map(node.children, c=>c.x0_));
                let xMax = max(map(node.children, c=>c.x1_));
                let yMin = min(map(node.children, c=>c.y0_));
                let yMax = max(map(node.children, c=>c.y1_));

                let xStretch = d3.scaleLinear()
                    .domain([xMin, xMax]).range([
                        x + treemapPaddingOutter(node.depth, node.height),
                        x + w - treemapPaddingOutter(node.depth, node.height)]);

                let yStretch = d3.scaleLinear()
                    .domain([yMin, yMax]).range([
                        y + treemapPaddingTop(node.depth, node.height),
                        y + h - treemapPaddingOutter(node.depth, node.height)]);

                for (let child of node.children) {
                    child.x0_ = xStretch(child.x0_);
                    child.x1_ = xStretch(child.x1_);
                    child.y0_ = yStretch(child.y0_);
                    child.y1_ = yStretch(child.y1_);
                }


            }


            selection.selectAll('g.node')
                .each(function(child) {
                    if (!node.children.includes(child)) {return;}

                    if (focus.descendants().includes(node)) {
                        let xRescale_ = d3.scaleLinear()
                            .domain([child.x0, child.x1]).range([child.x0_, child.x1_]);
                        let yRescale_ = d3.scaleLinear()
                            .domain([child.y0, child.y1]).range([child.y0_, child.y1_]);
                        zoom(focus, child, d3.select(this), xRescale_, yRescale_);
                    }
                    else {
                        zoom(focus, child, d3.select(this), xRescale, yRescale);
                    }
                })

        }

        const render = function (d, selection) {

            let classes = 'node';
            if (d.height === 0) {classes += ' leaf';}
            selection.attr('class', classes);

            selection.on('dblclick', function(d) {

                if (d === self.focus) { return; }

                let xRescale = d3.scaleLinear().domain([d.x0, d.x1]).range([0, innerWidth]);
                let yRescale = d3.scaleLinear().domain([d.y0, d.y1]).range([0, innerHeight]);

                let name = 'current position: ' + fullPath(d);
                self.nav.select('text')
                    .text(name);
                self.focus = d;

                zoom(d, root, rootSelection, xRescale, yRescale);
                d3.event.stopPropagation()

            })

            let [x, y, w, h] = [d.x0, d.y0, d.x1-d.x0, d.y1-d.y0];
            if (! (d.depth === 0 && d.height > 0)) {

                selection.append('rect')
                    .attr('x', x).attr('y', y).attr('width', w).attr('height', h)
                    .style('fill', ((d.depth === 0 || d.depth === 1) && d.height > 0) ? '#ffffff' : ((d.height === 0
                                    && d.data.developers !== undefined
                                    && d.data.developers !== 0
                                )?color(d.data.developers):colorNull)
                            );

                selection.append('rect')
                    .attr('x', x).attr('y', y).attr('width', w).attr('height', h)
                    .style('fill', "url(#grad2)");

                let text = selection.append('text')
                    .attr('class', 'title')
                    .attr('x', x + textPaddingLeft).attr('y', y + textHeight - textPaddingBottom)
                    .text(textShorthand((d.children?'/':'') + d.data.name, w, h));

                if ((d.depth === 0 || d.depth === 1) && d.height > 0) {
                    text.attr('y', y + textTitleHeight - textPaddingBottom)
                        .style('font-size', textTitleFontSize);
                }

                if (d.height === 0) {
                    selection.append('g')
                        .attr('class', 'description')
                        .attr('transform', transform.begin().translate(x, y).end())
                        .attr('visibility', (w > 50 && h > textHeight * 2) ? 'visible': 'hidden')
                        .selectAll('text')
                        .data(leafText(d).slice(0, Math.floor(h / textHeight) - 1))
                        .enter()
                        .append('text')
                        .attr('x', textPaddingLeft).attr('y', (t, i)=> (i + 2) * textHeight)
                        .text(t=>t);

                }


            }


            if (d.children !== undefined && d.children.length > 0) {
                selection.selectAll('g')
                    .data(d.children)
                    .enter()
                    .append('g')
                    .attr('class', 'node')
                    .each(function(c) {
                        render(c, d3.select(this));
                    })

            }

        };

        render(root, rootSelection);

        const legend = function(selection) {

            selection.append("g")
              .attr("class", "legendSequential")
              .attr("transform", transform
                  .begin().translate(width - padding.right - 400, height - padding.bottom + 15).end());

            let legendSequential = legendColor()
                .shapeWidth(30)
                .shapeHeight(10)
                .cells(12)
                .orient("horizontal")
                .scale(color);

            selection.select(".legendSequential")
              .call(legendSequential);

        }


        const padWhite = function(selection, width, height, padding) {

            let rects = [
                {x: 0, y: padding.top, w: padding.left - 1, h: height - padding.top - padding.bottom},
                {x: 0, y: 0, w: width, h: padding.top - 1},
                {x: 0, y: height - padding.bottom + 1, w: width, h: padding.bottom},
                {x: width - padding.right + 1, y: padding.top, w: padding.right, h: height - padding.top - padding.bottom}
            ]

            selection.append("g")
                .selectAll('rect')
                .data(rects).enter().append('rect')
                .attr('rx', borderRadius).attr('ry', borderRadius)
                .attr('x', d=>d.x).attr('y',d=>d.y).attr('width', d=>d.w).attr('height', d=>d.h)
                .style('fill', '#fff');

        }

        const navigator = function (selection) {

            let nav = selection.append("g")
                .attr("class", "navigator")
                .attr("transform", transform.begin()
                    .translate(padding.left, padding.top - textTitleHeight - 10).end());

            nav.append("rect")
                .attr('width', innerWidth).attr('height', textTitleHeight)

            nav.append("text")
                .attr("x", textPaddingLeft).attr("y", textTitleHeight - textPaddingBottom)
                .text('current position: ' + '/')

            nav.on('click', function () {

                let d = self.focus.parent;

                if (!self.focus.parent) {return;} //already at the top, do nothing

                let xRescale = d3.scaleLinear()
                    .domain([d.x0, d.x1]).range([0, innerWidth]);
                let yRescale = d3.scaleLinear()
                    .domain([d.y0, d.y1]).range([0, innerHeight]);

                let name = 'current position: ' + fullPath(d);
                self.nav.select('text')
                    .text(name);
                self.focus = d;

                zoom(d, root, rootSelection, xRescale, yRescale);

            })

            return nav;
        }

        padWhite(svg, width, height, padding);
        legend(svg);
        this.nav = navigator(svg);

    }

}

export default TreeMap;

TreeMap.defaultProps = {
    title: 'TreeMap',
    className: 'treemap plot',
    width: 800,
    height: 800,
    internalNodeLabelHeight: 15,
    padding: {
        left: 20, right: 20, bottom: 50, top: 90
    },
    zoomTransitionDuration: 1500, // 1500 ms transition durations
    textPaddingLeft: 4,
    textPaddingBottom: 4,
    textHeight: 16,
    textFontSize: 12,
    textTitleHeight: 24,
    textTitleFontSize: 18,
    leafText: n=>{ //textual description of
        if (n.height !== 0) {return [];}
        let lines = [];
        if (n.data !== undefined) {
            if (n.data.lines_added !== undefined) {
                lines.push(' + ' + n.data.lines_added +
                    ' / ' + ' - ' + n.data.lines_deleted + ' lines');
            }
            if (n.data.commits !== undefined) {
                lines.push(n.data.commits + ' commits');
            }
            if (n.data.developers !== undefined) {
                lines.push(n.data.developers + ' developers');
            }
        }
        return lines;
    },
    treemapPaddingOutter: ()=>3,
    treemapPaddingTop: (depth, height)=>{
        if (depth === 1 && height > 0) { return 26; }  //by default is text title height
        else if (height > 0) { return 18; }//by default is text height
        else { return 2; }},
    // treemapPaddingTop: (depth, height)=>{return 4;},
    treemapPaddingInner: (depth, height)=>{
        if (depth === 0) {return 10;}
        else if (depth === 1 && height > 0) {return 6;}
        else {return 2}},
    borderRadius: 20,
    attrSize: 'lines',
    attrColor: 'lines_added',
    attrColorOptions: ['added lines (normalized by total lines of code)', 'added lines (absolute)' , 'deleted lines (normalized by total lines of code)', 'deleted lines (absolute)', 'total changed lines', 'number of commits', 'number of developers'],
    attrSizeOptions: ['lines of code', 'added lines (absolute)', 'deleted lines (absolute)', 'total changed lines', 'number of commits']
};
