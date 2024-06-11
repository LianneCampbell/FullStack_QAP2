// Import the http module for creating web servers
const http = require('http');
// Import the fs module for interacting with the file system
const fs = require('fs');
// Import the events module for creating and handling custom events
const EventEmitter = require('events');

// Global variable for enabling/disabling debug logs
global.DEBUG = true;

// Create an instance of EventEmitter
const eventEmitter = new EventEmitter();

// Function to fetch and serve a file
function fetchFile(fileName, response) {
    // Read the file asynchronously
    fs.readFile(fileName, (error, content) => {
        if (error) {
            // If there's an error reading the file, send a 500 Internal Server Error response
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end('500 Internal Server Error');
        } else {
            // If the file is read successfully, send a 200 OK response with the file content
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(content, 'utf-8');
        }
    });
}

// Create an HTTP server
const server = http.createServer((request, response) => {
    if (DEBUG) console.log('Request URL:', request.url); // Log the request URL if debugging is enabled
    let filePath = './views/'; // Base directory for HTML files
    switch (request.url) {
        case '/':
            filePath += 'index.html'; // Serve the index.html file for the root URL
            eventEmitter.emit('pageAccessed', 'index'); // Emit a custom event
            break;
        case '/about':
            filePath += 'about.html'; // Serve the about.html file for the /about URL
            eventEmitter.emit('pageAccessed', 'about'); // Emit a custom event
            break;
        case '/contact':
            filePath += 'contact.html'; // Serve the contact.html file for the /contact URL
            eventEmitter.emit('pageAccessed', 'contact'); // Emit a custom event
            break;
        case '/subscribe':
            filePath += 'subscribe.html'; // Serve the subscribe.html file for the /subscribe URL
            eventEmitter.emit('pageAccessed', 'subscribe'); // Emit a custom event
            break;
        case '/overview':
            filePath += 'overview.html'; // Serve the overview.html file for the /overview URL
            eventEmitter.emit('pageAccessed', 'overview'); // Emit a custom event
            break;
        case '/events':
            filePath += 'events.html'; // Serve the events.html file for the /events URL
            eventEmitter.emit('pageAccessed', 'events'); // Emit a custom event
            break;
        default:
            // For any other URL, send a 404 Not Found response
            if (DEBUG) console.log('404 Not Found');
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.end('404 Not Found');
            return;
    }
    if (DEBUG) console.log(filePath);
    fetchFile(filePath, response);
});

// Add an event listener for the custom 'pageAccessed' event
eventEmitter.on('pageAccessed', (page) => {
    console.log(`The ${page} page was accessed.`);
});

// Make the server listen on port 3000
server.listen(3000, () => {
    console.log('Server is running on port 3000...'); // Log a message when the server starts
});