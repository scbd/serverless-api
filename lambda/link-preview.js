
function linkPreview(event, context, callback) {
    const key = event.queryStringParameters.key;
    let match = key.match(/^link-preview\/(.*)/i);
    try {
        if (match.length > 1) {

            const preview = require("page-previewer");
            preview(match[1], function (err, data) {
                if (!err) {
                    
                    callback(null, {
                        statusCode: '200',
                        body: JSON.stringify({
                            "title": data.title,
                            "url": data.url,
                            "pageUrl": data.url,
                            "canonicalUrl": data.url,
                            "description": data.description,
                            "images": data.images,
                            "image": (data.images || [])[0],
                            mediaType: data.mediaType,
                            "video": data.videos !== undefined,
                            "videoIframe": data.videos
                        })
                    });
                } else
                    callback(null, {
                        statusCode: '200',
                        body: JSON.stringify({
                            body: "Invalid url."
                        })
                    })
            });
        } else {
            callback(null, {
                statusCode: '200',
                body: JSON.stringify({
                    body: "Invalid url."
                })
            })
        }
    } catch (err) {
        console.log('err', err);
        callback(err)
    }
}

module.exports = linkPreview;
