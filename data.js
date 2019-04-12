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
const tfidf = new natural.TfIdf() // term frequency inverse doc frequency

// xml2js
const xml2js = require('xml2js') // read xml file
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
// New Theses File
const thesesFile = path.resolve(__dirname,'./theses.json')

const url = 'https://dspace.mit.edu/oai/request?verb=ListRecords&metadataPrefix=mets&set=hdl_1721.1_39094'



/////////////////////////////
// Load data
/////////////////////////////

https.get(url, xml => { // xml to json
    let data = ''
    xml.on('data', _data => data += _data.toString())
    xml.on('end', () => parser.parseString(data, (err, result) => start(result)))
})



const start = data => {

    const records = data['OAI-PMH'].ListRecords[0].record


    /////////////////////////////
    // Parsing by document
    /////////////////////////////

    let docs = records.reduce((docs, doc, index) => {

        // xml to list of documents (json)
        const mods = doc.metadata[0].mets[0].dmdSec[0].mdWrap[0].xmlData[0].mods[0]

        // if (index === 1) console.log(mods)
        //console.log("------------------------------------")
        //console.log(mods)
        
        const addDocument = () => { 
            const _doc = {} // object
            _doc.id = doc.header[0].identifier[0]
            _doc.text = mods.titleInfo[0].title[0] + ' ' + mods.abstract[0] + ' '
            mods.name.forEach(author => _doc[author.role[0].roleTerm[0]._] = author.namePart[0])
            //console.log(mods.text)
            docs.push(_doc)
        }

        if (mods.abstract) addDocument()

        return docs

    }, [])


    ///////////////////////////////
    // Load the theses.json and go through it by extracting all URL relative to the “Comparative Media Studies” Faculty. 
    // Then, retrieve all URLs from the Internet and merge them into a unique object variable, which will be the new one 
    // for refining data.
    ///////////////////////////////



    let t = require('./theses.json')
    console.log(t)
    

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

=======
    // console.log(professors)
>>>>>>> 544edefcbe8873a26395d3a337489d9541137269

    /////////////////////////////
    // Set items
    /////////////////////////////

    const items = professors


    /////////////////////////////
    // Lexical analysis
    /////////////////////////////

    const limitValue = 6 // Limit for keywords

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