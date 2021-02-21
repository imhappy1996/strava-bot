'use strict';

let access_token = '8030d847f96b88cfbf2a0cc548de6db8fe657223',
	refresh_token = '3998a63a6edc3b4c33b2a29cd89d0d4782bb5458';
const PAGE_ACCESS_TOKEN = 'EAAFwj8mMOSMBABW4BVQZAohIunWJqBMkQPhXmXuemwDhJTGu3FA0OJCXNxm1dg2gHL1OZCOtUkEnTVHR4QpzZB7pxT4V0loJpa2hkwa89qZClXZBf4t6Gcw9x5gPhPtf2uBa6ZATDXE84FEJuXq6QlQVRTLPQn5qWQiXjTJhZCvqxX1pT2GqPiMq95ZBXCYkecM5z6pHtKOUOgZDZD';
const pageId = '106483024744694';

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
app.post('/webhook',async (req, res) => {
  console.log("webhook event received!", new Date(), req.body);
	if (!req.body || req.body.aspect_type !== 'create') res.status(500).send();;

	let activityId = req.body.object_id;
	// let textMessage = getActivityById(activityId);
	let response = await sendMessageToFacebook({
			message: activityId
	}) 
	if (response) {
  		res.status(200).send('EVENT_RECEIVED');
	}
	else {
		res.status(500).send();
	}
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
		let distance = Number(response.data.distance) / 100;
		let moving_time = Number(response.data.moving_time);
		let textMessage = `distance: ${distance} km
						   time : ${moving_time / 60}m${moving_time % 60}s
							`;
		return textMessage;
		
	} catch (error) {
		console.log(error.code);
	}
	
}


const sendMessageToFacebook = async (messageObject) => {
	try {
		let result = await publishDataOnPage(messageObject);
		return result;
	} catch (error) {
		console.error("--------errr---------",error);
		return false;
	}
	
}

async function publishDataOnPage(data) {
	let response = await axios.post(`https://graph.facebook.com/v9.0/${pageId}/feed?access_token=${PAGE_ACCESS_TOKEN}`, data);
	console.log(response);
	return true;
  
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


app.get('/test', (req,res) => {
	sendMessageToFacebook({ message: 'test test3123333' });
    res.status(200).send(true);
})