const { get } = require("http");
const net = require("net");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    
    socket.on("data", (data)=>{
        console.log(data.toString());
        const d = data.toString();
        const headers = d.split('\r\n');
        const url = headers[0].split(" ")[1];
        if(url === '/'){
            socket.write(`HTTP/1.1 200 OK\r\n\r\n`);
        }
        else if(url.includes('/echo')){
            const content = url.split('/echo/')[1];
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}`);
        }
        else if(url === '/user-agent'){
            const content = headers.find((s)=> s.startsWith("User-Agent")).split(" ")[1];
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${h}`);
        }
        else{
            socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        }
    });

    socket.on("close", () => {
        socket.end();
    });
});
//
server.listen(4221, "localhost");
