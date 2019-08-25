import * as d3 from 'd3'

const fontSizeKeywords = 1.2

export let s = {

    distance: 20,
    densityData: [],
    zoomIdentity: null,
    screen: {},

    // Yellow d3.rgb(251, 253, 166)

    colors: {
        backgroundLeft: d3.rgb(255, 144, 104),
        backgroundRight: d3.rgb(253, 116, 108),
        // contours: d3.rgb(251, 253, 166), // Lemon
        contours: d3.rgb(251, 158, 129), // Pompelmus
        keywords: d3.rgb(100, 79, 39),
        nodes: d3.rgb(39, 72, 100), // Blue
    },

    style: {
        fontNodes: `bold 1.8pt Helvetica`
    },

    setScreen: () => {

        if ('devicePixelRatio' in window && window.devicePixelRatio > 1) {
            s.screen.density = window.devicePixelRatio
            console.log('screen density:', s.screen.density)
        }

        const body = document.querySelector('body')

        s.screen.width = body.clientWidth * s.screen.density
        s.screen.height = body.clientHeight * s.screen.density

        s.canvas = d3.select('#visualization')

        s.context = document.querySelector('#visualization').getContext('2d')
        s.context.scale(s.screen.density, s.screen.density)

        s.canvas
            .style('width', `${body.clientWidth}px`).style('height', `${body.clientHeight}px`)
            .attr('width', s.screen.width).attr('height', s.screen.height)

        d3.select('#background')
            .style('width', `${body.clientWidth}px`).style('height', `${body.clientHeight}px`)
            .attr('width', s.screen.width).attr('height', s.screen.height)

        const bgContext = document.querySelector('#background').getContext('2d', { alpha: false })
        
        const gradient = bgContext.createLinearGradient(0, 0, s.screen.width / 2, 0)
        
        gradient.addColorStop(0, s.colors.backgroundLeft)
        gradient.addColorStop(1, s.colors.backgroundRight)
        
        bgContext.fillStyle = gradient
        bgContext.fillRect(0, 0, s.screen.width, s.screen.height)

    },

    // setMatches: (matches) => {
    //     s.matches = matches;
    // },

}