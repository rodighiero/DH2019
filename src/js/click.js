const d3 = require('d3')

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
            if (dx * dx + dy * dy < radius * radius) {
                let text = ''
                text += `<h1><strong>${node.id}</strong></h1>`
                text +=  `<p><strong>Documents:</strong> ${node.docs}</p>`
                text +=  `<p><strong>Terms:</strong> ${Object.keys(node.terms).join(', ')}</p>`
                text +=  `<p><strong>Tokens:</strong> ${Object.values(node.tokens).join(', ')}</p>`
                d3.select('#focus').html(text)
            }
        }
    }

    s.canvas.on('mousemove', hover)
}