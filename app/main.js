const { get } = require("http");
const net = require("net");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    
    socket.on("data", (data)=>{
        console.log(data.toString());
        const d = data.toString().split(" ");
        const p = d[1];
        const h = d[4];
        console.log(d);
        console.log(p);
        console.log(h);
        if(p === '/'){
            socket.write(`HTTP/1.1 200 OK\r\n\r\n`);
        }
        else if(p.includes('/echo')){
            const content = p.split('/echo/')[1];
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}`);
        }
        else if(p.includes('/user-agent')){
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${h.length}\r\n\r\n${h}`);
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
