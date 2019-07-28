# Lexical Network

This visualization represents an exhercise to design a map of individuals from their documents. The visual method is based on the idea that authors can be described using their documents, and the vocabulary that authors share is an efficient way to situate individual in a space. Individuals that make use of the same terms are situated nearby, and this is true for all of them. The result should be a continuos lexical space composed of individuals in a lexical and continuos backgound of terms.
  
The repositories is build with JavaScript and Node. To contiribute tot he repository you have to install the Node libraries typing:  
`npm install`
  
Currently the project hosts two datasets, one of MIT thesis presenting the cartography of advisors, and one associated to the Digital Humanities Conference 2019. Both of them can be imported from the _data folder_ typing:  
`node import-DH2019` or `node import-MIT`  
  

The import is strored into the same folder in a file called docs-XXX.json that contains the normalized documents, each of them being composed in this way:
```
  {
    "id":
    "title":
    "text": 
    "advisors": []]
  }
```
P.S. "Advisors has to be renamed with a more generic authors"  
  
The docs-XXX.json is then loaded and parsed in the _analysis.js_, collecting texts by author and running text analysis to create different metrics. To run the analysis type:  
`node analysis`  

The analysis produced the _advisors.json_ (to be renamed _authors.json_), which is an array of obejcts composed in this form:
```
{
    "id":  
    "docs":  
    "text":  
    "tokens": []  
    "keywords": []  
    "terms": {
        "term": value,
    }
},
```
  
  
The project can be tested on localhost by using `npm run start` and opening this [URL](http://localhost:8080) in your browser. Inversely the project can be built typing `npm run build`