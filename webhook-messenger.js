'use strict';
let sender_psid = '';
const pageId = '106483024744694';
const PAGE_ACCESS_TOKEN = 'EAAFwj8mMOSMBAGxgWxa83tfVwqLvuJTIk1hNNhqmYWa5GAZCSS8u9rclZAZBeDGX5hO73XlZCedLOAWU4K8LcqZBpd2wA1fwBHWxtcuOqiDEVZAUurKFMtpeT6egP9GYbMIPRDvagWv2qV0Ng2VhL7qzdaYMHfwGMxsPZBaMKkFztHstWBDMNba';
// Imports dependencies and set up http server
const request = require('request'),
    express = require('express'),
    body_parser = require('body-parser'),
    app = express().use(body_parser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 4444, () => console.log('webhook is listening on 4444'));

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {
    // Parse the request body from the POST
    let body = req.body;
    console.log("---------------------")
    console.log(JSON.stringify(body));
    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {
        body.entry.forEach(function (entry) {
            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            sender_psid = webhook_event.sender.id;
        });
        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
});

// Accepts GET requests at the /webhook endpoint 
app.get('/webhook', (req, res) => {
    /** UPDATE YOUR VERIFY TOKEN **/
    const VERIFY_TOKEN = 'oab123';

    // Parse params from the webhook verification request
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Check if a token and mode were sent
    if (mode && token) {
        // Check the mode and token sent are correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            // Respond with 200 OK and challenge token from the request
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

app.post('/publish-data', (req, res) => {
    if (!req || !req.body) {
        res.status(400).send("BAD_REQUEST");
        return;
    }

    publishDataOnPage(req.body);
    res.status(200).send('SENT');
})  

function publishDataOnPage(data) {
    request(
        {
            uri: `https://graph.facebook.com/v9.0/${106483024744694}/feed`,
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

function callSendMessageAPI(sender_psid, messageObject) {
    // Construct the message body
    let request_body = {
        recipient: {
            id: sender_psid,
        },
        message: messageObject,
    };

    // Send the HTTP request to the Messenger Platform
    request(
        {
            uri: 'https://graph.facebook.com/v2.6/me/messages',
            qs: { access_token: PAGE_ACCESS_TOKEN },
            method: 'POST',
            json: request_body,
        },
        (err, res, body) => {
            console.log(body);
            if (!err) {
                console.log('message sent!');
            } else {
                console.error('Unable to send message:' + err);
            }
        }
    );
}
