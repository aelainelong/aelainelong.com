const http = require('http');

http.createServer(function (req, res) {
	res.write('Hello, world!');
	res.end();
}).listen(8080);

console.log('Server started! Listening on port 8080');
