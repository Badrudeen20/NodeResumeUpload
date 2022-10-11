
//onchange event
$(document).ready(function(){
	let input
    $('#customFileLangHTML').on('change',function(e){
        input =   e.currentTarget.files
    })
    $('#upload_btn').click(function(){
        UploadFiles(input)
    })
 })


 const UploadFiles = (()=>{

    //progress

    const UploadProgress = (loaded,total)=>{
         console.log("progress " + loaded + ' / ' + total)
    }

    //upload
    const upload = (res,file,fileId)=>{
       let startByte = res.bytes
       
       let xhr  = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:5000/upload", true);
          // send file id, so that the server knows which file to resume
        xhr.setRequestHeader('X-File-Id', fileId);
        // send the byte we're resuming from, so the server knows we're resuming
        xhr.setRequestHeader('X-Start-Byte', res.bytes);
        xhr.setRequestHeader('name', file.name);

        xhr.upload.onprogress = (e) => {
            const loaded = parseInt(startByte) + e.loaded;
            console.log(loaded * 100 / file.size)
            //UploadProgress(startByte + e.loaded,startByte + e.total)
          // onProgress(startByte + e.loaded, startByte + e.total);
          
        };

    
        xhr.send(file.slice(parseInt(startByte)))
    }
    
    //check status
    const uploadStatus = (file)=>{
         let fileId = file.name + '-' + file.size + '-' + file.lastModified;
  
         return fetch('http://localhost:5000/status',{
            headers: {
                'X-File-Id': fileId,
                'name':file.name,
                'size':file.size,
            }
        }).then(res=>res.json())
        .then(res=>{
            // console.log(res)
            upload(res,file,fileId)
        }).catch(e=>{
            console.log(e)
        })
        
     

    }
    return (files)=>{
         [...files].forEach(file=>{
            uploadStatus(file)
         })
    }
 })()