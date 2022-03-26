const express = require('express')
const url = require("url")
const cors = require("cors")
const needle = require("needle")

const PORT = process.env.PORT || 5000

const app = express()

app.use(cors())

app.use(express.static('public'))

app.get("/books", async (req,res,next) =>{
    try {
        const query = url.parse(req.url,true).query
        const plainTxtFile = query.q
        //needle fetch the plain txt passed from client
        const apiRes = await needle("get", `${plainTxtFile}`)
       
        res.send(apiRes.body)
        
        
        
    } catch (error) {
        console.log(error)
        
    }
})

app.listen(PORT, () => console.log(`Server running on port ${PORT} `))