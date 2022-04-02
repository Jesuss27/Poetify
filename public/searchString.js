
function getDocStats(fileContent) {

    var docLength = document.getElementById("docLength")
    var wordCount = document.getElementById("wordCount")
    var charCount = document.getElementById("charCount")

    let commonWordDictionary = {}

    let text = fileContent.toLowerCase();
    let wordArray = text.match(/\b\S+\b/g);
    
   
    let wordDictionary = {};

    var uncommonWords = [];
    // check to see if the text is actually plain text
    for(let word in wordArray){
        let value = wordArray[word];
        if(commonWordDictionary[value] > 0){
            commonWordDictionary[value] += 1
        }else{
            commonWordDictionary[value]=1;
        }
    }
   if(commonWordDictionary["the"] > 10){

       //filter out uncommon words 
   
       uncommonWords = filterStopWords(wordArray)
   
   
       //Count every word in the wordArray
   
       for(let word in uncommonWords){
           let wordValue = uncommonWords[word];
           if(wordDictionary[wordValue] > 0){
               wordDictionary[wordValue] += 1;
           }
           else{
               wordDictionary[wordValue] = 1;
           }
       }
       
   
       //sort the array
       let wordList = sortProperties(wordDictionary);
   
       //return the top 5 words
       var top5Words = wordList.slice(0, 6);
   
       //return the least used 5 words
       var least5Words = wordList.slice(-6, wordList.length)
   
       //write values to the page
       ulTemplate(top5Words, document.getElementById("mostUsed"))
       ulTemplate(least5Words, document.getElementById("leastUsed"))
   
       docLength.innerText = "Document Length: " + text.length;
       wordCount.innerText = "Word Count: " + wordArray.length;
       return true
   } else{

       return false
   }
}

function ulTemplate(items,element){
    let rowTemplate = document.getElementById("template-ul-items");
    let templateHTML = rowTemplate.innerHTML;
    let resultsHTML = ""
    for( let i = 0; i < items.length; i++){
        resultsHTML += templateHTML.replace('{{val}}', items[i][0]+ " : "+ items[i][1])
    }
    element.innerHTML = resultsHTML;
}

function sortProperties(obj){
    // first convert object to an array
    let returnArray = Object.entries(obj);
    //Sort the array
    returnArray.sort(function (first, second){
        return second[1] - first[1] ;
    })
    
    return returnArray
}
function getStopWords(){
    return ["i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"]
}

//filter out stop words

function filterStopWords(wordArray){
    var commonWords = getStopWords();
    var commonObj = {};
    var uncommonArr = [];

    for( i=0; i<commonWords.length; i++ ){
        commonObj[commonWords[i].trim()] = true
    }

    for( i = 0; i < wordArray.length; i++){
        word= wordArray[i].trim().toLowerCase();
        if(!commonObj[word]){
            uncommonArr.push(word);
        }
    }
    return uncommonArr;
}

// highlight the words in search
function performMark(){
    //read the keyword
    var keyword = document.getElementById("keyword").value;
    var display = document.getElementById("fileContent")

    var newContent = "";

    //find all the currently marked items
    let spans = document.querySelectorAll("mark");
    for( var i = 0; i < spans.length; i++){
        spans[i].outerHTML = spans[i].innerHTML;
    }
    
    var reg = new RegExp(keyword, "gi");
    var replaceText = "<mark id='markme'>$&</mark>";
    var bookContent = display.innerHTML;

    //add the mark to the book content
    newContent = bookContent.replace(reg, replaceText);

    display.innerHTML = newContent;

    //display count in footer

    var count = document.querySelectorAll("mark").length;

    document.getElementById("searchstat").innerHTML = "found " + count + " matches";

    if(count > 0){
        var element = document.getElementById("markme")
        element.scrollIntoView();
    }

}

//main search functions
function fetchBook(){
    console.log("hello")
    // get book title from search widget
    if(document.getElementById('keyword') !== ""){

        var search = document.getElementById("keyword").value;
        
        //fetch data with gutendex
        fetch(`https://gutendex.com/books?search=${search}`)
        .then( (response) =>{
            return response.json()
        })    
        .then((data) =>  {
            if(data.count === 0 ){
                //alert if search is not found in database
                alert(`Sorry no matches under the name ${search}. Please try again.`)
                throw Error(`No matches under the name ${search}`)


            }else{
                return results = data.results
            }
        })
        .then(() => utilizeSearchResults(results))
    }else{
        //throw if no title is entered
        alert('Please enter the name of an author or book')
    }

}


