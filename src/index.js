import style from "./html/style.css"
import * as d3 from 'd3'
// require('!style-loader!css-loader!marx-css/css/marx.css')

import simulation, { ticked } from './js/simulation.js'
import { s } from './js/state'

const start = graph => {
    s.setCanvas()
    s.setGraph(graph)
    s.setPairs(graph.nodes)
    s.setScreen()
    simulation()
}

d3.json('./src/data/network.json')
    .catch(error => console.error(error))
    .then(graph => start(graph))



// const searchField = d3.select("#searchField").on('input', function(e){ 
//     const matchingNodes = graph.nodes.filter(d => d.id.toLowerCase().indexOf(this.value.toLowerCase()) !== -1);
//     console.log("matching", matchingNodes);
//     s.setMatches(matchingNodes);
//     ticked();
// });
// console.log(searchField);