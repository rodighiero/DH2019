import style from "./html/style.css";

// require('!style-loader!css-loader!marx-css/css/marx.css')

import simulation from './js/simulation.js'
import { s } from './js/state'

const graph = require('./data/network.json');

console.log(graph)

s.setCanvas()
s.setGraph(graph)
s.setPairs(graph.nodes)
s.setScreen()
simulation()

