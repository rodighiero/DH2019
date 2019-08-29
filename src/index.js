// require('!style-loader!css-loader!marx-css/css/marx.css')
import style from './html/style.css'
import * as d3 from 'd3'
import simulation from './js/simulation.js'
import { s } from './js/state'
import nodes from './data/nodes.json'
import links from './data/links.json'

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
})


d3.select("#searchField")
    .on('input', function () {
        const matchingNode = s.nodes.find(d => d.id.toLowerCase().indexOf(this.value.toLowerCase()) !== -1)
        d3.select('#searchResults').html('')
        d3.select('#searchResults').append('p').text(`Press the key 'enter' to zoom to ${matchingNode.id}`)
        console.log("matching", matchingNode)
        s.zoomTo = matchingNode
    })
    .on("keypress", function () {
        if (d3.event.keyCode === 32 || d3.event.keyCode === 13) {

            const k = 8
            const tx = (s.screen.width / 2 - s.zoomTo.x * k) / s.screen.density
            const ty = (s.screen.height / 2 - s.zoomTo.y * k) / s.screen.density

            s.zoomState = d3.zoomIdentity
                .translate(tx, ty)
                .scale(k)

            s.canvas.transition()
                .duration(2000)
                .call(s.zoom.transform, s.zoomState);

        }
    })