import contours from './drawContours'
import keywords from './drawKeywords'
import nodes from './drawNodes'

export default () => {

    const x = s.zoomIdentity.x * s.screen.density
    const y = s.zoomIdentity.y * s.screen.density
    const k = s.zoomIdentity.k

    s.context.save()

    s.context.clearRect(0, 0, s.screen.width, s.screen.height)
    s.context.translate(x, y)
    s.context.scale(k, k)

    contours()
    keywords()
    nodes()

    s.context.restore()

}