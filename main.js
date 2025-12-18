const { serverSetup, getAllRoutes } = require('./server');
const path = require('path');
require('events').EventEmitter.defaultMaxListeners = 30;
const CONFIG = require('./core/config');

const PORT = CONFIG.PORT;

const urlPrefix = "/users";


const { Server } = require('socket.io');
const setupSocket = require('./whiteboard/socket');

(async () => {
    try {
        const parentDirs = ['qr_link', "whiteboard"];
        const server = await serverSetup(urlPrefix);


        for (const parentDir of parentDirs) {
            let parentDirectory = path.resolve(__dirname, `./${parentDir}`);
            const routes = getAllRoutes(parentDirectory);
            for (const element of routes) {
                const route = require(element);
                server.register(route);
            }
        }


        console.log("Attempting to listen on PORT:", PORT, "HOST:", CONFIG.HOST);
        await server.listen({ port: PORT, host: CONFIG.HOST })
            .then((address) => {
                console.log("Everything is Loaded..!");
                console.log(
                    "Swagger URL: " + address + urlPrefix + "swagger/public/documentation"
                );
                console.log(
                    "Check server status URL: " + address + urlPrefix + "/public/status"
                );

                const io = new Server(server.server, {
                    cors: {
                        origin: "*",
                        methods: ["GET", "POST"]
                    }
                });
                
                setupSocket(io, server.log);
                console.log(`Socket.IO initialized successfully on the same port as the server (${PORT})!`);
            })
            .catch((err) => {
                console.error("Failed to start the server:", err);
                throw err;
            });


    } catch (err) {
        console.error('Error occurred:', err); 
        process.exit(1);
    }
})();
