const d3 = require('d3')

import { drawKeywords, drawLinks, drawNodes } from './drawing'
import click from './click'
import { s } from './state'

window.s = s


const distance = 40
s.zoomIdentity = d3.zoomIdentity


export const ticked = () => {

    const x = s.zoomIdentity.x * s.screen.density
    const y = s.zoomIdentity.y * s.screen.density
    const k = s.zoomIdentity.k

    s.context.save()
    s.context.clearRect(0, 0, s.screen.width, s.screen.height)
    s.context.translate(x, y)
    s.context.scale(k, k)
    if (s.visibility.keywords) drawKeywords()
    if (s.visibility.links) drawLinks()
    if (s.visibility.nodes) drawNodes()
    s.context.restore()

}

export default () => {

    // Simulation

    const simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody()
            .strength(-1200)
        //     .strength(-300)
        //     .distanceMin(distance)
        )
        .force('collide', d3.forceCollide()
            .radius(distance)
            .strength(.3)
        //     .iterations(5)
        )
        .force('center', d3.forceCenter(s.screen.width / 2, s.screen.height / 2))
        .force('link', d3.forceLink()
            .id(d => d.id)
            .strength(d => d.value)
            .distance(d=> 1 - d.value)
            // .distance(distance)
        )
        // .alphaDecay(.005)
        // .alpha(0.1)

    simulation.nodes(s.graph.nodes)
    simulation.force('link').links(s.graph.links)

    simulation
        .on('tick', () => ticked())
        .on('end', () => console.log('network has been computed'))



    // Zoom

    s.zoom = d3.zoom().on('zoom', () => {
        s.zoomIdentity = d3.event.transform
        ticked()
    })

    s.zoom.scaleExtent([.1, 10])
    s.zoom.scaleTo(s.canvas,.3)

    s.canvas.call(s.zoom)


    click()



}