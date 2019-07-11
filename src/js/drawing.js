const d3 = require('d3')
import { s } from './state'

export const drawKeywords = () => {

    const max = 5
    const distance = 40
    const fontSize = 1.5
    const lineSpacing = 1.5
    const d_min = Math.pow(distance * 2 - 20, 2)
    const d_max = Math.pow(distance * 2 + 20, 2)

    s.pairs.forEach(d => {

        const a = Math.abs(d.pair[0].x - d.pair[1].x)
        const b = Math.abs(d.pair[0].y - d.pair[1].y)
        const distance = Math.pow(a, 2) + Math.pow(b, 2)

        if ((d_min < distance) && (distance < d_max)) {

            const x = a / 2 + (d.pair[0].x < d.pair[1].x ? d.pair[0].x : d.pair[1].x)
            const y = b / 2 + (d.pair[0].y < d.pair[1].y ? d.pair[0].y : d.pair[1].y)
            const height = d.terms.slice(0, max).reduce((int, term) => int += fontSize * Math.log(term[1]) * lineSpacing, 0)
            let shiftY = 0

            d.terms.slice(0, max).forEach((term, i) => {
                s.context.beginPath
                s.context.textAlign = 'center'
                const size = fontSize * Math.log(term[1])
                s.context.font = `normal 300 ${size}pt Helvetica`
                shiftY += size * lineSpacing
                s.context.fillText(term[0], x, y + shiftY - height / 2)
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
        s.context.fillText(`${node.id} (${node.docs})`, node.x, node.y + 8);
    })

    s.context.fill()
    
}


export const drawContours = () => {
    // 

    const max = d3.max(s.graph.nodes, n => n.docs)
    const myColor = d3.scaleSequential().domain([2,max]).interpolator(d3.interpolateInferno);

    const densityData = d3.contourDensity()
        .x(d => d.x)
        .y(d => d.y)
        .weight(d => d.docs)
        .size([2000, 2000])
        .bandwidth(30)
        (s.graph.nodes)

    const path = d3.geoPath().context(s.context)

    // s.context.fillStyle = 'yellow'
    densityData.forEach((level, i) => {
        // if (i === 0) {
        //     s.context.strokeStyle = 'blue'
        
        // } else {
        //     s.context.strokeStyle = 'red'
        
        // }
        
        
        s.context.strokeStyle = myColor(i)


        s.context.lineWidth = .1 + .05 * i
        s.context.beginPath()
        path(level)
        s.context.stroke()
        // s.context.fill()

    })


}