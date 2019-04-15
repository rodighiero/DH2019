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
const convert = require('xml-js')
const fetch = require('request-promise');

// tfidf
const natural = require('natural')
const tfidf = new natural.TfIdf() // term frequency inverse doc frequency

// data
const thesesData = require('./theses.json')



/////////////////////////////
// Variables
/////////////////////////////

// Filter URLs by title
const filtered = {}

Object.entries(thesesData).forEach(entry => {
    const key = entry[0]
    const value = entry[1]
    if (value.includes('Comparative')) filtered[key] = value
})

// Filtered keys
const filteredKeys = Object.keys(filtered)
// Full keys
// const filteredKeys = Object.keys(thesesData)

const urls = filteredKeys.map(i => `https://dspace.mit.edu/oai/request?verb=ListRecords&metadataPrefix=mets&set=${i}`)

// let counter = 0

Promise.all(urls
    .map(url => fetch(url)
        .then(xml => {
            // counter++
            // console.log('URL', counter)
            return xml
        })
        .catch(err => {
            // console.log(err)
        })
    ))
    .then(result => {
        console.log(result.length)
        start(result)
    })
    .catch(err => {
        console.log(err)
    })


// Computation

const start = data => {



    /////////////////////////////
    // Parsing XML
    /////////////////////////////

    let docs = []

    for (let xml of data) {

        const json = JSON.parse(convert.xml2json(xml, {
            compact: true,
            spaces: 4,
            trim: true,
        }))

        const list = json['OAI-PMH'].ListRecords
        if (!list) continue
        else for (let record of list.record) {

            const _doc = {}

            // id
            const id = record.header.identifier
            if (!id) continue
            else _doc.id = id._text

            // title
            const title = record.metadata.mets.dmdSec.mdWrap.xmlData['mods:mods']['mods:titleInfo']['mods:title']
            if (!title) continue
            else _doc.title = title._text

            // abstract
            const abstract = record.metadata.mets.dmdSec.mdWrap.xmlData['mods:mods']['mods:abstract']
            if (!abstract) continue
            else if (abstract.length) {
                _doc.abstract = abstract.reduce((string, text) => {
                    return string += `${text._text} `
                }, '')
            } else {
                _doc.abstract = abstract._text
            }

            // authors
            const author = record.metadata.mets.dmdSec.mdWrap.xmlData['mods:mods']['mods:name']
            author.forEach(author => {
                console.log()
                console.log()
                console.log()
                console.log(author)
                console.log(author['mods:namePart'])

                // Filter by keeping just "advisor"
                // Remove the dot at the end
                // Check if there is " and "
                // if yes, split by " and "
                // write the data as an array _doc.advisor = [adv1, adv2, etc.] or [adv1]


                _doc[author['mods:role']['mods:roleTerm']._text] = author['mods:namePart']._text
            })

            // text
            _doc.text = `${_doc.title} ${_doc.abstract}`

            // console.log(_doc)
            docs.push(_doc)

        }


    }

    // console.log('records #1', docs[0])



    /////////////////////////////
    // Assemble by advisor
    /////////////////////////////

    let advisors = []

    for (let doc of docs) {

        // Check if advisor already exists
        const hasAdvisor = advisors.some(adv => adv.id === doc.advisor)
        if (hasAdvisor) continue

        // Create advisor
        const _adv = {}

        _adv.id = doc.advisor

        const _theses = docs.filter(doc => doc.advisor === _adv.id)
        _adv.text = _theses.reduce((text, thesis) => {
            // console.log(thesis)
            return text += thesis.text + ' '
        }, '')

        advisors.push(_adv)
    }

    // console.log('advisor #1', advisors[0])



    /////////////////////////////
    // Set items
    /////////////////////////////

    const items = advisors


    /////////////////////////////
    // Lexical analysis
    /////////////////////////////

    const limitValue = 15 // Limit for keywords

    items.forEach(item => {
        tfidf.addDocument(item.text)
    })


    /////////////////////////////
    // Set terms and their weights
    /////////////////////////////

    items.forEach((item, index) => {

        const list = tfidf.listTerms(index)

        item.terms = list.reduce((obj, element) => {
            if (element.tfidf > limitValue)
                obj[element.term] = element.tfidf
            return obj
        }, {})

    })


    /////////////////////////////
    // Set pairs
    /////////////////////////////

    const pairs = combinatorics.bigCombination(items, 2)



    /////////////////////////////
    // Set network.json
    /////////////////////////////

    const network = {
        nodes: items, // can chance this to professors
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

    // Normalize values between [0,1]
    const max = network.links.reduce((max, link) => max > link.v ? max : link.v, 0)
    network.links.forEach(link => link.v = Math.round(link.v / max * 100) / 100)



    /////////////////////////////
    // Report
    /////////////////////////////

    console.log()
    console.log('         Arrays =>')
    console.log('                     docs :', docs.length)
    console.log('                 advisors :', advisors.length)
    console.log()
    console.log('        Network =>')
    console.log('                    pairs :', pairs.length)
    console.log('                    links :', network.links.length)
    console.log('                    nodes :', network.nodes.length)



    /////////////////////////////
    // Writing network.json
    /////////////////////////////

    const directory = './src/data'
    const format = json => beautify(JSON.stringify(json), { format: 'json' })
    const setComma = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    const networkFile = path.resolve(__dirname, `${directory}/network.json`)
    fs.writeFile(networkFile, format(network), err => {
        if (err) throw err
        console.log('                     size :', setComma(format(network).length), 'kb')
    })

}
