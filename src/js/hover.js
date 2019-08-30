import * as d3 from 'd3'
import { s } from './state'

export default () => {

    const hover = () => {

        const radius = 20,
            x = s.zoomState.invertX(event.x) * s.screen.density,
            y = s.zoomState.invertY(event.y) * s.screen.density

        for (let i = s.nodes.length - 1; i >= 0; --i) {

            const node = s.nodes[i],
                dx = x - node.x,
                dy = y - node.y

            if (dx * dx + dy * dy < radius * radius) {

                const tokens = Object.entries(node.tokens).reduce((tokens, token) => {
                    tokens.push(`${token[0]} (${token[1].toFixed(2)})`)
                    return tokens
                }, [])

                let text = `<p><strong>${node.id}</strong></p>`
                text += `<p>Number of papers: ${node.docs}</p>`
                text += `<p>Tokens:<br/>${tokens.join('<br/>')}</p>`
                d3.select('#focus').html(text)

            }
        }

    }

    // s.canvas.on('mousemove', hover)
}