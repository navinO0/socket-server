const drawEventSchema = {
    tags: ['Socket.IO Events'],
    summary: 'Draw Event (Socket.IO)',
    description: 'Socket event emitted when a user draws on the whiteboard. Listen with: `socket.on("draw", callback)`',
    body: {
        type: 'object',
        properties: {
            roomId: { type: 'string', description: 'Room identifier' },
            userId: { type: 'string', description: 'User identifier' },
            paths: {
                type: 'array',
                description: 'Array of drawing paths',
                items: {
                    type: 'object',
                    properties: {
                        tool: { type: 'string', enum: ['pen', 'eraser', 'highlighter'] },
                        color: { type: 'string' },
                        size: { type: 'number' },
                        points: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    x: { type: 'number' },
                                    y: { type: 'number' }
                                }
                            }
                        }
                    }
                }
            }
        },
        required: ['roomId', 'paths']
    },
    response: {
        200: {
            description: 'Event broadcast to room',
            type: 'object',
            properties: {
                event: { type: 'string', example: 'draw' },
                broadcast: { type: 'boolean', example: true }
            }
        }
    }
};

const joinRoomSchema = {
    tags: ['Socket.IO Events'],
    summary: 'Join Room Event (Socket.IO)',
    description: 'Socket event to join a whiteboard room. Emit with: `socket.emit("join-room", roomId)`',
    body: {
        type: 'object',
        properties: {
            roomId: { type: 'string', description: 'Room ID to join' }
        },
        required: ['roomId']
    },
    response: {
        200: {
            description: 'Joined successfully',
            type: 'object',
            properties: {
                event: { type: 'string', example: 'join-room' },
                joined: { type: 'boolean', example: true }
            }
        }
    }
};

const messageEventSchema = {
    tags: ['Socket.IO Events'],
    summary: 'Message Event (Socket.IO)',
    description: 'Socket event for sending chat messages in a room. Emit with: `socket.emit("message", data)`',
    body: {
        type: 'object',
        properties: {
            id: { type: 'string', format: 'uuid' },
            room_id: { type: 'string' },
            sender_username: { type: 'string' },
            content: { type: 'string' },
            sent_at: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'room_id', 'sender_username', 'content', 'sent_at']
    },
    response: {
        200: {
            description: 'Message broadcast to room',
            type: 'object',
            properties: {
                event: { type: 'string', example: 'message' },
                broadcast: { type: 'boolean', example: true }
            }
        }
    }
};

const cursorMoveSchema = {
    tags: ['Socket.IO Events'],
    summary: 'Cursor Move Event (Socket.IO)',
    description: 'Socket event for tracking cursor position. Emit with: `socket.emit("cursor-move", data)`',
    body: {
        type: 'object',
        properties: {
            roomId: { type: 'string' },
            userId: { type: 'string' },
            cursor: {
                type: 'object',
                properties: {
                    x: { type: 'number' },
                    y: { type: 'number' }
                }
            }
        },
        required: ['roomId', 'userId', 'cursor']
    }
};

const clearEventSchema = {
    tags: ['Socket.IO Events'],
    summary: 'Clear Canvas Event (Socket.IO)',
    description: 'Socket event to clear the whiteboard. Emit with: `socket.emit("clear", roomId)`',
    body: {
        type: 'object',
        properties: {
            roomId: { type: 'string' }
        },
        required: ['roomId']
    }
};

const undoRedoSchema = {
    tags: ['Socket.IO Events'],
    summary: 'Undo/Redo Events (Socket.IO)',
    description: 'Socket events for undo/redo actions. Emit with: `socket.emit("undo", roomId)` or `socket.emit("redo", roomId)`',
    body: {
        type: 'object',
        properties: {
            roomId: { type: 'string' }
        },
        required: ['roomId']
    }
};

const lockEventSchema = {
    tags: ['Socket.IO Events'],
    summary: 'Lock/Unlock Events (Socket.IO)',
    description: 'Socket events to lock/unlock the whiteboard for exclusive drawing. Emit with: `socket.emit("lock", {roomId, userId})` or `socket.emit("unlock", roomId)`',
    body: {
        type: 'object',
        properties: {
            roomId: { type: 'string' },
            userId: { type: 'string', description: 'Only for lock event' }
        },
        required: ['roomId']
    }
};

module.exports = {
    drawEventSchema,
    joinRoomSchema,
    messageEventSchema,
    cursorMoveSchema,
    clearEventSchema,
    undoRedoSchema,
    lockEventSchema
};
