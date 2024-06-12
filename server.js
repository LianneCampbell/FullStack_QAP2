const http = require('http');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const axios = require('axios'); // Import axios for making HTTP requests

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
        case '/application':
            filePath = './views/application.html';
            myEmitter.emit('pageAccessed', 'application');
            break;
        case '/styles.css':
            filePath = './styles.css';
            contentType = 'text/css';
            break;
        case '/daily-info':
            fetchDailyInfo(response);
            return;
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

// Fetch daily information (e.g., news or weather) using an external API
async function fetchDailyInfo(response) {
    try {
        const apiKey = '6df6899f08af4b8cb27d1a45251a28b6'; // Replace with your actual API key
        const apiUrl = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;
        const result = await axios.get(apiUrl);
        const articles = result.data.articles;

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write('<html><body><h1>Daily News</h1><ul>');

        articles.forEach(article => {
            response.write(`<li><a href="${article.url}">${article.title}</a></li>`);
        });

        response.write('</ul></body></html>');
        response.end();

    } catch (error) {
        console.error('Error fetching daily info:', error);
        response.writeHead(500, { 'Content-Type': 'text/plain' });
        response.end('500 Internal Server Error');
    }
}

// Make the server listen on port 3000
server.listen(3000, () => {
    console.log('Server is running on port 3000...');
});