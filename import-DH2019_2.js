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
id=0

$('TEI').map((i, doc) => {
    obj = {}

    // ID
    id += 1
    obj.id = id
    
    // Title
    const title = $(doc).find('title').text().replace(/(<([^>]+)>)/ig, ' ').replace(/\s\s+/g, '')
    obj.title = title

    // Authors
    const authors = $(doc).find('author').children()//.text().replace(/\s\s+/g, ' ')
    authors_list = []
    authors.each(function(i, elem) {
        if (i%3==0){ // author name only
            authors_list[i] = $(this).text().replace(/\s\s+/g, ' ').trim();
        }
    })
    obj.authors = authors_list.filter(Boolean)

    // Advisors: Authors (temporary placeholder)
    obj.advisors = obj.authors

    // Body 
    const body = ($(doc).find('text').text().replace(/(<([^>]+)>)/ig, '')
                    .replace(/(?:https?):\/\/[\n\S]+/g, '') // removes all https://
                    .replace(/(www?\.[^\s]+|[a-zA-Z0-9._-]+\.com+)/g,"") // removes all www. and ....com
                    .replace(/\s\s+/g, ' ') // removes whitespaces
                    .replace(/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+/g,''))//removes emails (...@...) 
    obj.body = body

    docs.push(obj)
})


/////////////////////////////
// Writing docs.json
/////////////////////////////

const format = json => beautify(JSON.stringify(json), { format: 'json' })
const setComma = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
let fileName = path.resolve(__dirname, `./data/docs-DH2019_2.json`)

fs.writeFile(fileName, format(docs), err => {
    if (err) throw err
    console.log('Size of docs.json', setComma(format(docs).length), 'kb')
})
