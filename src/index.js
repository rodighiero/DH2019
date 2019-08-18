import style from './html/style.css'
//import * as d3 from 'd3'
// require('!style-loader!css-loader!marx-css/css/marx.css')


const d3 = require('d3')
window.d3 = d3;
import simulation from './js/simulation.js'
import { s } from './js/state'
//import update_researcher_autocomplete from './js/search.js'

import {init_researcher_autocomplete} from "./js/search.js";
import simulation, { ticked } from './js/simulation.js'
import { s } from './js/state'
import json from './data/network.json'


d3.json(json)
    .catch(error => console.error(error))
    .then(graph => {
        s.setCanvas()
        s.setGraph(graph)
        s.setPairs(graph.nodes)
        s.setScreen()
        init_researcher_autocomplete()
        simulation()
        d3.select('.autocomplete').on('click', function(){
              console.log('here', this);
          })
    })




// const searchField = d3.select("#searchField").on('input', function(e){ 
//     const matchingNodes = graph.nodes.filter(d => d.id.toLowerCase().indexOf(this.value.toLowerCase()) !== -1);
//     console.log("matching", matchingNodes);
//     s.setMatches(matchingNodes);
//     ticked();
// });
// console.log(searchField);