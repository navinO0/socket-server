"use strict";

require("dotenv").config(); 

const CONFIG = {
    HOST: process.env.HOST || '0.0.0.0',
    PORT: process.env.PORT || 3000,
    SOCKET_PORT : process.env.SOCKET_PORT || 3001,
    APP_DB_CONFIG: {
        client: process.env.DB_CLIENT || 'postgres',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_DATABASE || 'whiteboard_db',
            port: process.env.DB_PORT || '5432',
        },
    },

    REDIS: {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
        QR_CODE_EXPIRY_IN_SECS: process.env.QR_CODE_EXPIRY_IN_SECS || 180,
        TOKEN_EXPIRY_IN_SECS: process.env.TOKEN_EXPIRY_IN_SECS || 3600,
        DEVICES_KEY: process.env.DEVICES_KEY || "_TOKEN_DEVICES"
    },

    SECURITY_KEYS: {
        KEY_HEX: process.env.ENCRYPTION_KEY_HEX || "51d50fd2414f785fdd9cd1d7d6b98cbca8ce426b4f39a79affd9d900ca8d7eeb",
        IV_HEX: process.env.IV_HEX || "cc6f3e4f66ad34ade65e3e67fb96856c",
        JWT_SECRET: process.env.JWT_SECRET || "your_super_secret_jwt_key_here",
    },
};

module.exports = CONFIG;