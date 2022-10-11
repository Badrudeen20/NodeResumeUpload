

function sendFiles(file,options){
    var form = new FormData();
    var req = new XMLHttpRequest();   
    const chunk = file.slice(options.startingByte);
    console.log(file)
    console.log(chunk)
    form.append('chunk', chunk, file.name);
    form.append('fileId', options.fileId);
    req.open("POST", options.url,true);
    req.setRequestHeader('Content-Range', `bytes=${options.startingByte}-${options.startingByte+chunk.size}/${file.size}`);
	req.setRequestHeader('X-File-Id', options.fileId);
   
    // for(var file = 0; file < files.length; file++){     
    //       form.append("file" + file, files[file], files[file].name);   
    // } 
    req.upload.addEventListener("progress", function(evt){
         if(evt.lengthComputable){
            const loaded = options.startingByte + evt.loaded;
            var percentComplete = evt.loaded / evt.total; 
            percentComplete = parseInt(percentComplete * 100);
            options.progressBar({...evt,
                loaded,
                total:file.size,
                percentage:percentComplete
            },file)
            // $('.progress-bar').css('width',percentComplete+"%")
            // $('.progress-bar').html(percentComplete+"%")
         }
    },false);
    
    req.send(form);  
}

//updateFile
const updateFiles = (()=>{
    const fileRequests = new WeakMap();  
    const defaultOptions = {
		url: 'http://localhost:8000/upload',
		startingByte: 0,
		fileId: '',
		progressBar(){},
		
	};

    const uploadFirst = (file,options)=>{
         return fetch('http://localhost:8000/uploadFirst',{
            method: 'POST',
            headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				fileName: file.name,
			})
         })
         .then(res => res.json())
         .then(res=>{
           
            options = {...options,...res}
           
            fileRequests.set(file, {request: null, options});
            sendFiles(file,options)
         })
    }

    return (files,options=defaultOptions)=>{
      [...files].forEach(file=>{
        // sendFiles(file)
        uploadFirst(file,{...defaultOptions,...options})
      })
    }
})()


 //progressbar
const  addProgressBar = ((file)=>{
    const files = new Map();
    const FILE_STATUS = {
		PENDING: 'pending',
		UPLOADING: 'uploading',
		PAUSED: 'paused',
		COMPLETED: 'completed',
		FAILED: 'failed'
	}
    const progress = $(`
        <div class="card border-primary mb-3" >
            <div class="card-header">Header</div>
            <div class="card-body text-primary">
                <ul class="list-group" id="element"></ul>
            </div>
        </div>
    `);
  
    const setProress = (file)=>{
        const element = $(`
        <li class="list-group-item mb-2">
            <div>
                <p>${file.name}</p>  
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width:0%;" >0%</div>
                </div>
                <div class="d-flex mt-2">
                    <button class="btn btn-primary resume">Pause</button>
                    <button class="btn btn-danger  ml-1">Delete</button>
                </div>
            </div>
        </li>
        `)
        
        files.set(file, {
            element: element,
            size: file.size,
            percentage: 0,
            uploadedChunkSize: 0
        });
        progress.find('#element').append(element)     
       
    }


    const updateFileElement = (obj)=>{
        obj.element.find('.progress-bar').css('width',obj.percentage+"%")
        obj.element.find('.progress-bar').html(obj.percentage+"%")
    }

    const  progressBar = (e,file)=>{ 
       
        const fileObj = files.get(file);
        fileObj.status = FILE_STATUS.UPLOADING;
        fileObj.percentage = e.percentage;
        fileObj.uploadedChunkSize = e.loaded;
        updateFileElement(fileObj)
     }

    return (selectedFiles)=>{
        [...selectedFiles].forEach(setProress)
        $('#uploadContainer').append(progress)
        updateFiles(selectedFiles,{
            progressBar
        })
       
    } 

})()












//onchange event
$(document).ready(function(){
	let input
    $('#customFileLangHTML').on('change',function(e){
        input =   e.currentTarget.files
    })
    $('#upload_btn').click(function(){
       addProgressBar(input)
    })
 })
