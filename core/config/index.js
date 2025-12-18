"use strict";

require("dotenv").config(); 

const config = {
    HOST: process.env.HOST || '0.0.0.0',
    PORT: parseInt(process.env.PORT) || 3000,
    SOCKET_PORT : parseInt(process.env.SOCKET_PORT) || 3001,
    APP_DB_CONFIG: {
        client: process.env.DB_CLIENT || 'postgres',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_DATABASE || 'whiteboard_db',
            port: parseInt(process.env.DB_PORT) || 5432,
        },
    },

    REDIS: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT) || 6379,
        QR_CODE_EXPIRY_IN_SECS: parseInt(process.env.QR_CODE_EXPIRY_IN_SECS) || 180,
        TOKEN_EXPIRY_IN_SECS: parseInt(process.env.TOKEN_EXPIRY_IN_SECS) || 3600,
        DEVICES_KEY: process.env.DEVICES_KEY || "_TOKEN_DEVICES",
        MESSAGES_KEY: process.env.REDIS_MESSAGES_KEY || "room_messages_",
        STROKES_KEY: process.env.REDIS_STROKES_KEY || "room_strokes_"
    },

    SCHEDULER: {
        BACKUP_CRON_SCHEDULE: process.env.BACKUP_CRON_SCHEDULE || '*/30 * * * * *'
    },

    SECURITY_KEYS: {
        ENCRYPTION_KEY_HEX: process.env.ENCRYPTION_KEY_HEX || "51d50fd2414f785fdd9cd1d7d6b98cbca8ce426b4f39a79affd9d900ca8d7eeb",
        IV_HEX: process.env.IV_HEX || "cc6f3e4f66ad34ade65e3e67fb96856c",
        JWT_SECRET: process.env.JWT_SECRET || "your_super_secret_jwt_key_here",
    },
    
    // Flat properties for backward compatibility and easier access
    // Database properties (matching user-management-services expectations)
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT) || 5432,
    DB_USER: process.env.DB_USER || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || 'root',
    DB_NAME: process.env.DB_DATABASE || 'whiteboard_db',
    
    // Redis properties (flat access)
    REDIS_HOST: process.env.REDIS_HOST || "localhost",
    REDIS_PORT: parseInt(process.env.REDIS_PORT) || 6379,
    
    // Token and QR code properties
    QR_CODE_EXPIRY: parseInt(process.env.QR_CODE_EXPIRY_IN_SECS) || 180,
    TOKEN_EXPIRY: parseInt(process.env.TOKEN_EXPIRY_IN_SECS) || 3600,
    DEVICES_KEY: process.env.DEVICES_KEY || "_TOKEN_DEVICES",
};

module.exports = config;