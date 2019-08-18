import * as d3 from 'd3'
import { drawKeywords, drawLinks, drawNodes, drawContours, drawMatches } from './drawing'
import click from './click'
import { s } from './state'

window.s = s
s.zoomIdentity = d3.zoomIdentity


//
// Ticked
//

export const ticked = () => {

    const x = s.zoomIdentity.x * s.screen.density
    const y = s.zoomIdentity.y * s.screen.density
    const k = s.zoomIdentity.k

    s.context.save()
    s.context.clearRect(0, 0, s.screen.width, s.screen.height)
    s.context.translate(x, y)
    s.context.scale(k, k)

    // drawKeywords()
    // drawLinks()
    drawNodes()
    drawContours()

    s.context.restore()
}

export default () => {

    //
    // Configuration
    //

    const simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody()
            // .strength(30)
            .strength(-600)
            // .distanceMin(distance)
        )
        .force('collide', d3.forceCollide()
            .radius(20)
            // .strength(1)
            // .iterations(5)
        )
        .force('center', d3.forceCenter(s.screen.width / 2, s.screen.height / 2))
        .force('link', d3.forceLink()
            .id(d => d.id)
            .strength(d => d.value)
        )
    // .alphaDecay(.005)
    // .alpha(0.1)

    simulation.nodes(s.graph.nodes)
    simulation.force('link').links(s.graph.links)



    //
    // Simulation start
    //

    const dynamic = false

    if (dynamic) {
        simulation
            .on('tick', ticked)
            .on('end', () => {
                s.end = true
                ticked()
            })

    } else {
        simulation.stop()
        simulation.tick(100)
        s.end = true
        ticked()
    }



    //
    // Zoom
    //

    s.zoom = d3.zoom().on('zoom', () => {
        s.zoomIdentity = d3.event.transform
        ticked()
    })

    s.zoom.scaleExtent([.1, 10])
    s.zoom.scaleTo(s.canvas, .3)

    s.canvas.call(s.zoom)


    click()

}