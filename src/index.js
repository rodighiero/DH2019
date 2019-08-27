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


d3.select("#searchField")
    .on('input', function () {
        const matchingNode = s.nodes.find(d => d.id.toLowerCase().indexOf(this.value.toLowerCase()) !== -1)
        d3.select('#searchResults').html('')
        d3.select('#searchResults').append('p').text(`Press the key 'enter' to zoom to ${matchingNode.id}`)
        console.log("matching", matchingNode)
        s.zoomTo = matchingNode
        // s.setMatches(matchingNodes);
        // ticked();
    })
    .on("keypress", function () {
        if (d3.event.keyCode === 32 || d3.event.keyCode === 13) {
            console.log("Congrats, you pressed enter or space!")
            console.log(s.zoomTo.x, s.zoomTo.y)
            s.zoomIdentity.scale(10)

        //      =            {
        //         k: 10,
        //         x: s.zoomTo.x,
        //         y: s.zoomTo.y
        //     }

        //     const transformation = zoomIdentity
        //         .translate(s.screen.width / 2 / s.screen.density, s.screen.height / 2 / s.screen.density)
        //         .scale(k)
        //         .translate(-node.x, -node.y)

            // console.log(newZoomIdentity)
            // s.zoomIdentity.k = 10

            s.canvas.transition().duration(2000).call(s.zoom.transform, s.zoomIdentity)
        }
    })

    export const zoomToLab = (graph, lab) => {

            let node = graph.nodes.find(node => node.attr.name === lab)
        
            const k = Math.min(s.screen.width, s.screen.height) / ((s.client.isMobile && !s.client.isTablet ? 150 : 200) * s.screen.density)
            const transformation = zoomIdentity
                .translate(s.screen.width / 2 / s.screen.density, s.screen.height / 2 / s.screen.density)
                .scale(k)
                .translate(-node.x, -node.y)
        
            state.canvas.transition().duration(2000).call(state.zoom.transform, transformation)
        
        }