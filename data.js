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

const docsFile = path.resolve(__dirname, './src/data/docs.json')
const networkFile = path.resolve(__dirname, './src/data/network.json')


// Filter URLs by title
const filtered = {}

Object.entries(thesesData).forEach(entry => {
    const key = entry[0]
    const value = entry[1]
    if (value.includes('Biological')) filtered[key] = value
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
            else {
                if (abstract.length) {
                    _doc.abstract = abstract.reduce((string, text) => {
                        return string += `${text._text} `
                    }, '')
                } else {
                    _doc.abstract = abstract._text
                }
            }

            // authors
            const author = record.metadata.mets.dmdSec.mdWrap.xmlData['mods:mods']['mods:name']
            author.forEach(author => {
                // console.log(author['mods:role'])
                _doc[author['mods:role']['mods:roleTerm']._text] = author['mods:namePart']._text
            })

            // text
            _doc.text = `${_doc.title} ${_doc.abstract}`

            // console.log(_doc)
            docs.push(record)

        }


    }


    console.log('records length', docs.length)

    return



    /////////////////////////////
    // Chloe Update 04/07/2019
    // Trying to make each node as each professor
    /////////////////////////////

    let professors = docs.reduce((professors, prof) => {

        docs.forEach(doc => {
            //console.log(doc.author)
            const _prof = {}

            // go through the docs array and check if the author is already in the
            // professor array. If not,
            let hasThisAdvisor = professors.some(prof => prof.id === doc.advisor)

            if (!hasThisAdvisor) { // if author doesn't exist
                _prof.id = doc.advisor
                const _theses = docs.filter(doc => doc.advisor === _prof.id)

                _prof.text = _theses.reduce((text, thesis) => {
                    // console.log(thesis)
                    return text += thesis.text + ' '
                }, '')

                // _prof.abstractSum += docs.abstract + ' '
                //console.log(_prof.id,_prof.theses.length)
                // will return all objects in docs array where author = that prof's id
                professors.push(_prof)
            }
        })
        return professors
    }, [])

    //console.log(professors)

    /////////////////////////////
    // Set items
    /////////////////////////////

    const items = professors


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

    console.log('')
    console.log('         Arrays =>')
    console.log('')
    console.log('           docs :', docs.length)
    console.log('     professors :', professors.length)
    console.log('          items :', items.length)
    console.log()
    console.log('        Network =>')
    console.log()
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

};
