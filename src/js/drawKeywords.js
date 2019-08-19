import * as d3 from 'd3'
import { s } from './state'

export default () => {

    const max = 3
    const distance = 10
    const fontSize = 1.2
    const lineSpacing = fontSize * 2
    const d_min = Math.pow(distance * 2 - 20, 2)
    const d_max = Math.pow(distance * 2 + 20, 2)



    s.links.forEach(link => {

        const deltaX = Math.abs(link.source.x - link.target.x)
        const deltaY = Math.abs(link.source.y - link.target.y)
        const distance = Math.pow(deltaX, 2) + Math.pow(deltaY, 2)

        if ((d_min < distance) && (distance < d_max)) {

            const tokens = Object.getOwnPropertyNames(link.tokens).slice(0, max)
            const x = deltaX / 2 + (link.source.x < link.target.x ? link.source.x : link.target.x)
            const y = deltaY / 2 + (link.source.y < link.target.y ? link.source.y : link.target.y)
            const height = tokens.length * lineSpacing

            tokens.forEach((token, i) => {
                s.context.beginPath()
                s.context.fillStyle = d3.rgb(251, 253, 166)
                s.context.textAlign = 'center'
                s.context.font = `normal 300 ${fontSize}pt Helvetica`
                s.context.fillText(token, x, y + height / 2 + i * lineSpacing)
                s.context.fill()
            })

        }

    })

}