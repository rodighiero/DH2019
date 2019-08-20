import * as d3 from 'd3'
import { s } from './state'

const radius = .5
const degrees = 2 * Math.PI
const shift = 4

export default () => {

    s.context.beginPath()
    s.context.fillStyle = s.colors.nodes
    s.context.font = s.style.fontNodes
    s.context.textAlign = 'center'

    s.nodes.forEach(node => {
        s.context.moveTo(node.x, node.y)
        s.context.arc(node.x, node.y, radius, 0, degrees)
        s.context.fillText(`${node.id} (${node.docs})`, node.x, node.y + shift)
    })

    s.context.fill()

}