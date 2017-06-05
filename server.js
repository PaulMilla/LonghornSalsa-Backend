var express = require('express');
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


//////////// Listener /////////////////
app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});
