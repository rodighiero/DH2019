import { s } from './state'

export default () => {

    const max = 1
    const d_min = Math.pow(s.distance, 2)
    const d_max = Math.pow(s.distance * 2, 2)
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

    for (let i = 0; i < s.links.length; i++) {

        const link = s.links[i]

        const deltaX = Math.abs(link.source.x - link.target.x)
        const deltaY = Math.abs(link.source.y - link.target.y)
        const distance = Math.pow(deltaX, 2) + Math.pow(deltaY, 2)

        if (d_min < distance && distance < d_max) {

            const x = deltaX / 2 + (link.source.x < link.target.x ? link.source.x : link.target.x)
            const y = deltaY / 2 + (link.source.y < link.target.y ? link.source.y : link.target.y)

            const tokens = Object.entries(link.tokens)
                .filter(token => {
                    const scale = s.keywordScale(token[1])
                    return (s.zoomState.k <= scale && scale <= s.zoomState.k + 2)
                })
                .filter(token => {
                    const width = s.context.measureText(token[0]).width * 1.1
                    const height = s.context.measureText('M').width * 1.5
                    const rect = [
                        x - width/2,
                        y - height/2,
                        width,
                        height
                    ]
                    const result = !overlap(rect)
                    return result
                })
                .slice(0, max)

            s.context.beginPath()
            s.context.fillStyle = s.colors.keywords
            s.context.textAlign = 'center'

            tokens.forEach(([key, value]) => {

                s.context.font = `normal 300 ${value * .1}pt Helvetica`
                // s.context.font = `normal 300 ${s.fontScale(value) * 100}pt Helvetica`
                s.context.fillText(key, x, y)

                const width = s.context.measureText(key).width * 1.1
                const height = s.context.measureText('M').width * 1.5
                const rect = [
                    x - width/2,
                    y - height/2,
                    width,
                    height
                ]

                rectangles.push(rect)
                // s.context.rect(...rect)

            })

            s.context.fill()

        }

    }

}