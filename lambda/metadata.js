const BUCKET = process.env.BUCKET;
let CORS_HEADER = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
};

function metadata(event, context, callback) {
    const key = event.queryStringParameters.key;

    let match = key.match(/^metadata\/([a-z\-\.\d]+)(?:(?:\?|\/|#)(.*))?/i);
    try {
        if (match && match.length > 1) {

            // supports Microsoft Office Open XML documents (docx, docm, pptx, pptm, xlsx, xlsm)
            var getDocumentProperties = require('office-document-properties');

            const originalKey = match[1];
            let s3ObjectOptions = {};
            let contentType = mime.lookup(originalKey);
            let s3Object;
            // if(contentType != 'docx'){ //application/vnd.openxmlformats-officedocument.wordprocessingml.document
            //   callback(null, { statusCode: '200', body: JSON.stringify({body:"file not supported."})})
            //   console.log(key);      
            // }  
            let bucketToUse = BUCKET;

            if (match.length >= 2 && /^temp/.test(match[2]))
                bucketToUse = TEMP_BUCKET;

            s3Object = S3.getObject({
                Bucket: bucketToUse,
                Key: originalKey
            }).promise();

            s3Object
                .then(data => {

                    // if(data.Metadata)
                    //   callback(null, { statusCode: '200', body: JSON.stringify(data)  

                    getDocumentProperties.fromBuffer(data.Body, function (err, data) {
                        if (!err) {
                            // console.log('results', data); //Prints the meta data about the page 
                            callback(null, {
                                statusCode: '200',
                                body: JSON.stringify(data),
                                headers: CORS_HEADER
                            });
                        } else
                            callback(null, {
                                statusCode: '200',
                                body: JSON.stringify({
                                    body: "Unable to get metadata."
                                }),
                                headers: CORS_HEADER
                            })
                        console.log(err);
                    })

                });
        } else {
            callback(null, {
                statusCode: '200',
                body: JSON.stringify({
                    body: "Invalid url."
                }),
                headers: CORS_HEADER
            })
        }
    } catch (err) {
        console.log('err', err);
        callback(err)
    }
}

module.exports = metadata;
