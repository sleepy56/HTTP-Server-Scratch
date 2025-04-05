const { get } = require("http");
const net = require("net");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    
    socket.on("data", (data)=>{
        console.log(data.toString);
        const p = data.toString().split(" ")[1];
        if(p === '/'){
            socket.write(`HTTP/1.1 200 OK\r\n\r\n`);
        }
        else if(p.includes('/echo')){
            const content = p.split('/echo/')[1];
            socket.write(`HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${content.length}\r\n\r\n${content}`);
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
