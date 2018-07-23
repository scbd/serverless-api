'use strict';


// require('util.promisify/shim')();
// const util = require('util');
// preview = util.promisify(preview);

exports.handler = function (event, context, callback) {
  
  const key = event.queryStringParameters.key;
 
  if(/^link-preview\//.test(key)){
    require('link-preview')(event, context, callback);
  }
  else if(/^metadata\//.test(key)){
    require('metadata')(event, context, callback);
  }
  else{
    require('image-resize')(event, context, callback);
  }
  
}

function load(url){
  return new Promise(function(resolve,reject){
      preview(url, function(err, data) {
        if(!err) {
            console.log('results', data); //Prints the meta data about the page 
            return resolve({
                    "title": data.title,
                    "url":data.url,
                    "pageUrl":data.url,
                    "canonicalUrl":data.url,
                    "description":data.description,
                    "images": data.images,
                    "image": (data.images||[])[0],
                    mediaType: data.mediaType,
                    "video":data.videos!==undefined,
                    "videoIframe":data.videos 
            });
        }
        else
          return reject("Invalid url.")
      });
  });
}

function getS3Document(originalKey){


  let s3ObjectOptions = {};
  let contentType = mime.lookup(originalKey);
  let s3Object;

    s3Object = S3.getObject({
      Bucket: BUCKET,
      Key: originalKey
    }).promise();

  return s3Object.then(data => {      
      return data;
    });
}
