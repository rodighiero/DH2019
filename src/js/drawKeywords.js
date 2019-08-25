import { s } from './state'

export default () => {

    const max = 1
    const d_min = Math.pow(s.distance * 1.5, 2)
    const d_max = Math.pow(s.distance * 2.5, 2)
    let rectangles = []

    const overlap = current => {
        let result = false
        rectangles.forEach(previous => {
            if (current[0] < previous[0] + previous[2] &&
                current[0] + current[2] > previous[0] &&
                current[1] < previous[1] + previous[3] &&
                current[1] + current[3] > previous[1]) {
                result = true
            }
        })
        return result
    }

    // const outside = (x, y) => {
    //     let result = false
    //     const invertX = s.zoomIdentity.invertX(x) * s.screen.density
    //     const invertY = s.zoomIdentity.invertY(y) * s.screen.density
    //     if (invertX < 0 || invertX > s.screen.width || invertY < 0 || invertX > s.screen.height) {
    //         result = true
    //     }
    //     console.log(result, invertX, invertY)
    //     return result
    // }

    // s.links.forEach(link => {
    for (let i = 0; i < s.links.length; i++) {

        const link = s.links[i]

        const deltaX = Math.abs(link.source.x - link.target.x)
        const deltaY = Math.abs(link.source.y - link.target.y)
        const distance = Math.pow(deltaX, 2) + Math.pow(deltaY, 2)

        if (d_min < distance && distance < d_max) {

            const x = (deltaX / 2 + (link.source.x < link.target.x ? link.source.x : link.target.x))
            const y = (deltaY / 2 + (link.source.y < link.target.y ? link.source.y : link.target.y))

            // if (outside(x, y)) continue

            const tokens = Object.entries(link.tokens)
                .filter(token => {
                    const scale = s.keywordScale(token[1])
                    return (s.zoomIdentity.k <= scale && scale <= s.zoomIdentity.k + 2)
                })
                .filter(token => {
                    const rect = [
                        x,
                        y,
                        s.context.measureText(token[0]).width * 1.1,
                        s.context.measureText('M').width * 1.8
                    ]
                    const result = !overlap(rect)
                    return result
                })
                .slice(0, max)

            s.context.beginPath()
            s.context.fillStyle = s.colors.keywords
            s.context.textAlign = 'center'

            tokens.forEach(([key, value]) => {

                s.context.font = `normal 300 ${value * .08}pt Helvetica`
                s.context.fillText(key, x, y)

                const rect = [
                    x,
                    y,
                    s.context.measureText(key).width * 1.1,
                    s.context.measureText('M').width * 1.8
                ]

                rectangles.push(rect)
                // s.context.rect(...rect)

            })

            s.context.fill()

        }

    }

}