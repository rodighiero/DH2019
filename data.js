
/////////////////////////////
// Libraries
/////////////////////////////

const beautify = require('beautify')
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
const theses = require('./theses.json')



/////////////////////////////
// Collect URLs and filter them
/////////////////////////////

const urls = Object.entries(theses).reduce((urls, entry) => {
    const key = entry[0]
    const value = entry[1]

    // Filter on URLs
    // if (value.includes('Computer')) // 122 Advisors
    // if (value.includes('Ph.D.')) // 691 Advisors
    if (value.includes('Astronautics')) // 69 Advisors
        urls.push(`https://dspace.mit.edu/oai/request?verb=ListRecords&metadataPrefix=mets&set=${key}`)
    return urls

}, [])



/////////////////////////////
// Call URLs
/////////////////////////////

Promise.all(urls
    .map(url => fetch(url)
        .then(xml => {
            console.log('Got', url)
            return xml
        })
        .catch(err => console.log(err))
    ))
    .then(result => start(result))
    .catch(err => console.log(err))



/////////////////////////////
// Start
/////////////////////////////

const start = urls => {

    /////////////////////////////
    // Parsing XML
    /////////////////////////////

    let docs = []

    for (let url of urls) {

        const json = JSON.parse(convert.xml2json(url, {
            compact: true,
            spaces: 4,
            trim: true,
        }))

        const list = json['OAI-PMH'].ListRecords
        if (!list) continue
        const records = json['OAI-PMH'].ListRecords.record
        if (!records) continue
        for (let record of records) {

            const _doc = {}

            // id
            const id = record.header.identifier
            if (!id) continue
            else _doc.id = id._text

            // check metadata
            const metadata = record.metadata
            if (!metadata) continue
            // check mets
            const mets = record.metadata.mets
            if (!mets) continue

            // title
            const title = mets.dmdSec.mdWrap.xmlData['mods:mods']['mods:titleInfo']['mods:title']
            if (!title) continue
            else _doc.title = title._text

            // abstract
            const abstract = mets.dmdSec.mdWrap.xmlData['mods:mods']['mods:abstract']
            if (!abstract) continue
            else if (abstract.length) {
                _doc.abstract = abstract.reduce((string, text) => {
                    return string += `${text._text} `
                }, '')
            } else {
                _doc.abstract = abstract._text
            }

            // authors
            const authorships = mets.dmdSec.mdWrap.xmlData['mods:mods']['mods:name']

            for (let authorship of authorships) {

                // Filter by keeping just "advisor"
                if (authorship['mods:role']['mods:roleTerm']._text !== 'advisor') continue

                // Cleaning
                let a = authorship['mods:namePart']._text
                a = a.replace(/\.$/, '') // Delete dot at the end
                a = a.replace(' and ', '___')
                a = a.replace(',', '___')
                a = a.split('___') // Split by author
                a = a.filter(item => item.length > 5) // Remove very short names
                _doc.advisors = a

            }

            // text
            _doc.text = `${_doc.title} ${_doc.abstract}`

            // console.log(_doc)
            docs.push(_doc)

        }

    }

    // Filter by unique ID
    docs = Object.values(docs.reduce((obj, el) =>
        Object.assign(obj, { [el.id]: el }), {}))

    console.log('* Length of urls ', urls.length)
    console.log('* Length of documents ', docs.length)



    /////////////////////////////
    // Assemble by advisor
    /////////////////////////////

    let advisors = []

    for (let doc of docs) {
        if (!doc.advisors) continue // Skip empty advisors
        for (let advisor of doc.advisors) {
            const hasAdvisor = advisors.some(adv => adv.id === advisor)
            if (hasAdvisor) {
                // Append text to the advisor
                let _advisor = advisors.filter(adv => adv.id === advisor)
                _advisor[0].docs++
                _advisor[0].text += doc.text + ' '
            } else {
                // Create the advisor
                advisors.push({
                    id: advisor,
                    docs: 1,
                    text: doc.text + ' ',
                })
            }
        }
    }


    /////////////////////////////
    // Merging mispelled authors
    /////////////////////////////

    for (let i = 0; i < advisors.length - 1; i++) {
        for (let j = i + 1; j < advisors.length; j++) {
            if (natural.DiceCoefficient(advisors[i].id, advisors[j].id) > .5) {
                // console.log(advisors[i].id, ' - ', advisors[j].id,
                //     natural.DiceCoefficient(advisors[i].id, advisors[j].id))
                // console.log(advisors[i])
                // Increase counter
                advisors[i].docs = advisors[i].docs + advisors[j].docs
                // Merge texts
                advisors[i].text = advisors[i].text + ' ' + advisors[j].text
                // Remove second advisor
                advisors = advisors.slice(0, j).concat(advisors.slice(j + 1, advisors.length))
                // Reset j position
                j = j - 1
                // console.log(advisors[i])
            }

        }
    }





    /////////////////////////////
    // Set items for the network
    /////////////////////////////

    const items = advisors

    /////////////////////////////
    // Tokenization
    /////////////////////////////

    // natural.PorterStemmer.attach() // Perter stemmer
    natural.LancasterStemmer.attach() // Lancaster stemmer
    items.forEach( item => {
        item.tokens = item.text.tokenizeAndStem()
    })



    /////////////////////////////
    // Lexical analysis
    /////////////////////////////

    const maxLimit = 10 // Limit for keywords

    // items.forEach(item => tfidf.addDocument(item.text)) // Send text
    items.forEach(item => tfidf.addDocument(item.tokens)) // Send tokens
    

    items.forEach((item, i) => { // Writing computation terms in items
        item.terms = tfidf.listTerms(i)
            .reduce((obj, element) => {
                if (element.tfidf > maxLimit)
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
        nodes: items.map(item => {
            return {
                'id': item.id,
                'docs': item.docs,
                'terms': item.terms
            }
        }),
        links: []
    }

    pairs.forEach(pair => {

        const terms = Object.keys(pair[0].terms)
            .filter(n => Object.keys(pair[1].terms).includes(n))

        terms.forEach(term => {

            // Check of the link exists or not
            const link = network.links.filter(link =>
                link.s === pair[0].id && link.t === pair[1].id
            )

            if (link.length > 0) {
                // console.log()
                // console.log(link[0].v)
                link[0].v += pair[0].terms[term] + pair[1].terms[term]
                // console.log(link[0].v)
            } else {
                network.links.push({
                    s: pair[0].id,
                    t: pair[1].id,
                    v: pair[0].terms[term] + pair[1].terms[term],
                })
            }


        })
    })

    // Normalize values between [0,1]
    const max = network.links.reduce((max, link) => max > link.v ? max : link.v, 0)
    network.links.forEach(link => link.v = link.v / max)



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

    console.log()
    console.log('          Files =>')

    const directory = './src/data'
    const format = json => beautify(JSON.stringify(json), { format: 'json' })
    const setComma = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    let fileName

    fileName = path.resolve(__dirname, `${directory}/network.json`)
    fs.writeFile(fileName, format(network), err => {
        if (err) throw err
        console.log('                  network :', setComma(format(network).length), 'kb /', network.nodes.length, 'records')
    })

    fileName = path.resolve(__dirname, `${directory}/advisors.json`)
    fs.writeFile(fileName, format(advisors), err => {
        if (err) throw err
        console.log('                 advisors :', setComma(format(advisors).length), 'kb /', advisors.length, 'records')
    })

    fileName = path.resolve(__dirname, `${directory}/docs.json`)
    fs.writeFile(fileName, format(docs), err => {
        if (err) throw err
        console.log('                     docs :', setComma(format(docs).length), 'kb /', docs.length, 'records')
    })

    // fileName = path.resolve(__dirname, `${directory}/url.json`)
    // fs.writeFile(fileName, format(urls), err => {
    //     if (err) throw err
    //     console.log('                     urls :', setComma(format(urls).length), 'kb /', urls.length, 'records')
    // })

}