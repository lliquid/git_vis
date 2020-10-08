import * as d3 from 'd3';

const colorDiverging20 = [
    // "#40549C",
    // "#91C1E8",
    "#C6E3F9",
    "#E5F3F8",
    "#F4F9EC",
    "#FAF7D9",
    "#FBEFC3",
    "#F4D59C",
    "#EFC88D",
    "#E9B67E",
    "#E4A472",
    "#DE9368",
    "#D7805E",
    "#D27258",
    "#CC6251",
    "#C3544C",
    "#B94546",
    "#B03A43",
    // "#A3303F",
    // "#9c2b3e"
];

const colorSequential = [
    '#ffffd9',
    '#edf8b1',
    '#c7e9b4',
    '#7fcdbb',
    '#41b6c4',
    '#1d91c0',
    '#225ea8',
    '#253494'
];

const colorNull = "#e0e0e0";
const colorDataSelection = "#85b5e5";

const interpolatorColorDiverging21 = d3.interpolateDiscrete(colorDiverging20);
const interpolateSequential = d3.interpolateDiscrete(colorSequential);

export {
    interpolatorColorDiverging21,
    interpolateSequential,
    colorDiverging20,
    colorNull,
    colorDataSelection};