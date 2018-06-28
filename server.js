var express = require('express');
var cors = require('cors');
var facebook = require('fb');

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;

var app = express();
app.use(cors());

var FB = facebook.default;
FB.options({ version: 'v3.0' });

/* To generate an *extended* access token manually:
 * go to facebook graph explorer
 * - https://developers.facebook.com/tools/explorer/
 * - Click "Get Token" dropdown on righthand side
 * - Under "Page Access Tokens" select "Longhorn Salsa"
 * - Press the blue & white "i" circle button on the Access Token bar
 * - "Open in Access Token Tool"
 * - It should've taken you to the Access Token Debugger
 * - https://developers.facebook.com/tools/debug/accesstoken/
 * - On the bottom of the Access Token Info box should be a button "Extend Access Token"
 * - Pressing it will extend the access token from 1 hr to 2 months
 * - Update the ACCESS_TOKEN environment variable to reflect the changes
 */
if (process.env.ACCESS_TOKEN) {
    console.log('Using manually provided access token.')
    FB.setAccessToken(process.env.ACCESS_TOKEN);
}
else {
    // Generate an access token
    console.log('Using client_id: '+process.env.APP_ID);
    console.log('Using client_secret: '+process.env.APP_SECRET);

    FB.api(
    'oauth/access_token',
    {
        client_id: process.env.APP_ID,
        client_secret: process.env.APP_SECRET,
        grant_type: 'client_credentials'
    },
    function (res) {
        if(!res || res.error) {
            console.log(!res ? 'error occurred' : res.error);
            return;
        }
        console.log('Successfully generated an app access token: '+res.access_token);
        FB.setAccessToken(res.access_token);
    });
}

console.log('Using access token: '+FB.options('accessToken'));


//////////// Routes /////////////////
let map = new Map();
map.set('/', (req) => '/LonghornSalsa');
map.set('/events', (req) => '/LonghornSalsa/events');
map.set('/events/:id', (req) => `/${req.params.id}`);

// TODO: Allow this endpoint to auto redirect just like the real endpoint
// If this is ever turned into a real ETL then this info could be returned with the event
map.set('/:eventId/picture', (req) => `/${req.params.eventId}/picture?redirect=false&type=large`);

for (const [myEndpoint, fbEndpointSelector] of map.entries()) {
    app.get(myEndpoint, (req, res) => {
        FB.api(fbEndpointSelector(req), req.query, (fb_res) => {
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
}

//////////// Listener /////////////////
app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});


