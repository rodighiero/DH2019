import * as d3 from 'd3'
import { s } from './state'

const z0 = { x: 0, y: 0, k: 0 }

const _computeDensityData = () => {

    const ex = d3.extent(s.graph.nodes, d => d.x),
        ey = d3.extent(s.graph.nodes, d => d.y),
        em = Math.max(ex[1] - ex[0], ey[1] - ey[0])

    // const w = 4 * s.screen.width; // definition of the grid for the contours
    const w = ex[1] - ex[0] // This is important for the computation weight, it should be zoomable
    z0.k = w / em
    z0.x = -ex[0] * z0.k;
    z0.y = -ey[0] * z0.k;

    s.densityData = d3.contourDensity()
        .x(d => z0.x + d.x * z0.k)
        .y(d => z0.y + d.y * z0.k)
        // .weight(d => z0.k * d.docs) // Old version
        .weight(d => d.docs)
        .size([w, w])
        // .bandwidth(40 * z0.k)
        .thresholds(10) // Indivative number of levels
        (s.graph.nodes)

    s.densityData.forEach(d => d.coordinates = d.coordinates
        .map(d => d.map(d => d.map(
            d => [(d[0] - z0.x) / z0.k, (d[1] - z0.y) / z0.k]
        )))
    )
}

const color = d3.rgb(251, 253, 166)

export default () => {

    if (s.end && !s.densityData.length) _computeDensityData()
    // _computeDensityData()

    const path = d3.geoPath().context(s.context)

    // console.log(s.densityData)


    s.densityData
        // .slice(0, 10)
        .forEach((level, i) => {
            s.context.beginPath()
            s.context.strokeStyle = color
            s.context.lineWidth = (.1 + (.05 * i)) / s.zoomIdentity.k
            path(level)
            s.context.stroke()
        })


}