import * as d3 from 'd3'
import combinatorics from 'js-combinatorics'

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

    setLinks: links => {
        s.links = links.map(link => {
            link['source'] = link.s, link['target'] = link.t, link['value'] = link.v
            delete link.s, delete link.t, delete link.v
        })
    },

    setNodes: nodes => {
        s.nodes = nodes
    },

    // setMatches: (matches) => {
    //     s.matches = matches;
    // },

}