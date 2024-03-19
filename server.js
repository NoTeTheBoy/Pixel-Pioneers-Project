const destinationInput = document.getElementById("destination-input");
const originInput = document.getElementById("origin-input");

const express = require('express');
const request = require('request');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get(`/maps/api/directions/json?destination=${destinationInput.value}&mode=walking&origin=${originInput.value}&key=AIzaSyB8xI3vA3bcGOo7cNG7SWy6GQyIDGt6HcE`, (req, res) => {
  request(
    { url: `https://maps.googleapis.com/maps/api/directions/json?destination=${destinationInput.value}&mode=walking&origin=${originInput.value}&key=AIzaSyB8xI3vA3bcGOo7cNG7SWy6GQyIDGt6HcE`},
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: 'error', message: err.message });
      }

      res.json(JSON.parse(body));
    }
  )
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`listening on ${PORT}`));