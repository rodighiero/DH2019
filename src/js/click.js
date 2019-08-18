import * as d3 from 'd3'
import { s } from './state'

// Click

export default () => {

    const hover = () => {

        const x = s.zoomIdentity.invertX(event.x * s.screen.density),
            y = s.zoomIdentity.invertY(event.y * s.screen.density),
            radius = 30

        for (let i = s.graph.nodes.length - 1; i >= 0; --i) {
            const node = s.graph.nodes[i],
                dx = x - node.x,
                dy = y - node.y

            let tokens = []
            for (var token in node.tokens) {
                const value = node.tokens[token].toFixed(2)
                tokens.push(`${token} (${value})`);
            }

            if (dx * dx + dy * dy < radius * radius) {
                let text = ''
                text += `<p><strong>${node.id}</strong></p>`
                text += `<p>Number of papers: ${node.docs}</p>`
                // text +=  `<p><strong>keywords:</strong> ${Object.values(node.keywords).join(', ')}</p>`
                text += `<p>Tokens:<br/>${tokens.join('<br/>')}</p>`
                // text +=  `<p><strong>Tokens:</strong> ${Object.values(node.tokens).join(', ')}</p>`
                d3.select('#focus').html(text)
            }
        }
    }

    s.canvas.on('mousemove', hover)
}