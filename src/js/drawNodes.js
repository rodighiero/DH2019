import { s } from './state'

const shift = 3

export default () => {

    s.context.beginPath()
    s.context.fillStyle = s.colors.nodes
    s.context.font = s.style.fontNodes
    s.context.textAlign = 'center'

    s.nodes.forEach(node => {
        const name = node.id.split(', ')
        s.context.fillText(name[1], node.x, node.y - shift)
        s.context.fillText(name[0], node.x, node.y)
        s.context.fillText(`(${node.docs})`, node.x, node.y + shift)
    })

    s.context.fill()

}