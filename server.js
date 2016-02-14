var finalhandler = require('finalhandler');
var http = require('http');
var serveStatic = require('serve-static');
var program = require('commander');

// Check arguments for port
program
  .version('0.0.1')
  .option('-p, --port <n>', 'Start server on assigned port', 3000)
  .parse(process.argv);

// Serve up www folder
var serve = serveStatic('www', {'index': ['index.html', 'index.htm']});
var port = program.port;

// Create server
var server = http.createServer(function(req, res){
  var done = finalhandler(req, res)
  serve(req, res, done)
});

// Listen
server.listen(port, function() {
  console.log('Server listening on port '+port);
});
