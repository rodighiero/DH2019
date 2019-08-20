import * as d3 from 'd3'
import { s } from './state'

import click from './click'
import nodes from './drawNodes'
import keywords from './drawKeywords'
import contours from './drawContours'

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

    s.context.fillStyle = s.gradient
    s.context.fillRect(0, 0, s.screen.width, s.screen.height)

    s.context.translate(x, y)
    s.context.scale(k, k)

    contours()
    keywords()
    nodes()

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
            .radius(40)
            .strength(.2)
            // .iterations(5)
        )
        .force('center', d3.forceCenter(s.screen.width / 2, s.screen.height / 2))
        .force('link', d3.forceLink()
            .id(d => d.id)
            .strength(d => d.value)
        )
    // .alphaDecay(.005)
    // .alpha(0.1)

    simulation.nodes(s.nodes)
    simulation.force('link').links(s.links)



    //
    // Simulation start
    //

    const animation = true

    if (animation) {
        simulation
            .on('tick', ticked)
            .on('end', () => {
                s.end = true
                // ticked()
            })

    } else {
        simulation.stop()
        simulation.tick(1000)
        s.end = true
        // ticked()
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