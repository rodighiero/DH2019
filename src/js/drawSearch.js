import * as d3 from 'd3'
import { s } from './state'






// export const drawMatches = () => {
//     console.log("matching elements", s.matches.length);
//     s.context.beginPath()
//     s.context.fillStyle = d3.rgb(255,255,255)
//     s.matches.forEach(node => {
//         s.context.moveTo(node.x, node.y)
//         s.context.arc(node.x, node.y, 10, 0, 2 * Math.PI)
//     });
//     s.context.fill()
// }