
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

const keyword_extractor = require("keyword-extractor")



/////////////////////////////
// Collect URLs and filter them
/////////////////////////////

const urls = Object.entries(theses).reduce((urls, entry) => {
    const key = entry[0]
    const value = entry[1]

    // Filter on URLs
    // if (value.includes('Computer')) // 122 Advisors
    // if (value.includes('Architecture')) // 122 Advisors
        if (value.includes('Ph.D.')) // 691 Advisors
        // if (value.includes('Astronautics')) // 69 Advisors
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

    console.log('Number of urls ', urls.length)

    console.log('Number of all documents ', docs.length)

    // Filter by unique ID
    docs = Object.values(docs.reduce((obj, el) => Object.assign(obj, { [el.id]: el }), {}))

    console.log('Number of unique documents ', docs.length)



    


    /////////////////////////////
    // Writing docs.json
    /////////////////////////////

    console.log()
    console.log('          Files =>')

    const directory = './src/data'
    const format = json => beautify(JSON.stringify(json), { format: 'json' })
    const setComma = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    let fileName

    fileName = path.resolve(__dirname, `${directory}/docs.json`)
    fs.writeFile(fileName, format(docs), err => {
        if (err) throw err
        console.log('                     docs :', setComma(format(docs).length), 'kb /', docs.length, 'records')
    })

}