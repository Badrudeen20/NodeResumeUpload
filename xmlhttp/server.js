const express = require('express')
const bodyParser = require('body-parser')
const app = express()
var url = require("url");
var fs = require("fs");
const cors = require('cors');
const formidable = require("formidable");
var path = require('path');
const port = 5000

app.use(express.json());
app.use(cors({origin:'*'}));
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))
app.set('views',__dirname +'/view')
app.set('view engine','ejs')
let uploads = {}

app.get('/',(req,res)=>{
     res.render('index')
})

//check status
app.get('/status',(req,res)=>{
    let fileId = req.headers['x-file-id']
    let name = req.headers['name']
    let fileSize = req.headers['size']
   
    let path = 'storage/' + name
    if(name){
        try{
          if(fs.existsSync(path)){
              let stats = fs.statSync(path);
             
              if(fileSize == stats.size){
                  res.status(200).json({status:'uploaded'});
                  return 
              }else{
                if(!uploads[fileId]){
                  uploads[fileId] = {}
                  uploads[fileId]['bytesReceived'] = stats.size
                }
               
              }
              
          }
        
        }catch(er){
          console.log(er)
        }
    }

   let upload = uploads[fileId]
   if(upload){
     res.status(200).json({status:'resume',bytes:String(upload.bytesReceived)});
   }else{
        res.status(200).json({status:'upload',bytes:'0'});
    }
})


//post request
app.post('/upload', (req, res) => {
    let fileId = req.headers['x-file-id'];
    let startByte =  +req.headers['x-start-byte'];
    let name =  req.headers['name'];
   
 
   
    if (!fileId) {
      res.writeHead(400, "No file id");
      res.end();
    }
    let filePath = `./storage/${name}`;

    if(!uploads[fileId]){
      uploads[fileId] = {};
    }  
    let upload = uploads[fileId];
  
    let fileStream;

    if (!startByte) {
      // const form = new formidable.IncomingForm();
      // form.parse(req, function(err, fields, files){
        
      // })
      upload.bytesReceived = 0;
      fileStream = fs.createWriteStream(filePath, {
        flags: 'w'
      });
    }else {
      // const form = new formidable.IncomingForm();
      // form.parse(req, function(err, fields, files){
        
      // })
      if(upload.bytesReceived != startByte) {
        res.writeHead(400, "Wrong start byte");
        res.end(upload.bytesReceived);
        return;
      }
      fileStream = fs.createWriteStream(filePath, {
        flags: 'a'
      });
      
     
    }

    req.on('data', function(data) {
      upload.bytesReceived += data.length;
    });
     req.pipe(fileStream);
    fileStream.on('close', function() {
      if (upload.bytesReceived == req.headers['x-file-size']) {
        delete uploads[fileId];
        res.end("Success " + upload.bytesReceived);
      } else {
        res.end();
      }
    });
    
    
   
});

app.listen(port,(req,res)=>{ 
    console.log(port)
})