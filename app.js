const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 3000;

let access_token = '';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Startpage
app.get('/', (req, res) => {
  res.redirect('https://secure.meetup.com/oauth2/authorize?client_id=8jhvj9qp5mc408od5bujmridfk&response_type=code&redirect_uri=http://localhost:3000/login');
})

// Login
app.get('/login', (req, res) => {
  const url = 'https://secure.meetup.com/oauth2/access';
  const client_id = '8jhvj9qp5mc408od5bujmridfk';
  const client_secret = 'c1qppfno81ipsktmhfc7bc2i66';
  const grant_type = 'authorization_code';
  const redirect_uri = 'http://localhost:3000/login';
  const code = req.query.code;

  const params = new URLSearchParams();
  params.append('client_id', client_id);
  params.append('client_secret', client_secret);
  params.append('grant_type', grant_type);
  params.append('redirect_uri', redirect_uri);
  params.append('code', code);

  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  // make post request
  axios.post(url, params, config)
    .then((response) => {
      access_token = response.data.access_token;
      // View forms
      res.sendFile(path.join(__dirname+'/views/form.html'));
    })
    .catch((err) => {
      res.send(err);
    })
})

app.post('/upcoming_events', (req, res) => {
  const url = 'https://api.meetup.com/find/upcoming_events';
  const latitude = '37.77';
  const longitude = '-122.41';
  // Get data from forms
  const startdate = req.body.startdate+'T00:00:00.000';
  const enddate = req.body.enddate+'T00:00:00.000';
  const text_filter = req.body.filter;

  // make axios req
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
  // make get request
  axios.get(url, config)
    .then((response) => {
      res.send(response.data.events[0]);
      console.log(response.data.events[0]);
    })
    .catch((err) => {
      res.send(err);
    });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
