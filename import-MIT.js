
/////////////////////////////
// Libraries
/////////////////////////////

const beautify = require('beautify')
const fs = require('fs')
const path = require('path')
const convert = require('xml-js')
const fetch = require('request-promise');
const theses = require('./data/MIT/theses.json')


/////////////////////////////
// Collect URLs and filter them
/////////////////////////////

const urls = Object.entries(theses).reduce((urls, entry) => {
    const key = entry[0]
    const value = entry[1]

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
            console.log('Received', url)
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
    let counter = 1

    for (let url of urls) {

        console.log('Parsing url', counter++)

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

    console.log('Received documents', docs.length)

    // Filter by unique ID
    docs = Object.values(docs.reduce((obj, el) => Object.assign(obj, { [el.id]: el }), {}))

    console.log('Unique documents', docs.length)






    /////////////////////////////
    // Writing docs.json
    /////////////////////////////

    const format = json => beautify(JSON.stringify(json), { format: 'json' })
    const setComma = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    let fileName = path.resolve(__dirname, `./data/docs-MIT.json`)
    
    fs.writeFile(fileName, format(docs), err => {
        if (err) throw err
        console.log('Size of docs.json', setComma(format(docs).length), 'kb')
    })

}