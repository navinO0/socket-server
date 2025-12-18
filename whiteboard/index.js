const { GET_ROOM_ID, SAVE_STROKES, GET_USER_SUGGESTION, CREATE_ROOM, JOIN_ROOM } = require('./controllers/wb_controller');
const { room_id_schema, save_room_schema, getUsersSchema, create_room_schema, join_room_schema } = require('./schemas/wb_schema');
const {
    drawEventSchema,
    joinRoomSchema,
    messageEventSchema,
    cursorMoveSchema,
    clearEventSchema,
    undoRedoSchema,
    lockEventSchema,
    whiteboardUpdateSchema,
    snapshotSyncSchema
} = require('./schemas/socket_events_schema');

module.exports = async (app) => {

app.route({
        method: 'GET',
        url: '/load/:roomId',
        schema: room_id_schema,
        handler: GET_ROOM_ID,
    });

    app.route({
        method: 'POST',
        url: '/save',
        schema: save_room_schema,
        handler: SAVE_STROKES,
    });


    app.route({
        method: 'GET',
        url: '/get/users/:userKeyword',
        schema: getUsersSchema,
        handler: GET_USER_SUGGESTION,
    });


    app.route({
        method: 'POST',
        url: '/room/create',
        schema: create_room_schema,
        handler: CREATE_ROOM,
    });

    app.route({
        method: 'POST',
        url: '/room/join',
        schema: join_room_schema,
        handler: JOIN_ROOM,
    });

    // Socket.IO Event Documentation (for Swagger reference)
    app.route({
        method: 'POST',
        url: '/socket/draw',
        schema: drawEventSchema,
        handler: async (request, reply) => {
            reply.send({
                message: 'This is a Socket.IO event. Use: socket.emit("draw", {roomId, userId, paths})',
                documentation: true
            });
        }
    });

    app.route({
        method: 'POST',
        url: '/socket/join-room',
        schema: joinRoomSchema,
        handler: async (request, reply) => {
            reply.send({
                message: 'This is a Socket.IO event. Use: socket.emit("join-room", roomId)',
                documentation: true
            });
        }
    });

    app.route({
        method: 'POST',
        url: '/socket/message',
        schema: messageEventSchema,
        handler: async (request, reply) => {
            reply.send({
                message: 'This is a Socket.IO event. Use: socket.emit("message", {id, room_id, sender_username, content, sent_at})',
                documentation: true
            });
        }
    });

    app.route({
        method: 'POST',
        url: '/socket/cursor-move',
        schema: cursorMoveSchema,
        handler: async (request, reply) => {
            reply.send({
                message: 'This is a Socket.IO event. Use: socket.emit("cursor-move", {roomId, userId, cursor})',
                documentation: true
            });
        }
    });

    app.route({
        method: 'POST',
        url: '/socket/clear',
        schema: clearEventSchema,
        handler: async (request, reply) => {
            reply.send({
                message: 'This is a Socket.IO event. Use: socket.emit("clear", roomId)',
                documentation: true
            });
        }
    });

    app.route({
        method: 'POST',
        url: '/socket/undo',
        schema: undoRedoSchema,
        handler: async (request, reply) => {
            reply.send({
                message: 'This is a Socket.IO event. Use: socket.emit("undo", roomId)',
                documentation: true
            });
        }
    });

    app.route({
        method: 'POST',
        url: '/socket/redo',
        schema: undoRedoSchema,
        handler: async (request, reply) => {
            reply.send({
                message: 'This is a Socket.IO event. Use: socket.emit("redo", roomId)',
                documentation: true
            });
        }
    });

    app.route({
        method: 'POST',
        url: '/socket/lock',
        schema: lockEventSchema,
        handler: async (request, reply) => {
            reply.send({
                message: 'This is a Socket.IO event. Use: socket.emit("lock", {roomId, userId}) or socket.emit("unlock", roomId)',
                documentation: true
            });
        }
    });

    app.route({
        method: 'POST',
        url: '/socket/whiteboard-update',
        schema: whiteboardUpdateSchema,
        handler: async (request, reply) => {
            reply.send({
                message: 'This is a Socket.IO event. Use: socket.emit("whiteboard-update", {roomId, changes})',
                documentation: true
            });
        }
    });

    app.route({
        method: 'POST',
        url: '/socket/snapshot-sync',
        schema: snapshotSyncSchema,
        handler: async (request, reply) => {
            reply.send({
                message: 'This is a Socket.IO event. Use: socket.emit("snapshot-sync", {roomId, snapshot})',
                documentation: true
            });
        }
    });
};