function utilizeSearchResults(results){
        let topFiveTitles = []
        let topFiveResults = []
        //isolate top 5 results
        for(let i = 0; i<5; i++){
            // add results to top 5 array
            topFiveResults.push(results[i])
            //isolate the top 5 titles
            topFiveTitles.push(results[i].title)   
        }
        
        //top five formats
        let topFiveFormats = getFormats(topFiveResults)
    
        // set display for select widget
        displaySelectWidget(topFiveTitles, topFiveFormats)    
   
}

function isolatePlainText(array){
    return array.find(text => text.includes("text/plain"))
}



const displayPlainTxt = (title,data) => {
    //reset our UI
    document.getElementById("fileName").innerHTML = "";
    document.getElementById("searchstat").innerHTML = "";
    document.getElementById("keyword").value = ""

    
    const isText = getDocStats(data)
    // display only noncorrupted files
    if(isText){
        
        //get doc stats 
        getDocStats(data);

        //declare file content
        document.getElementById("fileName").innerHTML = title
        let fileContent = data
        
        fileContent = fileContent.toString().replace(/(?:\r)/g, '<br>')
        // console.log(fileContent)
        document.getElementById("fileContent").innerHTML = fileContent
        var element = document.getElementById("fileContent")
        element.scrollTop=0;
    }else{
        displayCorruptedFile(title)
    }


}

const getFormats = (results) => {
    let newFormatsArray = []
    results.map(result => {
        let formats = result.formats
        
        let formatsArray = Object.keys(formats)
        
       
        // isolate specific plain text format from array of different formats
        let plainTxtKey = isolatePlainText(formatsArray)
        
        let plainTxtLink = formats[plainTxtKey]
        
        newFormatsArray.push(plainTxtLink)
    })
    return newFormatsArray

}

const displaySelectWidget = (titles , formats) => {
    let selectWidget = document.getElementById('selectWidget')
    let rowTemplate = document.getElementById("template-ul-items");
    let templateHTML = rowTemplate.innerHTML;
    let resultsHTML = ""
    for( let i = 0; i < titles.length; i++){
        resultsHTML += `<li id="bookTitle">${titles[i]}</li>`
    }
    selectWidget.innerHTML = resultsHTML;
    addOnClick(titles, formats)
    
}

const addOnClick = (titles, formats) => {
    let booksList = document.querySelectorAll('#bookTitle')
    let booksArray = Array.from(booksList)
    console.log(booksArray)
    for(let i =0; i<booksArray.length; i++){
        booksArray[i].addEventListener("click", () =>{
            fetchTitle(titles[i], formats[i])
        })
    }
    
}

const fetchTitle = async (title, format) => {
    
    // remove displayBox and show loader
    showLoader()
    const url = `/books?q=${format}`
    

    const res = await fetch(url)
    const data = await res.text()
    
    displayPlainTxt(title, data)
    //hide loader and add displayBox
    hideLoader()
    console.log("after hide")
}

const displayCorruptedFile = (title) => {
    //reset our UI
    document.getElementById("fileName").innerHTML = title;
    document.getElementById("searchstat").innerHTML = "";
    document.getElementById("keyword").value = ""
    
    document.getElementById("fileContent").innerHTML = `
    <h1>404</h1>
    <br>
    Sorry, something seems to be wrong with the ${title} file.<br>
    Please select a different one.`

}

const showLoader = () => {
    // hide displayBox from DOM
    const display = document.getElementById("fileContent")

    display.style.display= "none"
    console.log(display)
    

    
    // show loader 
    const loaderContainer = document.querySelector(".loader-container")
    loaderContainer.style.height="500px"

    const loader = document.querySelector(".lds-facebook")
    loader.style.display= "flex"

}

const hideLoader = () => {
    // show displayBox to DOM
    const display = document.getElementById("fileContent")
    display.style.display= "flex"
    display.style.flexDirection = "column"
    

    // hide loader 
    const loaderContainer = document.querySelector(".loader-container")
    loaderContainer.style.height="0"

    const loader = document.querySelector(".lds-facebook")
    loader.style.display= "none"


}
