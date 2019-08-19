import * as d3 from 'd3'
import { s } from './state'

const z = { x: 0, y: 0, k: 0 }

const _computeDensityData = () => {

    const ex = d3.extent(s.graph.nodes, d => d.x),
        ey = d3.extent(s.graph.nodes, d => d.y),
        em = Math.max(ex[1] - ex[0], ey[1] - ey[0])

    // const w = 4 * s.screen.width; // definition of the grid for the contours
    const width = ex[1] - ex[0] // This is important for the computation weight, it should be zoomable
    const height = ey[1] - ey[0] // This is important for the computation weight, it should be zoomable
    console.log(ex, ey, em)
    // console.log(width, height)
    z.k = width / em
    z.x = -ex[0] * z.k
    z.y = -ey[0] * z.k

    s.densityData = d3.contourDensity()
        .x(d => z.x + d.x * z.k)
        .y(d => z.y + d.y * z.k)
        .weight(d => d.docs)
        .size([width, height])
        .cellSize(1) // Crispness (1 = best resolution)
        .bandwidth(20) // Expansion of reliefs (40 = high simplification)
        .thresholds(10) // Indicative number of levels
        (s.graph.nodes)

    s.densityData.forEach(d => d.coordinates = d.coordinates
        .map(d => d.map(d => d.map(
            d => [(d[0] - z.x) / z.k, (d[1] - z.y) / z.k]
        )))
    )
}

const color = d3.rgb(251, 253, 166)

export default () => {

    if (s.end && !s.densityData.length) _computeDensityData()
    // _computeDensityData()
    const path = d3.geoPath().context(s.context)

    s.densityData
        .forEach((level, i) => {
            s.context.beginPath()
            s.context.strokeStyle = color
            s.context.lineWidth = (.8 + (.1 * i))
            path(level)
            s.context.stroke()
        })

}