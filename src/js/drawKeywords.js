import * as d3 from 'd3'
import { s } from './state'

export default () => {

    const max = 1
    const d_min = Math.pow(s.distance * 2, 2)
    const d_max = Math.pow(s.distance * 4, 2)

    s.links.forEach(link => {

        const deltaX = Math.abs(link.source.x - link.target.x)
        const deltaY = Math.abs(link.source.y - link.target.y)
        const distance = Math.pow(deltaX, 2) + Math.pow(deltaY, 2)

        if ((d_min < distance) && (distance < d_max)) {

            // Idea: filter keywords both by zoom level and font size
            // Bigger fonts are visible from a distant point of view
            // Small fonts will be visible when closer
            // Selec on the list the closer size

            // Zoom Extent [.3, 10]
            // Keyword extent [, 4562]

            // console.log(s.zoomIdentity)

            const x = deltaX / 2 + (link.source.x < link.target.x ? link.source.x : link.target.x)
            const y = deltaY / 2 + (link.source.y < link.target.y ? link.source.y : link.target.y)

            const tokens = Object.entries(link.tokens).slice(0, max)

            for (const [key, value] of tokens) {
                // console.log(value)
                s.context.beginPath()
                s.context.fillStyle = s.colors.keywords
                s.context.textAlign = 'center'
                s.context.font = `normal 300 ${value * .1}pt Helvetica`
                s.context.fillText(key, x, y)
                s.context.fill()
            }

        }

    })

}