const d3 = require('d3')
import { s } from './state'

export const drawKeywords = () => {

    const max = 1
    const distance = 30
    const fontSize = 1
    const lineSpacing = fontSize * .8
    const d_min = Math.pow(distance * 2 - 20, 2)
    const d_max = Math.pow(distance * 2 + 20, 2)

    s.pairs.forEach(d => {

        const a = Math.abs(d.pair[0].x - d.pair[1].x)
        const b = Math.abs(d.pair[0].y - d.pair[1].y)
        const distance = Math.pow(a, 2) + Math.pow(b, 2)

        if ((d_min < distance) && (distance < d_max)) {

            const x = a / 2 + (d.pair[0].x < d.pair[1].x ? d.pair[0].x : d.pair[1].x)
            const y = b / 2 + (d.pair[0].y < d.pair[1].y ? d.pair[0].y : d.pair[1].y)



            d.terms.slice(0, max).forEach((term, i) => {
                const value = term[1]
                s.context.beginPath
                s.context.textAlign = 'center'
                const size = fontSize * Math.log(value)
                const space = lineSpacing * Math.log(value)
                s.context.font = `normal 300 ${size}pt Helvetica`
                // s.context.font = `normal 300 6pt Helvetica`
                // console.log(term[1]*.05)
                // Compute the max value to tune transparency
                // s.context.fillStyle = 'rgba(0,0,0,`${term[i]*.05}`)'
                
                s.context.fillText(term[0], x, (i % 2 === 1) ? i * -space + y : (i + 1) * space + y)
                s.context.endPath
            })

        }

    })

}

export const drawLinks = () => {

    // const lineWidth = 1

    // console.log()

    s.context.beginPath()
    s.graph.links.forEach(link => {
        s.context.moveTo(link.source.x, link.source.y)
        s.context.lineTo(link.target.x, link.target.y)
        s.context.lineWidth = link.value
        // const lineWidth = 1
    })
    s.context.strokeStyle = '#0000FF'
    s.context.stroke()

}


export const drawNodes = () => {

    s.context.beginPath()
    
    s.graph.nodes.forEach(node => {
        s.context.moveTo(node.x, node.y)
        s.context.arc(node.x, node.y, 2, 0, 2 * Math.PI)
        s.context.font = "3pt Helvetica"
        s.context.fillText(node.id, node.x, node.y + 8)
    })

    s.context.fill()
    
}


export const drawContours = () => {

    const densityData = d3.contourDensity()
        .x(d => d.x)
        .y(d => d.y)
        .size([1000, 1000])
        .bandwidth(30)
        (s.graph.nodes)

    const path = d3.geoPath().context(s.context);

    // s.context.fillStyle = 'yellow'
    s.context.strokeStyle = 'black';
    s.context.beginPath();
    path(densityData[0]);
    // s.context.fill();
    s.context.stroke()


}