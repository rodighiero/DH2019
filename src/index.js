// require('!style-loader!css-loader!marx-css/css/marx.css')
import style from './html/style.css'
import * as d3 from 'd3'
import { s } from './js/state'
import nodes from './data/nodes.json'
import links from './data/links.json'
import simulation from './js/simulation.js'
import hover from './js/hover'
import search from './js/search'

window.d3 = d3
window.s = s

Promise.all([
    d3.json(nodes),
    d3.json(links)
]).then(([nodes, links]) => {
    s.links = links
    s.nodes = nodes
    s.setScreen()
    s.setVariables()
    console.log('nodes', s.nodes.length)
    console.log('links', s.links.length)
    simulation()
    hover()
    search()
})