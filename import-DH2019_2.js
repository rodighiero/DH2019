
/////////////////////////////
// Libraries
/////////////////////////////

const beautify = require('beautify');
const fs = require('fs');
const path = require('path');
// const convert = require('xml-js');
const cheerio = require('cheerio')



/////////////////////////////
// Importing and Parsing XMLs to JSON
/////////////////////////////

const data = fs.readFileSync('./data/DH2019/dh2019.xml')
const $ = cheerio.load(data)

docs = []

$('TEI').map((i, doc) => {

    obj = {}

    // ID
    
    // Title
    const title = $(doc).find('title').text().replace(/\s\s+/g, ' ')
    obj.title = title
    
    // Authors
    const authors = $(doc).find('author').text().replace(/\s\s+/g, ' ')
    obj.authors = authors
    
    // Body
    const body = $(doc).find('text').text().replace(/\s\s+/g, ' ')
    obj.body = body

    docs.push(obj)
})



/////////////////////////////
// Writing docs.json
/////////////////////////////

const format = json => beautify(JSON.stringify(json), { format: 'json' })
const setComma = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
let fileName = path.resolve(__dirname, `./data/docs-DH2019_2.json`)

// fs.writeFile(fileName, format(docs), err => {
//     if (err) throw err
//     console.log('Size of docs.json', setComma(format(docs).length), 'kb')
// })

fs.writeFile(fileName, format(docs), err => {
    if (err) throw err
    console.log('Size of json.json', setComma(format(docs).length), 'kb')
})