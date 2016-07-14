var http = require("http");

var requestsms = [];

module.exports = function (app) {

  app.get('/hello', function (req, res) {
    res.send("Hello world");
  });

  app.get('/runrequest', function (req, res) {
    var options = {
      host: req.query.host || 'www.google.com',
      port: req.query.port || 80,
      path: req.query.path || '/index.html'
    };
    var start = process.hrtime();
    httpRequest(options, function(body) {
      var timeinfo = process.hrtime(start); // [0] = seconds [1] = nanoseconds
      var elapsedms = timeinfo[0] * 1000 + process.hrtime(start)[1] / 1000000; // ms
      requestsms.push(elapsedms);
      res.send("http://" + options.host + ":" + options.port + "/" + options.path + " = OK -- in " + elapsedms + "ms");
    }, function(errMessage) {
      res.send("ERROR - " + errMessage);
    })
  });

  app.get('/showrequests', function (req, res) {
    var msg = "The last many requests: ";
    msg += requestsms.length;
    res.send(msg);
  });


  // application -------------------------------------------------------------
  app.get('*', function (req, res) {
      res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
  });
};

function httpRequest(options, fncOK, fncERROR)
{
  http.get(options, function(response) {
    var body = '';
    response.on('data', function(d) {
      body += d;
    });
    response.on('end', function() {
      fncOK(body);
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
    fncERROR(e.message);
  });
}
