//Load a book from disk
function loadBook(fileName,displayName){
    let currentBook = "";
    let url = "books/" + fileName;

    //reset our UI
    document.getElementById("fileName").innerHTML = displayName;
    document.getElementById("searchstat").innerHTML = "";
    document.getElementById("keyword").value = ""

    //create a server request to load book
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.send();

    xhr.onreadystatechange = function (){
        if(xhr.readyState == 4 && xhr.status == 200){
            currentBook = xhr.responseText
            

            //get Doc Stats
            getDocStats(currentBook);
            console.log("confirm")

             // remove line breaks and carriage returns and replace with a <br>
             currentBook = currentBook.replace(/(?:\r\n|\r|\n)/g, '<br>')

            document.getElementById("fileContent").innerHTML = currentBook;

           

            var elmnt = document.getElementById("fileContent");
            elmnt.scrollTop = 0;
        }
    }
}


function getDocStats(fileContent) {

    var docLength = document.getElementById("docLength")
    var wordCount = document.getElementById("wordCount")
    var charCount = document.getElementById("charCount")

    let text = fileContent.toLowerCase();
    let wordArray = text.match(/\b\S+\b/g);
   
    let wordDictionary = {};

    var uncommonWords = [];
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

function fetchBook(){
    console.log("hello")
    // get book title from search widget
    var book = document.getElementById("book");
    var bookResults = {}
    //fetch data with gutendex
    fetch("https://gutendex.com/books?search=dickens")
    .then(response => response.json())
    .then(data =>  results = data.results)
    .then(() => utilizeSearchResults(results))

}
fetchBook()

function utilizeSearchResults(results){
    //isolate top 5 formats 

    //isolate the top 5 results
    for(let i=0; i<5;i++){
        let formats = results[i].formats;
        let formatsArray = Object.keys(formats)
        //isolate specific plain text format from array of different formats
        let plainTxtKey = isolatePlainText(formatsArray)
        // access the value of the plain text format (which is a link that will be fetched)
        let plainTxtLink = formats[plainTxtKey]
        if(plainTxtLink.includes(".txt")){
             //fetch books plain text
             fetch(plainTxtLink)
             .then(response => response.json())
             .then(data => console.log(data))

            
        }
        
    }
}

function isolatePlainText(array){
    return array.find(text => text.includes("text/plain"))

    
    

}