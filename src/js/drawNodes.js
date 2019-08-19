import * as d3 from 'd3'
import { s } from './state'

const fontStyle = '1.5pt Helvetica'
const radius = .5
const degrees = 2 * Math.PI
const color = d3.rgb(251, 253, 166)
const shift = 4

export default () => {

    s.context.beginPath()
    s.context.fillStyle = color
    s.context.font = fontStyle

    s.nodes.forEach(node => {
        s.context.moveTo(node.x, node.y)
        s.context.arc(node.x, node.y, radius, 0, degrees)
        s.context.fillText(`${node.id} (${node.docs})`, node.x, node.y + shift)
    })

    s.context.fill()

}