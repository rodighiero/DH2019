import style from "./html/style.css";

// require('!style-loader!css-loader!marx-css/css/marx.css')

const d3 = require('d3')
window.d3 = d3;
import simulation from './js/simulation.js'
import { s } from './js/state'
//import update_researcher_autocomplete from './js/search.js'

import {init_researcher_autocomplete} from "./js/search.js";


window.onload = function () {
    const graph = require('./data/network.json');

    s.setCanvas();
    s.setGraph(graph);
    s.setPairs(graph.nodes);
    s.setScreen();
//    simulation();
    init_researcher_autocomplete();

    d3.select('.autocomplete').on('click', function(){
        console.log('here', this);
    });
};



