'use strict';

let access_token = '9e972f7b613ffe2c441ffedc73a203b24778d3fe',
	refresh_token = '533bc9457c549f0b98d1d55bcc6c6ef8fdb5437c';
const PAGE_ACCESS_TOKEN = 'EAAFwj8mMOSMBAC2GbMAiugauNDcE5DqZCX1BlWokAyH7jtcnF5Uz9DXFVTkJBZCVb490Ykh469uiLZBrqZAFEzNTbJtQVuYhnZBZBWnHsa24gc7oQkJVi5GyVnAPTXOg91dvWMr1mr7h0z6BsoZAtpE58FGQJnyvBBU3iybCwG3xAZDZD';
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
	if (req.body && req.body.aspect_type === 'create'){
		let activityId = req.body.object_id;
		let textMessage = await getActivityById(activityId);
		let response = await sendMessageToFacebook({
				message: textMessage
		}) 
		if (response) {
			  res.status(200).send('EVENT_RECEIVED');
		}
		else {
			res.status(500).send();
		}
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
		let distance = Number(response.data.distance) / 1000;
		let moving_time = Number(response.data.moving_time);
		let textMessage = `${response.data.name}
							distance: ${distance} km
						   time : ${moving_time / 60}m${moving_time % 60}s
							`;
		return textMessage;
		
	} catch (error) {
		return "have an error!!";
		console.log(error.code);
	} finally {
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