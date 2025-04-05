const { get } = require("http");
const net = require("net");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
    
    socket.on("data", (data)=>{
        console.log(data);
        const p = data.toString().split(" ")[1];
        const res = p === '/' ? '200 OK' : "404 NOT FOUND";
        socket.write(`HTTP/1.1 ${res} \r\n\r\n`);
    });

    socket.on("close", () => {
        socket.end();
    });
});
//
server.listen(4221, "localhost");
