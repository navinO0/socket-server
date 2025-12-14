'use strict';

const { Server } = require("socket.io");
const { setCacheValue, deleteCacheValue } = require('../core/redis_config/redis_client');
const userManagementRoutes = require('../user-management/routes/authRoutes');

module.exports = async (app) => {
    const io = new Server(app.server, { cors: { origin: "*" } });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("join-room", (roomId) => {
            socket.join(roomId);
        });

        socket.on("draw", async ({ roomId, paths }) => {
            await setCacheValue(`whiteboard:${roomId}`, JSON.stringify(paths));
            socket.to(roomId).emit("draw", paths);
        });

        socket.on("clear", async (roomId) => {
            await deleteCacheValue(`whiteboard:${roomId}`);
            io.to(roomId).emit("clear");
        });

        socket.on("disconnect", () => console.log("User disconnected"));
    });

    // Register user management routes from submodule
    app.register(userManagementRoutes, { prefix: '/user' });
};