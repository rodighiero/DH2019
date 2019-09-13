import * as d3 from 'd3'
import { s } from './state'

export default () => {

    d3.select("#searchField")
        .on('input', function () {
            const matchingNode = s.nodes.find(d => {
                console.log(this)
                return d.id.toLowerCase().indexOf(this.value.toLowerCase()) !== -1
            })
            d3.select('#searchResults').html('')
            d3.select('#searchResults').append('p').html(`Press the key 'enter'<br\>to focus on ${matchingNode.id}`)
            console.log("matching", matchingNode)
            s.zoomTo = matchingNode
        })
        .on("keypress", function () {
            if (d3.event.keyCode === 32 || d3.event.keyCode === 13) {

                const k = 8
                const tx = (s.screen.width / 2 - s.zoomTo.x * k) / s.screen.density
                const ty = (s.screen.height / 2 - s.zoomTo.y * k) / s.screen.density

                s.zoomState = d3.zoomIdentity
                    .translate(tx, ty)
                    .scale(k)

                s.canvas.transition()
                    .duration(2000)
                    .call(s.zoom.transform, s.zoomState);

            }
        })
}