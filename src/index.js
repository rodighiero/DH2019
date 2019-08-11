import style from './html/style.css'
import * as d3 from 'd3'
// require('!style-loader!css-loader!marx-css/css/marx.css')

import simulation, { ticked } from './js/simulation.js'
import { s } from './js/state'
import graph from './data/network.json'

s.setCanvas()
s.setGraph(graph)
s.setPairs(graph.nodes)
s.setScreen()
simulation()

// const searchField = d3.select("#searchField").on('input', function(e){ 
//     const matchingNodes = graph.nodes.filter(d => d.id.toLowerCase().indexOf(this.value.toLowerCase()) !== -1);
//     console.log("matching", matchingNodes);
//     s.setMatches(matchingNodes);
//     ticked();
// });
// console.log(searchField);