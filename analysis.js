
/////////////////////////////
// Libraries
/////////////////////////////

const beautify = require('beautify')
const combinatorics = require('js-combinatorics')
const fs = require('fs')
const path = require('path')
const keyword_extractor = require("keyword-extractor")
const natural = require('natural')
const tfidf = new natural.TfIdf() // term frequency inverse doc frequency
const accents = require('remove-accents')




/////////////////////////////
// Reading dics.json
/////////////////////////////

///data/docs-DH2019.json
fs.readFile(__dirname + '/data/docs-DH2019.json', (err, data) => {
    if (err) throw err

    docs = JSON.parse(data)

    // Assemble by author
    let authors = []
    for (let doc of docs) {
        // console.log(doc)
        if (!doc.authors) continue // Skip empty authors
        for (let author of doc.authors) {
            const hasauthor = authors.some(adv => adv.id === author)
            if (hasauthor) {
                // Append text to the author
                let _author = authors.filter(adv => adv.id === author)
                _author[0].docs++
                _author[0].text += doc.title + ' ' + doc.text + ' '
            } else {
                // Create the author
                authors.push({
                    id: author,
                    docs: 1,
                    text: `${doc.title} ${doc.body} `
                })
                console.log('Created author', authors.length)
            }
        }
    }


    // 
    // Merging  authors
    // 

    let table_merging_authors = []

    for (let i = 0; i < authors.length - 1; i++) {
        for (let j = i + 1; j < authors.length; j++) {

            // Check accents
            const equal = accents.remove(authors[i].id) === accents.remove(authors[j].id)
            
            // Check similarity
            const similar = natural.DiceCoefficient(authors[i].id, authors[j].id) > .8

            if (equal || similar) {
                // Push elements for checking
                table_merging_authors.push([authors[i].id, authors[j].id])
                // Increase counter
                authors[i].docs += authors[j].docs
                // Merge texts
                authors[i].text += ' ' + authors[j].text
                // Remove second author
                authors = authors.slice(0, j).concat(authors.slice(j + 1, authors.length))
                // Reset j position
                j = j - 1
            }

        }
    }

    console.table(table_merging_authors)


    // 
    // Remove authors with a few documents
    // 

    // for (let i = 0; i < authors.length; i++) {
    //     if ( authors[i].docs < 2 )
    //     authors = authors.slice(0, i).concat(authors.slice(i + 1, authors.length))
    // }


    // 
    // Start working on items
    // 

    const items = authors

    // Tokenization
    // console.log('Tokenization')
    // // natural.PorterStemmer.attach() // Perter stemmer
    // natural.LancasterStemmer.attach() // Lancaster stemmer
    // items.forEach(item => {
    //     item.tokens = item.text.tokenizeAndStem()
    // })

    // Keyword extractor
    // console.log('Keyword extraction')
    // items.forEach(item => {
    //     item.keywords = keyword_extractor.extract(item.text, {
    //         language: "english",
    //         remove_digits: true,
    //         return_chained_words: false,
    //         return_changed_case: true,
    //         remove_duplicates: true,
    //         return_max_ngrams: false,
    //     })
    // })

    // Lexical Analysis
    console.log('Lexical Analysis')
    const maxLimit = 20 // Limit for keywords

    items.forEach((item, i) => {
        console.log('TF-IDF added text of author #', i)
        tfidf.addDocument(item.text)
    }) // Send texts
    // items.forEach(item => tfidf.addDocument(item.tokens)) // Send tokens
    // items.forEach(item => tfidf.addDocument(item.keywords)) // Send keywords

    console.log('Writing Lexical Analysis')
    items.forEach((item, i) => { // Writing computation terms in items
        console.log('Added TF-IDF text to author #', i)
        item.terms = tfidf.listTerms(i)
            .reduce((obj, element) => {
                if (element.tfidf > maxLimit)
                    obj[element.term] = element.tfidf
                return obj
            }, {})
    })

    // Delete text from items to make file lighter

    items.forEach(item => {
        delete item.text
    })




    /////////////////////////////
    // Set pairs
    /////////////////////////////

    console.log('Set pairs')

    const pairs = combinatorics.bigCombination(items, 2)




    /////////////////////////////
    // Set nodes and edges
    /////////////////////////////

    console.log('Set nodes and edges')

    const network = {
        nodes: items,
        links: []
    }

    let i = pairs.length

    pairs.forEach(pair => {

        const p1 = pair[0]
        const p2 = pair[1]
        const terms = Object.keys(p1.terms)
            .filter(n => Object.keys(p2.terms).includes(n))

        console.log('#' + i--, '|', terms.length, 'terms between', p2.id, 'and', p1.id)

        terms.forEach(term => {


            // Check of the link exists or not
            const link = network.links.filter(link =>
                link.s === p1.id && link.t === p2.id
            )

            const value = p1.terms[term] + p2.terms[term]

            if (link.length > 0) {
                link[0].v += value
            } else {
                const obj = {
                    s: p1.id,
                    t: p2.id,
                    v: value,
                }
                network.links.push(obj)
            }


        })
    })

    // Normalizing values between [0,1]
    const max = network.links.reduce((max, link) => max > link.v ? max : link.v, 0)
    network.links.forEach(link => link.v = link.v / max)




    /////////////////////////////
    // Report
    /////////////////////////////

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

    const stringify = json => JSON.stringify(json)
    const format = json => beautify(JSON.stringify(json), { format: 'json' })
    const setComma = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    let fileName

    fileName = path.resolve(__dirname, './docs/network.json')
    fs.writeFile(fileName, stringify(network), err => {
        if (err) throw err
        console.log('                  network :', setComma(format(network).length), 'kb /', network.nodes.length, 'records')
    })

    fileName = path.resolve(__dirname, './docs/authors.json')
    fs.writeFile(fileName, format(authors), err => {
        if (err) throw err
        console.log('                 authors :', setComma(format(authors).length), 'kb /', authors.length, 'records')
    })

    fileName = path.resolve(__dirname, './src/data/network.json')
    fs.writeFile(fileName, stringify(network), err => {
        if (err) throw err
        console.log('                  network :', setComma(format(network).length), 'kb /', network.nodes.length, 'records')
    })

    fileName = path.resolve(__dirname, './src/data/authors.json')
    fs.writeFile(fileName, format(authors), err => {
        if (err) throw err
        console.log('                 authors :', setComma(format(authors).length), 'kb /', authors.length, 'records')
    })


    // End of computation


})





