
/////////////////////////////
// Libraries
/////////////////////////////

const combinatorics = require('js-combinatorics')
const fs = require('fs')
const natural = require('natural')
const accents = require('remove-accents')
sw = require('stopword')




/////////////////////////////
// Reading dics.json
/////////////////////////////

///data/docs-DH2019.json
fs.readFile(__dirname + '/data/docs.json', (err, data) => {


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
    const stopWords = ['humanity', 'digital', 'data', 'dh', 'https', 'www', '00', 'la']

    items.forEach((item, i) => {
        console.log('Computing token for author #', i)
        item.tokens = tokenizer.tokenize(item.text)
    })

    items.forEach(item => item.tokens = item.tokens.filter(token => !stopWords.includes(token)))
    items.forEach(item => item.tokens = item.tokens.filter(token => !parseInt(token)))
    items.forEach(item => item.tokens = sw.removeStopwords(item.tokens))
    items.forEach(item => item.tokens = sw.removeStopwords(item.tokens, sw.br))
    items.forEach(item => item.tokens = sw.removeStopwords(item.tokens, sw.de))
    items.forEach(item => item.tokens = sw.removeStopwords(item.tokens, sw.fr))
    items.forEach(item => item.tokens = sw.removeStopwords(item.tokens, sw.it))
    items.forEach(item => item.tokens = sw.removeStopwords(item.tokens, sw.pt))

    // Singularize (TODO Check language and do stemming just for English)
    const inflector = new natural.NounInflector()
    items.forEach(item => item.tokens = item.tokens.map(t => inflector.singularize(t)))

    items.forEach((item, i) => {
        console.log('Computing token frequency for author #', i)
        tokenFrequency.addDocument(item.tokens)
    })

    // 15 is a good value for final version; it can be lowered for testing
    const tfidfLimit = 15

    items.forEach((item, i) => {
        console.log('Copying tokens for author #', i)
        item.tokens = tokenFrequency.listTerms(i)
            // .filter(el => el.tfidf > tfidfLimit) // On threshold
            .slice(0, tfidfLimit) // On top elements
            .reduce((obj, el) => {
                obj[el.term] = el.tfidf
                return obj
            }, {})
    })

    // Delete text from items to lighten the file 
    items.forEach(item => delete item.text)




    //
    // Set network
    //

    const pairs = combinatorics.bigCombination(items, 2) // Set pairs
    const nodes = items // Set node object
    const links = [] // Set link object
    let i = pairs.length
    let maxCommonTokens = 0

    pairs.forEach(pair => {

        const p1 = pair[0], p2 = pair[1]
        const t1 = p1.tokens, t2 = p2.tokens
        const tokens = Object.keys(p1.tokens).filter(n => Object.keys(p2.tokens).includes(n))

        maxCommonTokens = maxCommonTokens > tokens.length ? maxCommonTokens : tokens.length

        console.log('#' + i--, '|', tokens.length, 'terms between', p2.id, 'and', p1.id)

        tokens.forEach(token => {

            const link = links.find(link => link.source === p1.id && link.target === p2.id)
            const value = t1[token] + t2[token]

            if (link) {
                link.value += value
                link.tokens[token] = value
            } else {
                links.push(
                    {
                        source: p1.id,
                        target: p2.id,
                        value: value,
                        tokens: {
                            [token]: value,
                        }
                    }
                )
            }

        })

    })

    // Normalizing values between [0,1]
    const maxLinkValue = links.reduce((max, link) => max > link.value ? max : link.value, 0)
    const minLinkValue = links.reduce((min, link) => min < link.value ? min : link.value, 100000)
    links.forEach(link => link.value = link.value / maxLinkValue)



    //
    // Report and file writing
    //

    const format = x => JSON.stringify(x).length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    console.log(`     nodes.json : ${format(nodes)}kb for ${nodes.length} authors`)
    console.log(`     links.json : ${format(links)}kb for ${links.length} links`)
    console.log(`   maxLinkValue : ${maxLinkValue}`)
    console.log(`   minLinkValue : ${minLinkValue}`)
    console.log(`maxCommonTokens : ${maxCommonTokens}`)

    fs.writeFile('./src/data/nodes.json', JSON.stringify(nodes), err => { if (err) throw err })
    fs.writeFile('./src/data/links.json', JSON.stringify(links), err => { if (err) throw err })
    fs.writeFile('./data/nodes.json', JSON.stringify(nodes, null, '\t'), err => { if (err) throw err })
    fs.writeFile('./data/links.json', JSON.stringify(links, null, '\t'), err => { if (err) throw err })



    //
    // END
    //



})