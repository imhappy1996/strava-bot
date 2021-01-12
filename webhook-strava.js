'use strict';

const { get } = require('request');

let access_token = 'def8cfaded0036f14eb895d858b8ac3f874dd4e7',
	refresh_token = '';

// Imports dependencies and sets up http server
const
	  axios = require('axios'),
  express = require('express'),
  bodyParser = require('body-parser'),
// creates express http server
  app = express().use(bodyParser.json());

// Sets server port and logs message on success
app.listen(process.env.PORT || 3333, () => console.log('webhook is listening 3333'));

// Creates the endpoint for our webhook
app.post('/webhook', (req, res) => {
  console.log("webhook event received!", new Date(), req.body);
	if (!req.body || req.body.aspect_type !== 'create') return;

	let activityId = req.body.object_id;
	getActivityById(activityId);
  res.status(200).send('EVENT_RECEIVED');
});

app.get('/test', (req, res) => {
  res.status(200).send(getActivityById(4607311689));
});

const getActivityById = async (activityId) => {
	try {
		let response = await axios.get(
		`https://www.strava.com/api/v3/activities/${activityId}`,
		{
		headers: {
           Authorization: 'Bearer ' + access_token 
 		}
		});
		console.log('result: ', response.data);
		let distance = Number(response.data.distance) / 100;
		let moving_time = Number(response.data.moving_time);
		let textMessage = `distance: ${distance} km
						   time : ${moving_time/60}m${moving_time%60}s
							`
		return await sendMessageToFacebook({
			message: textMessage
		})
		
	} catch (error) {
		console.log(error);
	}
	
}

const sendMessageToFacebook = async (messageObject) => {
	try {
		let response = await axios.post(
			`https://localhost:4444/publish-data`,
			messageObject,
		{
            headers: {
                "Content-Type": "application/json"
            }
        });
		console.log("SEND SUCCESS:", response);
		return true;
	} catch (error) {
		console.error("--------errr---------",error);
		return false;
	}
	
}

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {
  // Your verify token. Should be a random string.
  const VERIFY_TOKEN = "STRAVA";
  // Parses the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Verifies that the mode and token sent are valid
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.json({"hub.challenge":challenge});
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});