// import * as d3 from 'd3'

// const dragsubject = () => {
//     const x = transform.invertX(event.x * s.screen.density),
//         y = transform.invertY(event.y * s.screen.density),
//         radius = 30

//     for (let i = s.graph.nodes.length - 1; i >= 0; --i) {
//         const node = s.graph.nodes[i],
//             dx = x - node.x,
//             dy = y - node.y
//         if (dx * dx + dy * dy < radius * radius) return node
//     }
// }
// const dragstarted = () => {
//     if (!event.active) simulation.alphaTarget(0.2).restart()
//     event.subject.fx = transform.invertX(event.x)
//     event.subject.fy = transform.invertY(event.y)
// }
// const dragged = () => {
//     event.subject.fx = transform.invertX(event.x)
//     event.subject.fy = transform.invertY(event.y)
// }
// const dragended = () => {
//     if (!event.active) simulation.alphaTarget(0)
//     event.subject.fx = null
//     event.subject.fy = null
// }

// s.canvas.call(drag().subject(dragsubject)
//     .on('start', dragstarted).on('drag', dragged).on('end', dragended))

