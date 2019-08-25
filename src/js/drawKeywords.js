import { s } from './state'

export default () => {

    // s.linkValues {min: 7.820611550786564, max: 610.3364542990106}
    // Zoom Extent [.3, 10]
    // Keyword extent [, 4562]

    // console.log(s.zoomIdentity)
    // s.keywordScale

    const max = 1
    const d_min = Math.pow(s.distance * 1.5, 2)
    const d_max = Math.pow(s.distance * 2.5, 2)

    s.links.forEach(link => {

        const deltaX = Math.abs(link.source.x - link.target.x)
        const deltaY = Math.abs(link.source.y - link.target.y)
        const distance = Math.pow(deltaX, 2) + Math.pow(deltaY, 2)

        if ((d_min < distance) && (distance < d_max)) {

            const x = deltaX / 2 + (link.source.x < link.target.x ? link.source.x : link.target.x)
            const y = deltaY / 2 + (link.source.y < link.target.y ? link.source.y : link.target.y)

            const tokens = Object.entries(link.tokens).slice(0, max)

            s.context.beginPath()
            s.context.fillStyle = s.colors.keywords
            s.context.textAlign = 'center'

            for (const [key, value] of tokens) {
                s.context.font = `normal 300 ${value * .05}pt Helvetica`
                s.context.fillText(key, x, y)
            }

            s.context.fill()

        }

    })

}