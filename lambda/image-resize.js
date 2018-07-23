const AWS = require('aws-sdk');
const mime = require('mime-types');
const S3 = new AWS.S3({
    signatureVersion: 'v4',
});

const BUCKET = process.env.BUCKET;
const URL = process.env.URL;

function resizeImage(event, context, callback) {
    const key = event.queryStringParameters.key;

    let match = key.match(/(\d+)x(\d+)\/(.*)/i);
    let width;
    let height;
    let paths;

    if (match == null || match.length == 0) {
        match = key.match(/(.*)/);
        paths = match[0].split('/');
        callback(null, {
            statusCode: '301',
            headers: {
                'location': `${URL}/${paths[0]}`
            },
            body: '',
        });
    } else {
        width = parseInt(match[1], 10);
        height = parseInt(match[2], 10);
        paths = match[3].split('/');
    }

    const originalKey = paths[0]; //'original/'+
    let s3ObjectOptions = {};
    let contentType = mime.lookup(originalKey);
    let imageObject;

    if (contentType == 'image/webp')
        imageObject = S3.getObject({
            Bucket: BUCKET,
            Key: originalKey.replace(/\.webp$/, '.jpg')
        }).promise();
    else
        imageObject = S3.getObject({
            Bucket: BUCKET,
            Key: originalKey
        }).promise();

    imageObject
        .then(data => {
            s3ObjectOptions = {
                Key: key,
                Metadata: data.Metadata,
                ContentType: data.ContentType,
                Bucket: BUCKET
            }

            const Sharp = require('sharp');

            let image = Sharp(data.Body)
                .resize(width, height)
                .max();

            if (contentType == 'image/webp') {
                image = image.toFormat('webp');
                s3ObjectOptions.ContentType = 'image/webp'
            }

            return image.toBuffer()

        })
        .then(buffer => {
            s3ObjectOptions.Body = buffer;
            return S3.putObject(s3ObjectOptions).promise()
        })
        .then(() => {
            callback(null, {
                statusCode: '301',
                headers: {
                    'location': `${URL}/${key}`
                },
                body: '',
            })
        })
        .catch(err => callback(err))
}


module.exports = resizeImage
