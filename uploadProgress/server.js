const express = require('express')
const bodyParser = require('body-parser')
const app = express()
var url = require("url");
var fs = require("fs");
const cors = require('cors');
var formidable = require("formidable");
const port = 8000

app.use(express.json());
app.use(cors({origin:'*'}));
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))
app.set('views',__dirname +'/view')
app.set('view engine','ejs')

app.get('/',(req,res)=>{
     res.render('index')
})


const getFilePath = (fileName, fileId) => `./storage/file-${fileId}-${fileName}`;
//upload first request
app.post('/uploadFirst',(req,res)=>{
    if (!req.body || !req.body.fileName) {
		res.status(400).json({message: 'Missing "fileName"'});
	}else{
    let fileId = Date.now().toString(36) + Math.random().toString(36).substr(2)
    fs.createWriteStream(getFilePath(req.body.fileName, fileId), {flags: 'w'});
		res.status(200).json({fileId});
		// fs.createWriteStream(getFilePath(req.body.fileName, fileId), {flags: 'w'});
		// res.status(200).json({fileId});
	}
})


//post request
app.post('/upload',(req,res)=>{
    // let fileld = req.headers['x-file-id']
    // let startByte = parseInt(req.headers['x-start-byte'],10)
    // let name = req.headers['name']
    // let fileSize = parseInt(req.headers['size'],10)
   // console.log('fileSize',fileSize,fileld,startByte)
    // const form = new formidable.IncomingForm();
   
    // form.parse(req, function(err, fields, files){
    //   //  console.log(files)
     
    // })
})

app.listen(port,(req,res)=>{ 
    console.log(port)
})