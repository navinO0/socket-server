const { getCacheValue, setCacheValue, deleteCacheValue, rpushCacheList, ltrimCacheList } = require("../core/redis_config/redis_client");
const CONFIG = require('../core/config');
const { updateRoomUsers } = require("./services/wb_service");

let whiteboardData = {};
let cursors = {};
let roomLocks = {};
let roomUsers = {}; 

module.exports = async function setupSocket(io, log) {
    io.on("connection", async (socket) => {
        let customUserId = socket.handshake.query.username || `guest_${Math.floor(Math.random() * 10000)}`;
        socket.username = customUserId;
        socket.currentRoom = null;

        log.info(`User connected: ${customUserId}`);

        io.to(socket.id).emit("custom-id", customUserId);

        socket.on("join-room", (roomId) => {
            socket.join(roomId);
            socket.currentRoom = roomId;
            log.info(`User ${customUserId} joined room: ${roomId}`);

            if (!roomUsers[roomId]) roomUsers[roomId] = [];
            if (!roomUsers[roomId].includes(customUserId)) {
                roomUsers[roomId].push(customUserId);
            }

            io.to(roomId).emit("active-users", roomUsers[roomId]);
            io.to(roomId).emit("lock", roomLocks[roomId]);
        });

        socket.on("disconnect", () => {
            if (socket.currentRoom && roomUsers[socket.currentRoom]) {
                roomUsers[socket.currentRoom] = roomUsers[socket.currentRoom].filter(u => u !== socket.username);
                io.to(socket.currentRoom).emit("active-users", roomUsers[socket.currentRoom]);
                
                // Cleanup empty rooms
                if (roomUsers[socket.currentRoom].length === 0) {
                    delete roomUsers[socket.currentRoom];
                }
            }
            log.info(`User disconnected: ${socket.username}`);
        });

        socket.on("whiteboard-update", async ({ roomId, changes }) => {
            // Broadcast the update to others
            socket.to(roomId).emit("whiteboard-update", { changes });
            

        });

        socket.on("snapshot-sync", async ({ roomId, snapshot }) => {

            await setCacheValue(`${CONFIG.REDIS.STROKES_KEY}${roomId}`, JSON.stringify(snapshot));
            log.info(`Received and cached full snapshot for room: ${roomId}`);
        });


        socket.on("draw", async ({ roomId, userId, paths }) => {

            const strokes = await getCacheValue(`${CONFIG.REDIS.STROKES_KEY}${roomId}`);
            const newStrokes = strokes ? [...JSON.parse(strokes), ...paths] : [...paths];
            await setCacheValue(`${CONFIG.REDIS.STROKES_KEY}${roomId}`, JSON.stringify(newStrokes));

            socket.to(roomId).emit("draw", paths);
        });

        socket.on("clear", async(roomId) => {
            await setCacheValue(`${CONFIG.REDIS.STROKES_KEY}${roomId}`, JSON.stringify({}));
            socket.to(roomId).emit("clear");
        });

        socket.on("undo", (roomId) => socket.to(roomId).emit("undo"));
        socket.on("redo", (roomId) => socket.to(roomId).emit("redo"));

        socket.on("cursor-move", ({ roomId, userId, cursor }) => {
            if (!cursors[roomId]) cursors[roomId] = {};
            cursors[roomId][userId] = cursor;
            socket.to(roomId).emit("cursor-move", { userId, cursor });
        });

        socket.on("lock", ({ roomId, userId }) => {
            if (!roomLocks[roomId]) {
                roomLocks[roomId] = userId;
                log.info(`User ${userId} locked the whiteboard in room: ${roomId}`);
                io.to(roomId).emit("lock", userId);
            }
        });

        socket.on("unlock", (roomId) => {
            if (roomLocks[roomId]) {
                log.info(`User ${roomLocks[roomId]} unlocked the whiteboard in room: ${roomId}`);
                roomLocks[roomId] = null;
                io.to(roomId).emit("unlock");
            }
        });

        socket.on("message", async ({ id, room_id, sender_username, content, sent_at }) => {
            log.info(`User ${sender_username} sent a message "${content}" in room: ${room_id}`);
            const newMessage = { id, sender_username, content, sent_at, room_id };

            await rpushCacheList(`${CONFIG.REDIS.MESSAGES_KEY}${room_id}`, newMessage);
            await ltrimCacheList(`${CONFIG.REDIS.MESSAGES_KEY}${room_id}`, -100, -1);
            
            io.to(room_id).emit("message", newMessage);
        });
    });
};
