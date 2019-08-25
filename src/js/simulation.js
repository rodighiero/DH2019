import * as d3 from 'd3'
import { s } from './state'
import ticked from './ticked'
import hover from './hover'

window.s = s
s.zoomIdentity = d3.zoomIdentity



//
// Simulation
//

export default () => {

    //
    // Configuration
    //

    const simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody()
            .strength(-300)
            // .distanceMin(60)
            // .distanceMax(400)
        )
        .force('collide', d3.forceCollide()
            .radius(s.distance)
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
                ticked()
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


    // Enable hover
    hover()

}