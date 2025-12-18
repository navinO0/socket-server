const CONFIG = require('../core/config');
const { getKeysByPattern, getCacheValue, deleteCacheValue, flushCache, getCacheList } = require('../core/redis_config/redis_client');


async function jobPlugin(fastify, options) {
    fastify.cronScheduler.scheduleJob(
        'Backup Messages Cron Job',
        CONFIG.SCHEDULER.BACKUP_CRON_SCHEDULE,
        async () => {
            const chatRooms = await getKeysByPattern(`${CONFIG.REDIS.MESSAGES_KEY}*`);
            
            const insertPromises = chatRooms.map(async (redisKey) => {
                try {
                    const messages = await getCacheList(redisKey);
                    if (!messages || messages.length === 0) return;
                    const room_id = redisKey.replace(CONFIG.REDIS.MESSAGES_KEY, '');
                    const existingRoom = await fastify.knex('rooms').where('id', room_id).first();
                    if (!existingRoom) {
                        await fastify.knex('rooms').insert({
                            id: room_id,
                            room_id: room_id,
                            owner_username: messages[0]?.sender_username || 'system',
                            is_private: false
                        });
                        fastify.log.info(`Created missing room: ${room_id}`);
                    }
            
                    const messagesToInsert = messages.map((msg) => ({
                        ...msg,
                        room_id,
                        is_active: true
                    }));
                    const result = await fastify.knex('messages')
                        .insert(messagesToInsert)
                        .returning('*');
            
                    fastify.log.info(`Inserted ${result.length} messages for room: ${room_id}`);
                    await deleteCacheValue(redisKey);
            
                } catch (error) {
                    fastify.log.error(error, `Failed to insert messages for room ${redisKey}`);
                }
            });

            await Promise.all(insertPromises);

            const { saveRoomStrokes } = require('../whiteboard/services/wb_service');
            const strokeKeys = await getKeysByPattern(`${CONFIG.REDIS.STROKES_KEY}*`);
            const strokePromises = strokeKeys.map(async (redisKey) => {
                try {
                     const cachedStrokes = await getCacheValue(redisKey);
                     if (!cachedStrokes) return;
                     
                     const room_id = redisKey.replace(CONFIG.REDIS.STROKES_KEY, '');
                     
                     await saveRoomStrokes(fastify, room_id, cachedStrokes);
                     
                     fastify.log.info(`Backed up strokes for room: ${room_id}`);
                     await deleteCacheValue(redisKey);
                } catch (error) {
                     fastify.log.error(error, `Failed to backup strokes for room ${redisKey}`);
                }
            });
            await Promise.all(strokePromises);
        }
    );
}

module.exports = require('fastify-plugin')(jobPlugin);
