const d3 = require('d3')
import { s } from './state'

export const drawKeywords = () => {

    const max = 5
    const distance = 50
    const fontSize = 1.5
    const lineSpacing = 1.5
    const d_min = Math.pow(distance * 2 - 20, 2)
    const d_max = Math.pow(distance * 2 + 20, 2)

    s.context.fillStyle = d3.rgb(251, 253, 166)
    s.context.fill()

    s.pairs.forEach(d => {

        const a = Math.abs(d.pair[0].x - d.pair[1].x)
        const b = Math.abs(d.pair[0].y - d.pair[1].y)
        const distance = Math.pow(a, 2) + Math.pow(b, 2)

        if ((d_min < distance) && (distance < d_max)) {

            // console.log(d.terms)

            const x = a / 2 + (d.pair[0].x < d.pair[1].x ? d.pair[0].x : d.pair[1].x)
            const y = b / 2 + (d.pair[0].y < d.pair[1].y ? d.pair[0].y : d.pair[1].y)
            const height = d.terms.slice(0, max).reduce((int, term) => int += fontSize * Math.log(term[1]) * lineSpacing, 0)
            let shiftY = 0

            d.terms.slice(0, max).forEach((term, i) => {
                s.context.textAlign = 'center'
                const size = fontSize * Math.log(term[1])
                s.context.font = `normal 300 ${size}pt Helvetica`
                shiftY += size * lineSpacing
                s.context.fillText(term[0], x, y + shiftY - height / 2)
            })

        }

    })

}

export const drawLinks = () => {

    s.context.beginPath()
    s.context.strokeStyle = d3.rgb(251, 253, 166)
    s.context.stroke()
    s.graph.links.forEach(link => {
        s.context.moveTo(link.source.x, link.source.y)
        s.context.lineTo(link.target.x, link.target.y)
        s.context.lineWidth = link.value
        // const lineWidth = 1
    })
    

}


export const drawNodes = () => {

    s.context.beginPath()
    s.context.fillStyle = d3.rgb(251, 253, 166)
    s.graph.nodes.forEach(node => {
        s.context.moveTo(node.x, node.y)
        s.context.arc(node.x, node.y, 2, 0, 2 * Math.PI)
        s.context.font = "3pt Helvetica"
        s.context.fillText(`${node.id} (${node.docs})`, node.x, node.y + 8);
    })

    s.context.fillStyle = d3.rgb(251, 253, 166)
    s.context.fill()

}

// export const drawMatches = () => {
//     console.log("matching elements", s.matches.length);
//     s.context.beginPath()
//     s.context.fillStyle = d3.rgb(255,255,255)
//     s.matches.forEach(node => {
//         s.context.moveTo(node.x, node.y)
//         s.context.arc(node.x, node.y, 10, 0, 2 * Math.PI)
//     });
//     s.context.fill()
// }

const z0 = {x:0, y:0, k: 0};
function _computeDensityData() {
    const ex = d3.extent(s.graph.nodes, d => d.x),
      ey = d3.extent(s.graph.nodes, d => d.y),
      em = Math.max(ex[1]-ex[0], ey[1]-ey[0]);

    const w = 4 * s.screen.width; // definition of the grid for the contours
    z0.k = w / (em + 1000);
    z0.x = -ex[0] * z0.k;
    z0.y = -ey[0] * z0.k;

    s.densityData = d3.contourDensity()
        .x(d => z0.x + d.x * z0.k)
        .y(d => z0.y + d.y * z0.k)
        .weight(d => z0.k * d.docs)
        .size([w, w])
        .bandwidth(30 * z0.k)
        (s.graph.nodes)
    s.densityData.forEach(d => d.coordinates = d.coordinates
      .map(d => d.map(d => d.map(
        d => [(d[0] - z0.x) / z0.k, (d[1] - z0.y) / z0.k]
      )))
    );
}

export const drawContours = () => {
    if (s.computed && !s.densityData.length) _computeDensityData();
    
    const path = d3.geoPath().context(s.context)

    s.densityData.forEach((level, i) => {
        s.context.beginPath()
        s.context.strokeStyle = d3.rgb(251, 253, 166)
        s.context.lineWidth = (.1 + .02 * i) / s.zoomIdentity.k
        path(level)
        s.context.stroke()
    })


}