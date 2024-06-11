const http = require('http');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// Global variable for enabling/disabling debug logs
global.DEBUG = true;

// Create an instance of EventEmitter
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

// Function to fetch and serve a file
function fetchFile(filePath, contentType, response) {
    fs.readFile(filePath, (error, content) => {
        if (error) {
            myEmitter.emit('fileReadError', filePath);
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end('500 Internal Server Error');
        } else {
            myEmitter.emit('fileReadSuccess', filePath);
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
}

// Function to log events to disk
function logEventToFile(message) {
    const logFileName = `log_${new Date().toISOString().slice(0, 10)}.txt`;
    const logFilePath = path.join(__dirname, 'logs', logFileName);
    fs.appendFile(logFilePath, `${new Date().toISOString()} - ${message}\n`, (err) => {
        if (err) console.error('Failed to write to log file', err);
    });
}

// Add event listeners
myEmitter.on('pageAccessed', (page) => {
    const message = `The ${page} page was accessed.`;
    console.log(message);
    logEventToFile(message);
});

myEmitter.on('nonHomeAccess', (page) => {
    const message = `A non-home page (${page}) was accessed.`;
    console.log(message);
    logEventToFile(message);
});

myEmitter.on('fileReadSuccess', (filePath) => {
    const message = `File read successfully: ${filePath}`;
    console.log(message);
    logEventToFile(message);
});

myEmitter.on('fileReadError', (filePath) => {
    const message = `Error reading file: ${filePath}`;
    console.log(message);
    logEventToFile(message);
});

const server = http.createServer((request, response) => {
    if (DEBUG) console.log('Request URL:', request.url);

    let filePath = './views' + request.url;
    let contentType = 'text/html';
    let isHome = false;

    switch (request.url) {
        case '/':
            filePath = './views/index.html';
            isHome = true;
            myEmitter.emit('pageAccessed', 'index');
            break;
        case '/about':
            filePath = './views/about.html';
            myEmitter.emit('pageAccessed', 'about');
            break;
        case '/contact':
            filePath = './views/contact.html';
            myEmitter.emit('pageAccessed', 'contact');
            break;
        case '/subscribe':
            filePath = './views/subscribe.html';
            myEmitter.emit('pageAccessed', 'subscribe');
            break;
        case '/overview':
            filePath = './views/overview.html';
            myEmitter.emit('pageAccessed', 'overview');
            break;
        case '/events':
            filePath = './views/events.html';
            myEmitter.emit('pageAccessed', 'events');
            break;
        case '/styles.css':
            filePath = './styles.css';
            contentType = 'text/css';
            break;
        default:
            if (DEBUG) console.log('404 Not Found');
            response.writeHead(404, { 'Content-Type': 'text/plain' });
            response.end('404 Not Found');
            return;
    }

    if (!isHome && request.url !== '/styles.css') {
        myEmitter.emit('nonHomeAccess', request.url);
    }

    if (DEBUG) console.log(filePath);
    fetchFile(filePath, contentType, response);
});

// Create logs directory if it doesn't exist
if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs');
}

// Make the server listen on port 3000
server.listen(3000, () => {
    console.log('Server is running on port 3000...');
});