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
const $ = cheerio.load(data, {
    normalizeWhitespace: false,
    decodeEntities: true,
})

docs = []
id = 0

$('TEI').each((i, doc) => {

    let obj = {}

    // ID
    obj.id = id += 1


    /////////////
    // Title
    /////////////

    let $title = $(doc).find('titleStmt').find('title')
    let title = $title.text()
        .replace(/(<([^>]+)>)/ig, ' ')
        .replace(/\s\s+/g, '')

    // Strange bug without visible solution
    if (title.includes('BigSense')) title = 'BigSense: a Word Sense Disambiguator for Big Data'

    console.log(title)

    obj.title = title


    /////////////
    // Authors
    /////////////

    const authors = $(doc).find('author').children()//.text().replace(/\s\s+/g, ' ')
    let authors_list = []
    authors.each(function (i, elem) {
        if (i % 3 == 0) { // author name only
            authors_list[i] = $(this).text().replace(/\s\s+/g, ' ').trim();
        }
    })

    // Remove empty field
    authors_list = authors_list.filter(el => {
        return el != null && el != ''
    });

    // Strange bug without visible solution
    if (title.includes('BigSense')) authors_list = authors_list.slice(0, 4)

    console.log(authors_list.length)

    obj.authors = authors_list.filter(Boolean)


    /////////////
    // Body
    /////////////

    let $body = $(doc).find('text')
    $body.find('back').remove()

    const body = $body.text()
        .replace(/\s\s+/g, ' ') // removes whitespaces
        .replace(/ *\([^)]*\) */g, "") // remove parentheses
        .replace(/['"‘’“”]+/g, '') // remove inverted commas

    // const body_clean = ($body.text().replace(/(<([^>]+)>)/ig, '')
    //                 .replace(/(?:https?):\/\/[\n\S]+/g, '') // removes all https://
    //                 .replace(/(www?\.[^\s]+|[a-zA-Z0-9._-]+\.com+)/g,"") // removes all www. and ....com
    //                 .replace(/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+/g,''))//removes emails (...@...) 

    obj.body = body

    docs.push(obj)
})


/////////////////////////////
// Writing docs.json
/////////////////////////////

const format = json => beautify(JSON.stringify(json), { format: 'json' })
const setComma = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
let fileName = path.resolve(__dirname, `./data/docs-DH2019.json`)

fs.writeFile(fileName, format(docs), err => {
    if (err) throw err
    console.log('Size of docs.json', setComma(format(docs).length), 'kb')
})
