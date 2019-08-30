import * as d3 from 'd3'
import { s } from './state'

const _computeDensityData = () => {

    const extX = d3.extent(s.nodes, d => d.x)
    const extY = d3.extent(s.nodes, d => d.y)

    const width = extX[1] - extX[0]
    const height = extY[1] - extY[0]

    const x = extX[0]
    const y = extY[0]

    s.densityData = d3.contourDensity()
        .x(d => d.x - x)
        .y(d => d.y - y)
        .weight(d => d.docs)
        .size([width, height])
        // .cellSize(10) // Crispness (1 = best resolution)
        // .bandwidth(20) // Expansion of reliefs (40 = high simplification)
        // .thresholds(10) // Indicative number of levels
        (s.nodes)

    s.densityData.forEach(d => d.coordinates = d.coordinates
        .map(d => d.map(d => d.map(
            d => [(d[0] + x), (d[1] + y)]
        )))
    )
}


export default () => {

    // if (s.end && !s.densityData.length) _computeDensityData()
    _computeDensityData()

    s.context.beginPath()
    s.context.strokeStyle = s.colors.contours

    s.densityData
        .forEach((level, i) => {
            s.geoPath(level)
            // s.context.lineWidth = 1
            s.context.lineWidth = .1 + (.15 * i)
        })

    s.context.stroke()

}