import { s } from './state'

export const drawKeywords = () => {

    const max = 3
    const distance = 40
    const fontSize = 5
    const lineSpacing = fontSize * .7
    const d_min = Math.pow(distance * 2 - 20, 2)
    const d_max = Math.pow(distance * 2 + 20, 2)

    s.pairs.forEach(d => {

        const a = Math.abs(d.pair[0].x - d.pair[1].x)
        const b = Math.abs(d.pair[0].y - d.pair[1].y)
        const distance = Math.pow(a, 2) + Math.pow(b, 2)

        if ((d_min < distance) && (distance < d_max)) {

            const x = a / 2 + (d.pair[0].x < d.pair[1].x ? d.pair[0].x : d.pair[1].x)
            const y = b / 2 + (d.pair[0].y < d.pair[1].y ? d.pair[0].y : d.pair[1].y)

            s.context.textAlign = 'center'
            
            d.terms.slice(0, max).forEach((term, i) => {
                s.context.font = `normal 300 ${term[1]}pt Helvetica`
                s.context.fillText(term[0], x, (i % 2 === 1) ? i * -lineSpacing + y : (i + 1) * lineSpacing + y)
            })
            
        }

    })

}

export const drawLinks = () => {

    const lineWidth = .01

    s.context.beginPath()
    s.graph.links.forEach(link => {
        s.context.moveTo(link.source.x, link.source.y)
        s.context.lineTo(link.target.x, link.target.y)
    })
    s.context.lineWidth = lineWidth
    s.context.strokeStyle = '#0000FF'
    s.context.stroke()

}


export const drawNodes = () => {

    s.context.beginPath()
    s.graph.nodes.forEach(node => {
        s.context.moveTo(node.x, node.y)
        s.context.arc(node.x, node.y, 3, 0, 2 * Math.PI)
    })
    s.context.fill()
}