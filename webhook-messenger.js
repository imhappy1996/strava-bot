'use strict';
// Imports dependencies and set up http server
const request = require('request'),
    express = require('express'),
    body_parser = require('body-parser'),
    app = express().use(body_parser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 4444, () => console.log('webhook is listening on 4444'));


app.post('/publish-data', (req, res) => {
    console.log(req);
    if (!req || !req.body) {
        res.status(400).send("BAD_REQUEST");
        return;
    }

    publishDataOnPage(req.body);
    res.status(200).send(true);
})  

function publishDataOnPage(data) {
    request(
        {
            uri: `https://graph.facebook.com/v9.0/${pageId}/feed`,
            qs: { access_token: PAGE_ACCESS_TOKEN },
            method: 'POST',
            json: data,
        },
        (err, res, body) => {
            console.log(body);
            if (!err) {
                console.log('publish success!');
            } else {
                console.error('Unable to send message:' + err);
            }
        }
    );
}
