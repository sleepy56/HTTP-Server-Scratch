const net = require("net");
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const directoryIndex = args.indexOf("--directory");
const baseDirectory = (directoryIndex !== -1 && args[directoryIndex + 1]) ? args[directoryIndex + 1] : null;

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const d = data.toString();
        const headers = d.split('\r\n');
        const url = headers[0].split(" ")[1];
        if (url === '/') {
            socket.write(`HTTP/1.1 200 OK\r\n\r\n`);
            socket.end();
        } else if (url.startsWith('/echo/')) {
            const content = url.slice('/echo/'.length);
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}`);
            socket.end();
        } else if (url === '/user-agent') {
            const userAgentHeader = headers.find((s) => s.startsWith("User-Agent"));
            const content = userAgentHeader ? userAgentHeader.split(": ")[1] : "";
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}`);
            socket.end();
        } else if (url.startsWith('/files')) {
            const filename = url.slice('/files/'.length);
            const filepath = path.join(baseDirectory,filename);
            fs.readFile(`${filepath}`,(err, content)=>{
                if(err){
                    console.log(err);
                    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
                }
                else{
                    socket.write(
                        "HTTP/1.1 200 OK\r\n" +
                        "Content-Type: application/octet-stream\r\n" +
                        `Content-Length: ${content.length}\r\n` +
                        "\r\n"
                    );
                    socket.write(content);
                }
                socket.end();
            })
        } else {
            socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
            socket.end();
        }
    });

    socket.on("error", (err) => {
        console.error(`Socket error: ${err}`);
    });
});
//
server.listen(4221, "localhost",()=>{
    console.log('Listening on port 4221');
});
