const http = require('http')
const qs = require('querystring');
const async = require('async');

const port = 3000

const requestHandler = (req, response) => {
    //console.log(req.method)
    var timestamps = [];
    var dt = new Date();
    var totalTimeInMS =  new Date().getTime();

    timestamps.push("Server received request: <i>" + dt.getMinutes() + ":" + dt.getSeconds() + ":" + dt.getMilliseconds() + "</i>");


    response.setHeader("Access-Control-Allow-Origin", "*");


    var googleMapsClient = require('@google/maps').createClient({
        key: 'AIzaSyAnr61cPW34sINtAkzOQRtNSgia0ZE68VM'
    });

    //origins = [{lat: 30.6909, lng: 76.7375}];
    //destinations = [{lat: 30.7269008162, lng: 76.7063335325}, {lat: 30.7156267577, lng: 76.6973973566}];
    //traffic_model = 'best_guess';

    if(req.method=='POST') {
        var body='';
        //response.write("Step -1");
        console.log("Step -1");
        req.on('data', function (data) {
            //response.write("Step 0");
            console.log("Step 0");
            body +=data;
        });
        req.on('end',function(){
            var POST =  qs.parse(body);
            //console.log(POST);

            origins = JSON.parse(POST['origins']);
            all_destinations = JSON.parse(POST['destinations']);
            traffic_model = POST['trafficModel'];

            if(traffic_model == 'bestguess'){
                traffic_model = 'best_guess';
            }


            var results = [];

            var asyncTasks = [];
            const MAX_DESTINATIONS_PER_REQUEST = 25;

            console.log("Step 1");


            i = 0;
            while(i<all_destinations.length){
                destinations = [];
                console.log("Step 1.0.1");
                console.log(i );
                destinations = all_destinations.slice(i, i+MAX_DESTINATIONS_PER_REQUEST)
                console.log(destinations );
                (function(dest) {
                    asyncTasks.push(function (callback) {
                        console.log("Step 1.1");
                        googleMapsClient.distanceMatrix({
                            origins: origins,
                            destinations: dest,
                            mode: 'driving',
                            units: 'metric',
                            departure_time: new Date(Date.now()),
                            traffic_model: traffic_model
                        }, function (err, response) {
                            var dt = new Date();
                            timestamps.push("Response received at: <i>" + dt.getMinutes() + ":" + dt.getSeconds() + ":" + dt.getMilliseconds() + "</i>");
                            //console.log(response);
                            console.log("Step 1.2");
                            console.log(!err);

                            if (!err) {
                                console.log("Step 2");
                                console.log(JSON.stringify(response.json.rows[0].elements));
                                response.json.rows[0].elements.forEach(function (item, index) {
                                    results.push(item);
                                });
                                //results.push();
                                callback();
                            }
                        });
                    });
                }(destinations));
                i = i + MAX_DESTINATIONS_PER_REQUEST;
            }

            async.parallel(asyncTasks, function(){
                console.log("Step 5");
                timestamps.push("Total time taken in ms : <i>" + (new Date().getTime() - totalTimeInMS) + "</i>");
                timestamps.push("<br /><br />Total destinations received: <i>" + all_destinations.length + "</i>");
                timestamps.push("Max destinations per API call: <i>" + MAX_DESTINATIONS_PER_REQUEST+"</i>");


                response.end(JSON.stringify({"results": results, "timestamps": timestamps}));
            });

        });
    }
    //response.write("Step 3");
    console.log("Step 3");

    //response.end("Hello Js");

}


const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
})
