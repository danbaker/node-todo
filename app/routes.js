var http = require("http");

var requestsms = [];

module.exports = function (app) {

  app.get('/hello', function (req, res) {
    res.send("Hello world");
  });

  app.get('/runrequest', function (req, res) {
    var waitseconds = req.query.waitseconds || 60;  // repeat every 60 seconds
    var repeattimes = req.query.repeattimes || 0;   // default to NOT repeat
    var options = {
      host: req.query.host || 'www.google.com',
      port: req.query.port || 80,
      path: req.query.path || '/index.html'
    };
    runRepeatedRequests(options, res, waitseconds, repeattimes);
  });

  app.get('/showrequests', function (req, res) {
    var msg = "The last many requests: ";
    var shortest = requestsms[0];
    var longest = requestsms[0];
    var totalms = 0;
    var totaln = requestsms.length;
    for(var i=0; i<totaln; i++) {
      var ms = requestsms[i];
      totalms += ms;
      if (ms < shortest) shortest = ms;
      if (ms > longest) longest = ms;
    }
    msg += "</br><table>";
    msg += "<tr><td>Total Requests</td><td style='text-align:right'>" + parseInt(totaln) + "</td></tr>";
    msg += "<tr><td>Total Time</td><td style='text-align:right'>" + parseInt(totalms) + "ms</td></tr>";
    msg += "<tr><td>Quickest</td><td style='text-align:right'>" + parseInt(shortest) + "ms</td></tr>";
    msg += "<tr><td>Slowest</td><td style='text-align:right'>" + parseInt(longest) + "ms</td></tr>";
    msg += "<tr><td>Average</td><td style='text-align:right'>" + parseInt(totalms/totaln) + "ms</td></tr>";
    msg += "</table>";
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

function runRepeatedRequests(options, res, waitseconds, repeattimes)
{
  var start = process.hrtime();
  httpRequest(options, function(body) {
    var timeinfo = process.hrtime(start); // [0] = seconds [1] = nanoseconds
    var elapsedms = timeinfo[0] * 1000 + process.hrtime(start)[1] / 1000000; // ms
    requestsms.push(elapsedms);
    if (res) res.send("http://" + options.host + ":" + options.port + "/" + options.path + " = OK -- in " + elapsedms + "ms");
    if (--repeattimes > 0) {
      setTimeout(function() {
        runRepeatedRequests(options, undefined, waitseconds, repeattimes);
      }, waitseconds*1000);
    }
  }, function(errMessage) {
    if (res) res.send("ERROR - " + errMessage);
  });

}