
/////////////////////////////
// Libraries
/////////////////////////////

const beautify = require('beautify');
const fs = require('fs');
const path = require('path');
const convert = require('xml-js');


/////////////////////////////
// Importing and Parsing XMLs to JSON
/////////////////////////////

const dh2019_xml = fs.readFileSync('./data/DH2019/dh2019.xml');


const json = JSON.parse(convert.xml2json(dh2019_xml, {
    compact: true,
    spaces: 4,
    trim: true,
}))


// all theses in one object 
const theses = json['DH2014'].TEI

//console.log(theses[0])

docs = []

theses.forEach(thesis => {
    obj = {}

    // id

    // title
    title_container = thesis.teiHeader.fileDesc.titleStmt.title
    numtitle = Object.keys(title_container).length
    if (numtitle==1) {
        // if the paper only has the main title
        obj.title = thesis.teiHeader.fileDesc.titleStmt.title._text
    } else {
        // if the paper has a main title and a subtitle: "title: subtitle"
        t=[]
        title_container.title.map(item=> {
            t.push(item._text)
        })
        obj.title = t.join(": ")
    }


    // author >> "forname surname"
    // multiple authors >> [“forename1 surname1”, “forename2 surname2”]
    // checking if there's only one author or two, and if there are more than one, make an array fo the authors

    // body text
    obj.text_container = thesis.text.body
    obj.text = getKey(obj.text_container).join("")
    console.log(obj.text)

    // advisor

    docs.push(obj)
})


    function getKey(dic, key='_text') {
        text = []; 
            for (let [k,value] of Object.entries(dic)){
                if (k === key) {
                    text.push(dic[k]);
                } else if (value instanceof Object) {
                    text.concat(getKey(dic[k], key));
                } else if (Array.isArray(value)) {

                    let nestArray = value.filter(element => {
                            return element instanceof Object
                        }).map(element => {
                            return getKey(element)
                    nestArray = [].concat.apply([], nestArray);
                    text.concat(nestArray);
                    });
                }
        }
        //console.log(text)
        return text;
    }; 



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

fs.writeFile(fileName, format(theses), err => {
    if (err) throw err
    console.log('Size of json.json', setComma(format(theses).length), 'kb')
})