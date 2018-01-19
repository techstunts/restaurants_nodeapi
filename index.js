const http = require('http')
const qs = require('querystring');
const async = require('async');

const port = 3000

const requestHandler = (req, response) => {
    //console.log(req.method)

    var googleMapsClient = require('@google/maps').createClient({
        key: 'AIzaSyAnr61cPW34sINtAkzOQRtNSgia0ZE68VM'
    });

    //origins = [{lat: 30.6909, lng: 76.7375}];
    //destinations = [{lat: 30.7269008162, lng: 76.7063335325}, {lat: 30.7156267577, lng: 76.6973973566}];
    //traffic_model = 'best_guess';

    if(req.method=='POST') {
        var body='';
        req.on('data', function (data) {
            body +=data;
        });
        req.on('end',function(){
            var POST =  qs.parse(body);
            //console.log(POST);

            origins = JSON.parse(POST['origins']);
            destinations = JSON.parse(POST['destinations']);
            traffic_model = POST['trafficModel'];

            if(traffic_model == 'bestguess'){
                traffic_model = 'best_guess';
            }


            var results;

            var asyncTasks = [];

            asyncTasks.push(function (callback) {
                googleMapsClient.distanceMatrix({
                    origins: origins,
                    destinations: destinations,
                    mode: 'driving',
                    units: 'metric',
                    departure_time: new Date(Date.now()),
                    traffic_model: traffic_model
                }, function (err, response) {
                    //console.log(response);
                    if (!err) {
                        console.log(JSON.stringify(response.json.rows[0].elements));
                        results = response.json.rows[0].elements;
                        //response.end(JSON.stringify(response.json.rows[0].elements));
                    }
                });
            });

            async.parallel(asyncTasks, function(){
                response.end(JSON.stringify(results));
            });

        });
    }

    //response.end("Hello Js");

}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
})
