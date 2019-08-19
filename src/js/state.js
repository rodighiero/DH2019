import * as d3 from 'd3'

// const s

export let s = {

    densityData: [],
    distance: 30,
    zoomIdentity: null,
    screen: {},

    setScreen: () => {

        s.canvas = d3.select('canvas')
        s.context = document.querySelector('canvas').getContext('2d')

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

    },

    // setMatches: (matches) => {
    //     s.matches = matches;
    // },

}