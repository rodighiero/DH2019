const fs = require('fs')
const path = require('path')
const combinatorics = require('js-combinatorics')
const beautify = require('beautify')
const natural = require('natural')
const franc = require('franc-min')
const d3 = require('d3')
const https = require('https')
const xml2js = require('xml2js')
const parser = new xml2js.Parser({
    // explicitArray: false,
    // ignoreAttrs: true,
    tagNameProcessors: [stripPrefix],
    // valueProcessors: [attrValueProcessors],
})

// Keep the part of the tag after the colon
function stripPrefix(tag) {
    return tag.split(':').pop()
}

// function attrValueProcessors(value) {
//     console.log(typeof(value))
//     return value
// }



const writeDocs = path.resolve(__dirname, './src/data/docs.json')
const writeNetwork = path.resolve(__dirname, './src/data/network.json')

const url = 'https://dspace.mit.edu/oai/request?verb=ListRecords&metadataPrefix=mets&set=hdl_1721.1_39094'

https.get(url, xml => {
    let data = ''
    xml.on('data', _data =>
        data += _data.toString()
    )
    xml.on('end', () => {
        parser.parseString(data, (err, result) =>
            start(result)
        )
    })
})

const start = data => {

    /////////////////////////////
    // Parsing in variable 'doc'
    /////////////////////////////

    data = data['OAI-PMH'].ListRecords[0].record

    let docs = data.reduce((docs, doc) => {
        const mods = doc.metadata[0].mets[0].dmdSec[0].mdWrap[0].xmlData[0].mods[0]
        // console.log(mods)
        if (typeof (mods.abstract) !== 'undefined') {
            const _doc = {}
            _doc.id = doc.header[0].identifier[0]
            _doc.title = mods.titleInfo[0].title[0]
            _doc.abstract = mods.abstract[0]
            mods.name.forEach(element => {
                _doc[element.role[0].roleTerm[0]._] = element.namePart[0]
                // console.log(element.role[0].roleTerm[0]._)
                // console.log(element.namePart[0])
            })
            docs.push(_doc)
        }
        return docs
    }, [])

    // console.log(docs)



    /////////////////////////////
    // Natural lexical analysis
    /////////////////////////////

    const tfidf = new natural.TfIdf()
    const limitValue = 3 // Set the limit of interest of keywords

    docs.forEach(doc => {
        const text = `${doc.title} ${doc.abstract}`
        tfidf.addDocument(text)
    })

    // Set terms and their weights
    docs.forEach((doc, index) => {
        doc.terms = tfidf.listTerms(index).reduce((object, element) => {
            if (element.tfidf > limitValue)
                object[element.term] = element.tfidf
            return object
        }, {})
    })



    /////////////////////////////
    // Set arrays
    /////////////////////////////

    let terms = []
    
    // Set arrays for authors, keywords, and keywords_tfidf
    docs.forEach(doc => {
        if (doc.terms) terms.push(...Object.keys(doc.terms))
    })

    // Claning doubles
    terms = terms.sort().filter((value, index, array) => array.indexOf(value) === index)



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

        // Terms
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
    const max = network.links.reduce((int, link) => {
        return int > link.v ? int : link.v
    }, 0)

    network.links.forEach(link => link.v = Math.round(link.v / max * 100) / 100)



    /////////////////////////////
    // Report
    /////////////////////////////

    console.log('')
    console.log('     --- Report ---')
    console.log('')
    console.log('           docs :', docs.length + '/' + data.length)
    console.log('          terms :', terms.length)
    console.log('          pairs :', pairs.length)
    console.log('          links :', network.links.length)
    console.log('          nodes :', network.nodes.length)




    /////////////////////////////
    // File writing and size
    /////////////////////////////

    const thousandSeparation = x =>
        x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    const _docs = beautify(JSON.stringify(docs), {
        format: 'json'
    })
    fs.writeFile(writeDocs, _docs, (err) => {
        if (err) throw err
        console.log('      docs.json :', thousandSeparation(_docs.length), 'kb')
    })

    const _network = JSON.stringify(network)
    fs.writeFile(writeNetwork, _network, (err) => {
        if (err) throw err
        console.log('   network.json :', thousandSeparation(_network.length), 'kb')
    })

}