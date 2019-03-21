/////////////////////////////
// Libraries
/////////////////////////////

const beautify = require('beautify')
// const d3 = require('d3')
const combinatorics = require('js-combinatorics')
// const franc = require('franc-min')
const fs = require('fs')
const https = require('https')
const path = require('path')

// tfidf
const natural = require('natural')
const tfidf = new natural.TfIdf()

// xml2js
const xml2js = require('xml2js')
const parser = new xml2js.Parser({
    tagNameProcessors: [stripPrefix],
})
// Keep the part of the tag after the colon
function stripPrefix(tag) {
    return tag.split(':').pop()
}



/////////////////////////////
// Variables
/////////////////////////////

const docsFile = path.resolve(__dirname, './src/data/docs.json')
const networkFile = path.resolve(__dirname, './src/data/network.json')
const url = 'https://dspace.mit.edu/oai/request?verb=ListRecords&metadataPrefix=mets&set=hdl_1721.1_39094'



/////////////////////////////
// Load data
/////////////////////////////

https.get(url, xml => {
    let data = ''
    xml.on('data', _data => data += _data.toString())
    xml.on('end', () => parser.parseString(data, (err, result) => start(result)))
})



const start = data => {



    /////////////////////////////
    // Parsing
    /////////////////////////////

    const records = data['OAI-PMH'].ListRecords[0].record

    let docs = records.reduce((docs, doc) => {

        const mods = doc.metadata[0].mets[0].dmdSec[0].mdWrap[0].xmlData[0].mods[0]

        const addDocument = () => {
            const _doc = {}
            _doc.id = doc.header[0].identifier[0]
            _doc.title = mods.titleInfo[0].title[0]
            _doc.abstract = mods.abstract[0]
            mods.name.forEach(author => _doc[author.role[0].roleTerm[0]._] = author.namePart[0])
            docs.push(_doc)
        }

        if (mods.abstract) addDocument()

        return docs

    }, [])



    /////////////////////////////
    // Lexical analysis
    /////////////////////////////

    const limitValue = 4 // Limit for keywords

    docs.forEach(doc => {
        tfidf.addDocument(`${doc.title} ${doc.abstract}`)
    })

    // Set terms and their weights
    docs.forEach((doc, index) => {

        const list = tfidf.listTerms(index)

        doc.terms = list.reduce((obj, element) => {
            if (element.tfidf > limitValue)
                obj[element.term] = element.tfidf
            return obj
        }, {})

    })



    /////////////////////////////
    // Set terms list
    /////////////////////////////

    // let terms = []
    // docs.forEach(doc => {
    //     if (doc.terms) terms.push(...Object.keys(doc.terms))
    // })
    // // Claning doubles
    // terms = terms.sort().filter((value, index, array) => array.indexOf(value) === index)



    /////////////////////////////
    // Set pairs
    /////////////////////////////

    const pairs = combinatorics.bigCombination(docs, 2)



    /////////////////////////////
    // Set nodes and links
    /////////////////////////////

    const network = {
        nodes: docs,
        links: []
    }

    pairs.forEach(pair => {

        const terms = Object.keys(pair[0].terms)
            .filter(n => Object.keys(pair[1].terms).includes(n))

        terms.forEach(term => {
            network.links.push({
                s: pair[0].id,
                t: pair[1].id,
                v: pair[0].terms[term] + pair[1].terms[term],
            })
        })
    })

    // Normalize the value between [0,1]
    const max = network.links.reduce((max, link) => max > link.v ? max : link.v, 0)
    network.links.forEach(link => link.v = Math.round(link.v / max * 100) / 100)



    /////////////////////////////
    // Report
    /////////////////////////////

    console.log('')
    console.log('     --- Report ---')
    console.log('')
    console.log('           docs :', docs.length + '/' + data.length)
    // console.log('          terms :', terms.length)
    console.log('          pairs :', pairs.length)
    console.log('          links :', network.links.length)
    console.log('          nodes :', network.nodes.length)




    /////////////////////////////
    // File writing and size
    /////////////////////////////

    const setComma = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    const _d = beautify(JSON.stringify(docs), { format: 'json' })

    fs.writeFile(docsFile, _d, (err) => {
        if (err) throw err
        console.log('      docs.json :', setComma(_d.length), 'kb')
    })

    const _n = beautify(JSON.stringify(network), { format: 'json' })

    fs.writeFile(networkFile, _n, (err) => {
        if (err) throw err
        console.log('   network.json :', setComma(_n.length), 'kb')
    })

}