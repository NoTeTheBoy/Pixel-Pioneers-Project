const express = require('express');
const request = require('request');

const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/route', (req, res) => {
  const [first,second, third, fourth, fifth, sixth, ...parameters] = req.originalUrl
  const parameter = parameters.join('')
  //console.log(parameter);
  request(
    {url: `https://maps.googleapis.com/maps/api/directions/json${parameter}`},
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: 'error', message: err.message });
      }
       res.json(JSON.parse(body));
    }
  )
});


const PORT = process.env.PORT || 5505;
app.listen(PORT, () => console.log(`listening on ${PORT}`));