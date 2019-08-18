import * as d3 from 'd3'
import { s } from './state'

export const drawKeywords = () => {

    const max = 8
    const distance = 10
    const fontSize = 1
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
            const height = d.terms.slice(0, max).reduce((int, term) => int += fontSize * lineSpacing, 0)
            let shiftY = 0

            d.terms.slice(0, max).forEach((term, i) => {
                s.context.textAlign = 'center'
                const size = fontSize
                s.context.font = `normal 300 ${size}pt Helvetica`
                shiftY += size * lineSpacing
                s.context.fillText(term[0], x, y + shiftY - height / 2)
            })

        }

    })

}