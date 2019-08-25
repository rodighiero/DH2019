import style from './html/style.css'
import * as d3 from 'd3'
window.d3 = d3;
// require('!style-loader!css-loader!marx-css/css/marx.css')

import simulation from './js/simulation.js'
import { s } from './js/state'

// import {init_researcher_autocomplete} from "./js/search.js";
// import simulation, { ticked } from './js/simulation.js'

import nodes from './data/nodes.json'
import links from './data/links.json'

Promise.all([
    d3.json(nodes),
    d3.json(links)
]).then(([nodes, links]) => {
    s.links = links
    s.nodes = nodes
    s.setScreen()
    s.setVaribles()
    console.log('nodes', s.nodes.length)
    console.log('links', s.links.length)
    simulation()
});


//         // init_researcher_autocomplete()
//         // d3.select('.autocomplete').on('click', function(){
//         //       console.log('here', this);
//         //   })


// const searchField = d3.select("#searchField").on('input', function(e){ 
//     const matchingNodes = graph.nodes.filter(d => d.id.toLowerCase().indexOf(this.value.toLowerCase()) !== -1);
//     console.log("matching", matchingNodes);
//     s.setMatches(matchingNodes);
//     ticked();
// });
// console.log(searchField);