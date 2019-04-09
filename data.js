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



    /////////////////////////////
    // Parsing
    /////////////////////////////

    const records = data['OAI-PMH'].ListRecords[0].record

    //console.log(records[0])

    //////////////////////////////////
    // Parsing when node = by thesis
    //////////////////////////////////
    let docs = records.reduce((docs, doc) => { // xml to list of documents (json)

        const mods = doc.metadata[0].mets[0].dmdSec[0].mdWrap[0].xmlData[0].mods[0]
        //console.log(mods)
        
        const addDocument = () => { 
            const _doc = {} // object
            _doc.id = doc.header[0].identifier[0]
            _doc.title = mods.titleInfo[0].title[0]
            _doc.abstract = mods.abstract[0]
            mods.name.forEach(author => _doc[author.role[0].roleTerm[0]._] = author.namePart[0])
            //console.log(_doc)
            docs.push(_doc)
        }

        if (mods.abstract) addDocument()

        return docs

    }, [])

    //console.log(docs)


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
            let hasThisAdvisor = professors.some( prof => prof.name === doc.advisor)
            if (!hasThisAdvisor){ // if author doesn't exist
                _prof.name = doc.advisor
                _prof.theses = docs.filter(doc => doc.advisor === _prof.name)
                //console.log(_prof.name,_prof.theses.length)
                // will return all objects in docs array where author = that prof's name
                professors.push(_prof)
            } 
        })
        return professors
    }, [])

    console.log(professors)

    // Adivisors

    const advisors = docs.reduce((advisors, doc) => {

        // console.log(doc.advisor)

        // Ecample
        // if (vendors.filter(function(e) { return e.Name === 'Magenic'; }).length > 0) {
        //     /* vendors contains the element we're looking for */
        //   }

        if ( advisors[doc.advisor] ) {
            // Add text value
            // find the object where name == doc.advisor
            // use find/filter
            // use += with the space at the beginning


            
        } else {
            // Create the advisor
            const advisor = {
                name: doc.advisor,
                text: doc.title // title and abstracts
            }
            console.log(advisor)
            // Add text value
            advisors.push(advisor)
        }
		
        return advisors

    }, [])

    console.log('advisors', advisors)




    /////////////////////////////
    // Lexical analysis
    /////////////////////////////

    const limitValue = 0// Limit for keywords

    docs.forEach(doc => {
        tfidf.addDocument(`${doc.title} ${doc.abstract}`)
    })

    // Set terms and their weights
    docs.forEach((doc, index) => {

        const list = tfidf.listTerms(index)

        doc.terms = list.reduce((obj, element) => {
            if (element.tfidf > limitValue)
                obj[element.term] = element.tfidf
            return obj
        }, {})

    })

    //console.log(docs.terms)

    /////////////////////////////
    // Set terms list
    /////////////////////////////

    // let terms = []
    // docs.forEach(doc => {
    //     if (doc.terms) terms.push(...Object.keys(doc.terms))
    // })
    // // Claning doubles
    // terms = terms.sort().filter((value, index, array) => array.indexOf(value) === index)



    /////////////////////////////
    // Set pairs
    /////////////////////////////

    const pairs = combinatorics.bigCombination(docs, 2)



    /////////////////////////////
    // Set nodes and links
    /////////////////////////////

    const network = {
        nodes: docs, // can chance this to professors
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


    //console.log(network['nodes'][0])

    // Normalize the value between [0,1]
    const max = network.links.reduce((max, link) => max > link.v ? max : link.v, 0)
    network.links.forEach(link => link.v = Math.round(link.v / max * 100) / 100)



    /////////////////////////////
    // Report
    /////////////////////////////

    console.log('')
    console.log('     --- Report ---')
    console.log('')
    console.log('           docs :', docs.length + '/' + data.length)
    // console.log('          terms :', terms.length)
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

}