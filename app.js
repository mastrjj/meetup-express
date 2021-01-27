const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 3000;

let access_token = '';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Server flow init redirect
app.get('/', (req, res) => {
  res.redirect('https://secure.meetup.com/oauth2/authorize?client_id=8jhvj9qp5mc408od5bujmridfk&response_type=code&redirect_uri=http://localhost:3000/login');
})

// Login part gets authorization_code and makes post request for obtaing access_token
app.get('/login', (req, res) => {

  // Response from meetup.com/oauth2/authorize with code or state
  const code = req.query.code;

  // Required values for getting access_token in next step:
  const url = 'https://secure.meetup.com/oauth2/access';
  const client_id = '8jhvj9qp5mc408od5bujmridfk';
  const client_secret = 'c1qppfno81ipsktmhfc7bc2i66';
  const grant_type = 'authorization_code';
  const redirect_uri = 'http://localhost:3000/login';

  // Make urlencoded query of parameters for request
  const params = new URLSearchParams();
  params.append('client_id', client_id);
  params.append('client_secret', client_secret);
  params.append('grant_type', grant_type);
  params.append('redirect_uri', redirect_uri);
  params.append('code', code);

  // Configure header
  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  // Making post request via axios
  axios.post(url, params, config)
    .then((response) => {
      access_token = response.data.access_token;

      // Show form.html
      res.sendFile(path.join(__dirname+'/views/form.html'));
    })
    .catch((err) => {
      res.send(err);
    })
})

// upcoming_events makes api request with json response
app.post('/upcoming_events', (req, res) => {
  // parameters for upcoming_events request
  const url = 'https://api.meetup.com/find/upcoming_events';

  // Geo location of city
  const latitude = '37.77';
  const longitude = '-122.41';

  // Getting startdate, enddate, text_filter from form.html
  const startdate = req.body.startdate+'T00:00:00.000';
  const enddate = req.body.enddate+'T00:00:00.000';
  const text_filter = req.body.filter;

  // Header { Authorization: Bearer {access_token}}
  const config = {
    headers: {
      'Authorization' : 'Bearer ' + access_token
    },
    params: {
      lat: latitude,
      lon: longitude,
      start_date_range: startdate,
      end_date_range: enddate,
      text: text_filter
    }
  };
  // make get request to find upcoming_events
  axios.get(url, config)
    .then((response) => {
      const events = response.data.events;

      // get local_time, name, description for events_formatted
      var events_formatted = new Array();
      events.forEach((item, i) => {
        events_formatted.push({
          'id' : i,
          'local_time': item.local_time,
          'local_date' : item.local_date,
          'name' : item.name,
          'description' : item.description
        })
        console.log(i, item.local_time, item.local_date, item.name);
      });

      res.send(events_formatted);
    })
    .catch((err) => {
      res.send(err);
    });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
