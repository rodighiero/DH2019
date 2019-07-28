# Lexical Network

This visualization represents an exhercise to design a map of individuals from their documents. The visual method is based on the idea that authors can be described using their documents, and the vocabulary that authors share is an efficient way to situate individual in a space. Individuals that make use of the same terms are situated nearby, and this is true for all of them. The result should be a continuos lexical space composed of individuals in a lexical and continuos backgound of terms.
  
The repositories is build with JavaScript and Node. To contiribute tot he repository you have to install the Node libraries typing:  
`npm install`
  
Currently the project hosts two datasets, one of MIT thesis presenting the cartography of advisors, and one associated to the Digital Humanities Conference 2019. Both of them can be imported from the _data folder_ typing:  
`node import-DH2019` or `node import-MIT`  
  

The import is strored into the same folder in a file called docs-XXX.json that contains the normalized documents, each of them being composed in this way:
```
  {
    "id": 108,
    "title": "I-Media-Cities: A Digital Ecosystem Enriching A Searchable Treasure Trove Of Audio Visual Assets",
    "text": "Cultural heritage and museum institutions across Europe are progressively holding vast digital collections – either digitized or born digital – that can significantly affect many research fields, both in Social Sciences and Humanities   The I-Media-Cities platform is an interactive ecosystem aiming to share, provide access to and use 9 European film archives AV digital contents to allow multidisciplinary research by means of manual and automatic annotations   This contribution describes the approach and the actions taken in order to perform an effective design and implementation for the visual interfaces required by the project in order to foster the User Experiences for different audiences, such as researchers and citizens ",
    "advisors": [
      "Gabriella Scipione",
      "Antonella Guidazzoli",
      "Silvano Imboden",
      "Giuseppe Trotta",
      "Margherita Montanari",
      "Maria Chiara Liguori",
      "Simona Caraceni"
    ]
  }
```
P.S. "Advisors has to be renamed with a more generic authors"  
  
The docs-XXX.json is then parsed collecting texts by author and running text analysis to create different metrics. To run the analysis type:  
`node analysis`  


 associated to authors with the intent to create different metrics that can be used to create the cartography. Currently 


idea to create a cartograhpy of specific domains and areas where distance represents the lexical similarity and hight the quantity of contribution, for example the number of paper.
The project currently hosts 


The code is based on JavaScript, and needs node.js to be computed. Installation is composed of these steps:


Import data


Data analysis


Start localhost
`npm run start`

Then open this [URL](http://localhost:8080) in your browser 

## Build
`npm run build`




