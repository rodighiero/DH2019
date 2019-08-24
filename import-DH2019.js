/////////////////////////////
// Libraries
/////////////////////////////

const fs = require('fs')
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

    console.log('-----------------')

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
    // console.log(authors.html())
    // console.log(authors.html())
    authors.each(function (i, elem) {
        if (i % 3 == 0) { // author name only
            const forename = $(this).find('forename').text()
            const surname = $(this).find('surname').text()
            authors_list[i] = `${surname}, ${forename}`
            // authors_list[i] = $(this).text().replace(/\s\s+/g, ' ').trim()
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
    let body = $body.text()

    if (title.includes('BigSense')) body = 'Abstract We describe BigSense, a neural network-based approach for highly efficient word sense disambiguation (WSD). BigSense uses the entire English Wikipedia disambiguation pages to train a model that achieves state-of-the-art results while being many times faster than its competitors. In this way it is possible to disambiguate very large amounts of text data with reference to the largest freely available disambiguation model, while the time complexity of the model remains manageable. Thus, our approach paves the way for large-scale disambiguations in text-related digital humanities. 1. Introduction WSD is an indispensable task in the field of Natural Language Processing (NLP). In this paper, we describe BigSense, a neural network based approach for efficient WSD. This approach is based on a previous model (Anonymous, 2018), which worked well for the German language. BigSense is extended to English using all disambiguation pages of the English Wikipedia. We improved BigSense’s predecessor so that we again achieve state-of-the-art results, despite being much faster than our competitors. In our Wikipedia-based experiment we achieve an F-score of almost 90 %. This enables the use of WSD also for larger corpora and brings us one step closer to the goal of machine reading on the basis of largely disambiguated texts. 2. Related Work The general approach of BigSense was motivated by fastText (Joulin et al., 2016). This is because fastText is a very efficient way to classify data. We transposed fastText to WSD in order to efficiently determine the meaning of ambiguous words. By this we mean scenarios in which hundreds of thousands of different words are ambiguous. (Mihalcea and Csomai, 2007; Ferragina and Scaiella, 2010; Ratinov et al., 2011b; Ratinov et al., 2011a; Agerri et al., 2014; Moro et al., 2014) describe similar tools to BigSense since they perform Entity Linking, where they link text segments to knowledge databases such as Wikipedia. BigSense, however, has its focus on the disambiguation of ambiguous words. The creation of the disambiguation corpus, using Wikipedia’s link structure, was similarly performed by (Mihalcea, 2007). However, they did not use the corpus to disambiguate all ambiguous words, but compared them with the Senseval 2 dataset using a subset of 30 nouns. (Mihalcea et al., 2004; Chaplot et al., 2015) utilize graph based algorithms operating on semantic networks to perform WSD. (Yuan et al., 2016) present two WSD algorithms, achieving the best results by means of a semi-supervised algorithm combining labeled sentences with unlabeled ones and propagating labels based on sentence similarity. (Iacobacci et al., 2016) show that the use of word embeddings achieves an improvement in WSD compared to standard features. (Raganato et al., 2017a; Melamud et al., 2016) define WSD in terms of a sequence learning problem. This is done by means of a bidirectional LSTM-based neural network (Hochreiter and Schmidhuber, 1997). Unlike these approaches, we present a method that can handle big data: in terms of the number of senses to be distinguished and in terms of the number of units to be disambiguated. On the one hand, knowledge driven approaches using, for example, WordNet and related resources are limited in terms of the number of senses distinguished by them. On the other hand, approaches that rely on algorithms like PageRank or classifiers like SVMs or LSTMs are limited in terms of their time efficiency. Their runtime can last up to weeks and months when handling the amounts of data used in this paper (see Table 1). Therefore, we need a versatile and efficient method for WSD, as presented in the next section. 3. Model 3.1. Architecture The artificial neural network (ANN) used by BigSense builds upon a previous model architecture by adding an additional fully-connected hidden layer and replacing the sigmoid output layer with a dynamically reduced softmax layer (Figure 1). We found out that this additional hidden layer improves performance. Adding more hidden layers did not bring a performance boost anymore, however it slowed down the runtime. Each ambiguous word is assigned a distinct set of senses (i.e. each sense/output class belongs to exactly one word), which are gathered together for all ambiguous words in a training batch and make up the reduced output layer. This enables fast training, despite relying on the computationally more expensive softmax function. Possible senses are chosen based on the word to be disambiguated and are part of the input of the ANN. Instead of using global averaging pooling to combine embedding vectors, their sum is divided by the square root of the number of input words. We decided against using Dropout, since it did not appear to have any beneficial impact. Figure 1: Model architecture of BigSense. 3.2. Data Training and test corpora are generated using links of Wikipedia articles. Disambiguation page titles are used to find ambiguous words. Each title is simplified (i.e. lowercased, no leading articles, and no trailing text in parentheses) and assigned as word to a new sense group. Titles of redirects to disambiguation pages are also added. Sense groups combine similar ambiguous words which can assume the same set of senses. Senses are URLs to Wikipedia articles that can refer to full articles or single sections. A sense may only belong to exactly one sense group, to ensure the same subset of senses are always present in a reduced output layer of the ANN. Therefor the same URL may be used for multiple senses (see Figure 2). Figure 2: Relationships between words, sense groups, senses and article URLs. Senses are found using two methods: First, links on disambiguation pages are added as senses to the assigned sense group of the page. Links in section See also and links that do not contain the simplified disambiguation page title are ignored. Second, if there is an article or section that is linked at least five times using a link with the same simplified title as a sense group, it is added as sense to that group. Redirects are resolved before counting. Each paragraph in Wikipedia is used as a training example for the senses corresponding to the article or section it is from. In addition, any paragraph that contains links is used as example for senses that are assigned to the link destinations. To improve the quality of examples, paragraphs need to contain at least 5 tokens. Paragraphs that contain HTML or Wikicode tags are discarded, as well as tables. Text generated by most templates will simply be ignored. A training example consists of one tokenized paragraph, a list of possible senses for one ambiguous word and the correct sense. Most paragraphs are assigned to multiple senses in different sense groups and therefor reused multiple times. A sense group needs to have at least one sense or it will be removed as well. 4. Experiment We applied BigSense to our Wikipedia generated corpus as well as to Senseval and SemEval tasks. 4.1. Wikipedia-based Disambiguation The large number of articles in the English Wikipedia allowed us to generate 121,275,847 training examples (173,236,161 including test data) from 31,842,587 relevant paragraphs. Our approach yielded 549,770 senses for 478,077 article URLs in 168,546 sense groups. On average a sense group contains 3.3 senses. Around 40% of all sense groups only contain one sense, which is reflected in the MIN baseline (worst-case accuracy). A wide range of parameter configurations were tested and were able to achieve an F-score of up to 89.5 % (Table 2). Instead of using tokens directly, we exclude punctuation marks, build bi-grams and hash them using 10,000,000 buckets. The embedding and hidden layer both have a size of 25. Micro batches of 32 examples each were used to train the network using gradient decent with exponentially decaying learning rate (starting at 1.0) over 8 epochs. Tools 1,000 5,000 all Wikifier 16 min 41 s 1 h 24 min ≈ 302 days Illinois 6 min 53 s 24 min ≈ 77 days IXA 58 min 49 s 4 h 47 min ≈ 3 years Babelfy 1 min 50 s - ≈ 33 days TAGME 5 min 42 s 28 min 40 s ≈ 98 days BigSense 10s 13 s 16 min 49 s Table 1: Runtime-related evaluation regarding similar tools using 1000, 5000 and all test instances. Type F1 micro F1 macro BigSense 0.895 0.779 MFS Baseline 0.591 0.405 MIN Baseline 0.057 0.124 Table 2: Evaluation of BigSense in the Wikipedia experiment. 4.2. Senseval and SemEval related Disambiguation SemCor 3.0 (Mihalcea, 2016) was used to train models to evaluate Senseval and SemEval related tasks. We used the same parameters as we did for the Wikipedia data, except for gradient clipping, which we had to enable, because the learning rate of 1.0 was too high. Training duration was also extended, to suit the smaller data set. We evaluated models on the test data after each epoch until the moving average of the cost function did no longer improve. In some of these experiments we had lemma and part-of-speech (POS) information, which we also considered as parameters. Table 3 lists the results for Senseval 2 (English all-words) (SE2) and Senseval 3 (English all-words) (SE3). NG Epochs SE2 SE3 Token 1 95 0.718 - Token 2 79 0.710 - Lemma 1 73 0.708 - Lemma 2 88 0.706 - Token + PoS 1 66 0.709 0.688 Token + PoS 2 87 0.705 0.693 Lemma + PoS 1 76 0.709 0.702 Lemma + PoS 2 100 0.708 0.694 Table 3: F1-score for Senseval tests. (NG = n-grams, Ep. = epochs) Table 4 lists results for SemEval-2013 Task 12 (SE13), and SemEval-2015 Task 13 (SE15). Some test cases require the classification of senses that are not included in the training data. However, the neural network cannot predict classes it has never seen before. In these cases we proceed by classifying the most frequent sense in WordNet. NG Epochs SE13 SE15 Token 1 64 0.682 0.697 Token 2 76 0.685 0.708 Token + PoS 1 47 0.642 - Token + PoS 2 52 0.623 - Table 4: F1-score for SemEval tests. (NG = n-grams, Ep. = epochs) We also conducted an experiment where we ignored all test classes that did not occur in training set (see Table 5). In this way, we can find out what classification quality we achieve for a subset of the test set for which we have training data available. SE2 SE3 SE13 SE15 BigSense* 0.906 0.889 0.842 0.788 Table 5: F-score of BigSense, when ignoring unknown test cases. 4.3. Discussion We have successfully developed a classifier that can not only efficiently disambiguate huge amounts (see Table 1) of data, but can also compete with the state-of-theart. In order to compare with other WSD methods, we have carried out Senseval and SemEval tests. Here we were able to show that we can keep up with state-ofthe-art methods and even surpass them in some fields (see Table 6). In addition, we have shown that we can achieve 90% F-score if we only consider senses that were included in the training set (see Table 5). Model SE2 SE3 SE13 SE15 Iacobacci, 2016 0.634 0.653 0.673 0.715 Yuan, 2016 0.736 0.692 0.670 - Chaplot, 2015 0.605 0.586 - - Raganato, 2017 0.720 0.702 0.669 0.724 Melamud, 2016 0.718 0.691 0.656 0.719 BigSense 0.718 0.702 0.685 0.708 Table 6: Comparison of BigSense to state-of-the-art methods. 5. Conclusion We presented a novel approach called BigSense for disambiguating large amounts of data. In order to present the efficiency and quality of BigSense, we have created a huge disambiguation corpus using the English Wikipedia. Here we have classified almost 550,000 senses with an F-score of 89.5 % (see Table 2). In Senseval and SemEval tests we can keep up with state-of-the-art methods and in some cases even surpass them. In future work we will analyze the influence of topic classifiers on BigSense. '

    body = body
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

fs.writeFile('./data/docs.json', JSON.stringify(docs, null, '\t'), err => { if (err) throw err })

