
/////////////////////////////
// Libraries
/////////////////////////////

const beautify = require('beautify')
const combinatorics = require('js-combinatorics')
const fs = require('fs')
const path = require('path')
const natural = require('natural')
const accents = require('remove-accents')
sw = require('stopword')




/////////////////////////////
// Reading dics.json
/////////////////////////////

///data/docs-DH2019.json
fs.readFile(__dirname + '/data/docs-DH2019.json', (err, data) => {


    // 
    // Set data
    //

    if (err) throw err
    docs = JSON.parse(data)



    // 
    // Assemble by author
    // 

    let authors = []

    for (let doc of docs) {
        for (let author of doc.authors) {

            const existence = authors.some(a => a.id === author)
            const text = doc.title.toLowerCase() + ' ' + doc.body.toLowerCase() + ' '

            if (existence) {
                let _author = authors.filter(a => a.id === author)
                _author[0].docs++
                _author[0].text += text
            } else {
                authors.push({
                    id: author,
                    docs: 1,
                    text: text
                })

                console.log('Created author #', authors.length)
            }
        }
    }



    // 
    // Merging authors
    // 

    let table_merging_authors = []

    for (let i = 0; i < authors.length - 1; i++) {
        for (let j = i + 1; j < authors.length; j++) {

            const equal = accents.remove(authors[i].id) === accents.remove(authors[j].id) // Check accents
            const similar = natural.DiceCoefficient(authors[i].id, authors[j].id) > .8 // Check similarity

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
    // Set items
    // 

    const items = authors



    // 
    // Token Frequency Analysis
    //

    const tokenFrequency = new natural.TfIdf() // term frequency inverse doc frequency
    const tokenizer = new natural.WordTokenizer()
    const stopWords = ['of']

    items.forEach((item, i) => {
        console.log('Computing token for author #', i)
        item.tokens = tokenizer.tokenize(item.text)
    })

    items.forEach(item => item.tokens = item.tokens.filter(token => !stopWords.includes(token)))
    items.forEach(item => item.tokens = item.tokens.filter(token => !parseInt(token)))
    items.forEach(item => item.tokens = sw.removeStopwords(item.tokens))

    // !(parseInt(token) == item)

    items.forEach((item, i) => {
        console.log('Computing token frequency for author #', i)
        tokenFrequency.addDocument(item.tokens)
    })

    items.forEach((item, i) => {
        console.log('Copying tokens for author #', i)
        item.tokens = tokenFrequency.listTerms(i)
        // .filter(el => el.tfidf > 20)
        // .reduce((obj, el) => {
        //     obj[el.term] = el.tfidf
        //     return obj
        // }, {})
    })




    // 
    // Stem Frequency Analysis
    //

    // const stemFrequency = new natural.TfIdf() // term frequency inverse doc frequency
    // // natural.PorterStemmer.attach() // Multilanguage stemmer
    // natural.LancasterStemmer.attach() // English stemmer

    // items.forEach((item, i) => {
    //     console.log('Computing stems for author #', i)
    //     item.stems = item.text.tokenizeAndStem()
    // })

    // items.forEach((item, i) => {
    //     console.log('Computing stems frequency for author #', i)
    //     stemFrequency.addDocument(item.stems)
    // })

    // items.forEach((item, i) => {
    //     console.log('Copying stems for author #', i)
    //     item.stems = stemFrequency.listTerms(i)
    //         .filter(el => el.tfidf > 20)
    //         .reduce((obj, el) => {
    //             obj[el.term] = el.tfidf
    //             return obj
    //         }, {})
    // })



    // 
    // Term Frequency Analysis
    // 

    // const termFrequency = new natural.TfIdf() // term frequency inverse doc frequency

    // items.forEach((item, i) => {
    //     console.log('Computing terms for author #', i)
    //     termFrequency.addDocument(item.text)
    // })

    // items.forEach((item, i) => {
    //     console.log('Copying terms for author #', i)
    //     item.terms = termFrequency.listTerms(i)
    //         .filter(token => token.tfidf > 20)
    //         .reduce((obj, element) => {
    //             obj[element.term] = element.tfidf
    //             return obj
    //         }, {})
    // })


    // Delete text from items to lighten the file 
    items.forEach(item => delete item.text)




    //
    // Set network
    //

    // console.log('Set pairs')
    // const pairs = combinatorics.bigCombination(items, 2)

    // console.log('Set nodes and edges')
    // const network = { nodes: items, links: [] }

    // let i = pairs.length

    // pairs.forEach(pair => {

    //     const p1 = pair[0], p2 = pair[1]
    //     const terms = Object.keys(p1.terms).filter(n => Object.keys(p2.terms).includes(n))

    //     console.log('#' + i--, '|', terms.length, 'terms between', p2.id, 'and', p1.id)

    //     terms.forEach(term => {

    //         const link = network.links.filter(link => link.s === p1.id && link.t === p2.id)
    //         const value = p1.terms[term] + p2.terms[term]

    //         if (link.length > 0) {
    //             link[0].v += value
    //         } else {
    //             network.links.push({
    //                 s: p1.id,
    //                 t: p2.id,
    //                 v: value
    //             })
    //         }

    //     })
    // })

    // Normalizing values between [0,1]
    // const max = network.links.reduce((max, link) => max > link.v ? max : link.v, 0)
    // network.links.forEach(link => link.v = link.v / max)




    /////////////////////////////
    // Report
    /////////////////////////////

    // console.log()
    // console.log('        Network =>')
    // console.log('                    pairs :', pairs.length)
    // console.log('                    links :', network.links.length)
    // console.log('                    nodes :', network.nodes.length)




    /////////////////////////////
    // Writing network.json
    /////////////////////////////

    console.log()
    console.log('          Files =>')

    // const stringify = json => JSON.stringify(json)
    // const format = json => beautify(JSON.stringify(json), { format: 'json' })
    // const setComma = x => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    // let fileName
    // console.log('                 authors :', setComma(format(authors).length), 'kb /', authors.length, 'records')
    // console.log('                  network :', setComma(format(network).length), 'kb /', network.nodes.length, 'records')

    // fileName = path.resolve(__dirname, './docs/network.json')
    // fs.writeFile(fileName, stringify(network), err => {
    //     if (err) throw err
    // })

    fileName = path.resolve(__dirname, './docs/authors.json')
    fs.writeFile(fileName, JSON.stringify(authors, null, '\t'), err => {
        if (err) throw err
    })

    // fileName = path.resolve(__dirname, './src/data/network.json')
    // fs.writeFile(fileName, stringify(network), err => {
    //     if (err) throw err
    // })

    // fileName = path.resolve(__dirname, './src/data/authors.json')
    // fs.writeFile(fileName, format(authors), err => {
    //     if (err) throw err
    // })

    // 
    // End of computation
    // 

})





