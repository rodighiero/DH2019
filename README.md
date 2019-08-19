# Lexical Network

This visualization represents a map of individuals starting from their documents. It is based on the idea that authors can be described using their documents and that the vocabulary that authors share is an efficient way to draw a space. Individuals that make use of the same terms are situated nearby, beyond any social distance. The result is a continuo lexical space composed of individuals and terms.

The project is available at this URL [https://rodighiero.github.io/LexicalNetwork/](https://rodighiero.github.io/LexicalNetwork/)

## To run the visualization on your local host

Clone the repository, which is built with JavaScript and Node. Then install the needed libraries by typing: `npm install`

The project can be tested on the local host by using `npm run start` and opening this [URL](http://localhost:8080) in your browser. The project can also be built typing `npm run build`
  
Currently the project hosts two datasets, one of MIT thesis presenting the cartography of advisors, and one associated to the Digital Humanities Conference 2019. Both of them can be imported from the _data_ folder typing:  
`node import-DH2019` or `node import-MIT`  
  

The import sores in the same folder a file called _docs.json_ that contains the documents in this way:

```
  {
    "id":
    "title":
    “body”: 
    “authors”: []]
  }
```

  
The _docs.json_ is then loaded and parsed using _analysis.js_, that collects texts by author and runs text analysis to compute the lexical distance. To run the analysis type:  
`node analysis`  

The analysis produced the _authors.json_, which is an array of objects composed in this form:
```
{
    "id":  
    "docs":  
    [ 
    "tokens": {
        “token”: value,
    }
},
```

Furthermore the analysis creates also the network used for rendering, which is composed of _nodes.js_ and _links.js_