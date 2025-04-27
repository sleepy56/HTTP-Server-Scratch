const net = require("net");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const args = process.argv.slice(2);
const directoryIndex = args.indexOf("--directory");
const baseDirectory = (directoryIndex !== -1 && args[directoryIndex + 1]) ? args[directoryIndex + 1] : null;

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        const d = data.toString();
        const [headers,body] = d.split('\r\n\r\n');
        const header = headers.split('\r\n');
        const [req, ...headerspart] = header;
        const [method, url] = req.split(" ");
        const encodingHeader = headerspart.find((s) => s.startsWith('Accept-Encoding'));
        let encoding= encodingHeader && encodingHeader.includes('gzip') ? 'gzip' : '';
        const close = headerspart.find((s)=>s.startsWith("Connection"));
        let responseHeaders = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n";
        if (close && close.includes('close')){
            responseHeaders += "Connection: close\r\n";
            socket.once('drain', () => {
                socket.end();
            });
        }
        if (url === '/') {
            socket.write(`HTTP/1.1 200 OK\r\n\r\n`);
        } else if (url.startsWith('/echo/')) {
            let content = url.slice('/echo/'.length);
            if(encoding === 'gzip'){
                responseHeaders+="Content-Encoding: gzip\r\n";
                content = zlib.gzipSync(content);
            }
            responseHeaders+=`Content-Length: ${content.length}\r\n`;
            socket.write(`${responseHeaders}\r\n`);
            socket.write(content);
        } else if (url === '/user-agent') {
            const userAgentHeader = headerspart.find((s) => s.startsWith("User-Agent"));
            const content = userAgentHeader ? userAgentHeader.split(": ")[1] : "";
            socket.write(`${responseHeaders}Content-Length: ${content.length}\r\n\r\n${content}`);
        } else if (url.startsWith('/files')) {
            const filename = url.slice('/files/'.length);
            const filepath = path.join(baseDirectory,filename);
            
            if(method === "GET"){
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
                })
            } else if (method === "POST"){
                fs.writeFile(filepath, body, (e) => {
                    if(e){
                        console.log(e);
                    } else {
                        socket.write("HTTP/1.1 201 Created\r\n\r\n");
                    }
                })
            } else {
                socket.write("HTTP/1.1 405 Method Not Allowed\r\n\r\n");
            }
        } else {
            socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        }
    });

    socket.on("close", (err) =>{
        socket.end();
    })
    socket.on("error", (err) => {
        console.error(`Socket error: ${err}`);
    });
});
//
server.listen(4221, "localhost",()=>{
    console.log('Listening on port 4221');
});
