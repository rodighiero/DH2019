import { s } from './state'

const shift = 4

export default () => {

    s.context.beginPath()
    s.context.fillStyle = s.colors.nodes
    s.context.font = s.style.fontNodes
    s.context.textAlign = 'center'

    s.nodes.forEach(node => {
        const name = node.id.split(', '),
            x = node.x,
            y = node.y
        s.context.fillText(name[1], x, y - shift)
        s.context.fillText(name[0], x, y)
        s.context.fillText(`(${node.docs})`, x, y + shift)
    })

    s.context.fill()

}