var express = require('express');
var cors = require('cors');
var facebook = require('fb');

var FB = new facebook.Facebook({
    appId: process.env.APP_ID,
    appSecret: process.env.APP_SECRET});

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

// Generate an access token
let options = {
    client_id: process.env.APP_ID,
    client_secret: process.env.APP_SECRET,
    grant_type: 'client_credentials'};
FB.api('oauth/access_token', options, function (res) {
    if(!res || res.error) {
        console.log(!res ? 'error occurred' : res.error);
        return;
    }
    FB.setAccessToken(res.access_token);
});


var app = express();
app.use(cors());

//////////// Routes /////////////////
app.get('/', function(req, res) {
    res.send("Hello World! <a href='/events/1700480319978856'>ClickMe!</a>");
});

app.get('/events', function(req, res) {
    FB.api('LonghornSalsa/events', function(fb_res) {
        if(!fb_res || fb_res.error) {
            console.log(!fb_res ? 'error occurred' : fb_res.error);
            res.status(500)
               .json(fb_res.error);
            return;
        }

        res.status(200)
           .json(fb_res);
    })
});

app.get('/events/:id', function(req, res) {
    let eventId = req.params.id;
    FB.api('/'+eventId, function(fb_res) {
        if(!fb_res || fb_res.error) {
            console.log(!fb_res ? 'error occurred' : fb_res.error);
            res.status(500)
               .json(fb_res.error);
            return;
        }

        res.status(200)
           .json(fb_res);
    })
});

// TODO: Allow this endpoint to auto redirect just like the real endpoint
// If this is ever turned into a real ETL then this info could be returned with the event
app.get('/:eventId/picture', function(req, res) {
    let endpoint = '/'+req.params.eventId+'/picture?redirect=false&type=large';
    console.log("endpoint: "+endpoint);
    FB.api(endpoint, function(fb_res) {
        if (!fb_res || fb_res.error) {
            console.log(!fb_res ? 'error occurred' : fb_res.error);
            res.status(500)
               .send(fb_res.error);
            return;
        }

        res.status(200)
           .send(fb_res);
    })
})

//////////// Listener /////////////////
app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});
