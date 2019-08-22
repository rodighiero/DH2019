import * as d3 from 'd3'

const fontSizeKeywords = 1.2

export let s = {

    distance: 30,
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
        fontKeywords: `normal 300 ${fontSizeKeywords}pt Helvetica`,
        lineHeightKeywords: fontSizeKeywords * 2,
        fontNodes: `bold 1.8pt Helvetica`
    },

    setScreen: () => {

        s.canvas = d3.select('canvas')
        s.context = document.querySelector('canvas').getContext('2d')
        s.context.scale(2,2)

        // if ('devicePixelRatio' in window && window.devicePixelRatio > 1)
        //     s.screen.density = window.devicePixelRatio
        // desnsity is set at 1 to simplifying coding at this moment

        s.screen.density = 1
        const div = document.getElementById('simulation')
        s.screen.width = div.clientWidth * s.screen.density
        s.screen.height = div.clientHeight * s.screen.density

        s.canvas
            .style('width', `${div.clientWidth}px`).style('height', `${div.clientHeight}px`)
            .attr('width', s.screen.width).attr('height', s.screen.height)

        s.gradient = s.context.createLinearGradient(0, 0, s.screen.width / 2, 0)
        s.gradient.addColorStop(0, s.colors.backgroundLeft)
        s.gradient.addColorStop(1, s.colors.backgroundRight)

    },

    // setMatches: (matches) => {
    //     s.matches = matches;
    // },

}