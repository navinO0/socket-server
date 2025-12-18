'use strict'

const { replyError, replySuccess } = require('../../core/core_funcs');
const {  getCacheValue, getCacheList } = require('../../core/redis_config/redis_client');
const { getUserSuggestions, create_room, getRoomChatData, join_room, getRoom, getRoomStrokes } = require('../services/wb_service');



async function GET_ROOM_ID(request, reply) {
    try {
        const room_id = request.params.roomId;
        // Priority 1: Redis (Live data)
        const strokes = await getCacheValue(`${this.CONFIG.REDIS.STROKES_KEY}${room_id}`);
        const messages = await getCacheList(`${this.CONFIG.REDIS.MESSAGES_KEY}${room_id}`);
        
        let whiteboardData = strokes ? JSON.parse(strokes) : null;
        
        // Priority 2: PostgreSQL (Persistent fallback)
        if (!whiteboardData) {
            const dbStrokesJson = await getRoomStrokes(this, room_id);
            whiteboardData = dbStrokesJson || null;
        }

        const msgsFromDb = await getRoomChatData(this, room_id);
        
        return replySuccess(reply, {
            messages: msgsFromDb?.length ? [...msgsFromDb, ...(messages || [])] : (messages || []),
            whiteboardData: whiteboardData,
            drowData: Array.isArray(whiteboardData) ? whiteboardData : []
          });
    } catch (err) {
        return replyError(reply, err);
    }
}

async function SAVE_STROKES(request, reply) {
    try {
        const { roomId, data } = request.body;
        const { saveRoomStrokes } = require('../services/wb_service');
        const { setCacheValue } = require('../../core/redis_config/redis_client');
        const CONFIG = require('../../core/config');

        // If data is provided, update Redis first
        if (data) {
            await setCacheValue(`${CONFIG.REDIS.STROKES_KEY}${roomId}`, JSON.stringify(data));
        }

        // Get the latest data from Redis if not provided or to ensure we have it
        const finalData = data || await getCacheValue(`${CONFIG.REDIS.STROKES_KEY}${roomId}`);
        
        if (!finalData) {
            return replyError(reply, { message: "No data found to save" });
        }

        // Save to PostgreSQL
        await saveRoomStrokes(this, roomId, finalData);

        return replySuccess(reply, { message: "Whiteboard saved successfully" });
    } catch (err) {
        return replyError(reply, err);
    }
}

async function GET_USER_SUGGESTION(request, reply) {
    try {
        const userKeyword = request.params.userKeyword    
        const getSuggestions = await getUserSuggestions(this, userKeyword)
        return replySuccess(reply, { users : getSuggestions })
    } catch (err) {
        return replyError(reply, err)
    }
}

async function CREATE_ROOM(request, reply) {
    try {
        const roomData = request.body
        const ownerDetails = request.user_info
        const insertRoomData = { ...roomData, owner_username: ownerDetails.username }
        const checkIfRoomExists = await getRoom(this, roomData.room_id)
        if(checkIfRoomExists && checkIfRoomExists.room_id.length) {
            return replyError(reply, { message: 'Room already exists' })
        }
        const getSuggestions = await create_room(this, insertRoomData)
        return replySuccess(reply, { users : getSuggestions })
    } catch (err) {
        return replyError(reply, err)
    }
}

async function JOIN_ROOM(request, reply) {
    try {
        const { room_id, password } = request.body
        const username = request.user_info.username
        const join_result = await join_room(this, room_id, username, password)
        if(join_result && !join_result?.status) {
            return replyError(reply, join_result)
        }
        return replySuccess(reply, { join_result })
    } catch (err) {
        return replyError(reply, err)
    }
}


module.exports = { GET_ROOM_ID, SAVE_STROKES, GET_USER_SUGGESTION, CREATE_ROOM, JOIN_ROOM }
