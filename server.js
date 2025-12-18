'use strict'

const fs = require('fs');
const path = require('path');
require('make-promises-safe');
const fastify = require('fastify');

const helmet = require('@fastify/helmet');
const swagger = require('@fastify/swagger');
const swaggerUi = require('@fastify/swagger-ui');
const os = require('os');
const { ajvCompiler } = require('./qr_link/schemas/qr_schema');
const { v4: uuid } = require('uuid');
const { knexClientCreate } = require('./core/knex_query_builder');
const { validateAccessToken } = require('./user-management-services/utils/tokenGenerator');
const { initializeRedis } = require('./user-management-services/utils/redisClient');
const CONFIG = require('./core/config');
const { redisClientCreate } = require('./core/redis_config');
const fastifyCors = require("@fastify/cors");
const cronPlugin = require('./core/scheduler/scheduler');

const { logger } = require('./core/logger/logger')


function getAllRoutes(filePath, routes = []) {
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
        const files = fs.readdirSync(filePath);
        files.forEach((file) => {
            if (file !== "node_modules") {
                const fullPath = path.join(filePath, file);
                if (!file.startsWith(".")) {
                    getAllRoutes(fullPath, routes);
                }
            }
        });
    } else if (stats.isFile() && path.basename(filePath) === "routes.js") {
        routes.push(filePath);
    }
    return routes;
}

const helmetConfig = {
    noCache: true,
    policy: 'same-origin',
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            imgSrc: ["'self'", 'data:'],
            scriptSrc: ["'self' 'unsafe-inline'"]
        }
    }
}

async function serverSetup(swaggerURL) {
    try {
        const app = fastify({
            logger: true,
            genReqId: req => req.headers['x-request-id'] || uuid(),
            disableRequestLogging: true,
            bodyLimit: 5000000,
        });
        app.decorate('host_name', os.hostname());
        app.decorate('CONFIG', CONFIG);
        app.register(require('@fastify/sensible'));
        app.register(require('@fastify/formbody'));
        app.register(fastifyCors, {
            origin: true,
            credentials: true,
        });
        app.register(helmet, helmetConfig);
        app.register(swagger, swaggerConfig(swaggerURL));
        app.register(swaggerUi, {
            routePrefix: swaggerURL + 'swagger/public/documentation',
        });
        app.addHook('onRequest', async (request, reply) => {
            request.log.info({
                method: request.method,
                url: request.url,
                headers: request.headers, 
                body: request.body
            }, 'Incoming Request');
        });

        app.addHook('onResponse', async (request, reply) => {
            request.log.info({
                statusCode: reply.statusCode,
                responseTime: reply.getResponseTime()
            }, 'Response Sent');
        });

        await redisClientCreate(app, CONFIG.REDIS, 'redis');
        await knexClientCreate(app, CONFIG.APP_DB_CONFIG, 'knex');
        await initializeRedis(app.redis);

        app.register(require('./user-management-services/routes/authRoutes'), { prefix: '/user' });
        app.addHook('onRequest', async (request, reply) => {
            const authConfig = {
                JWT_SECRET: CONFIG.SECURITY_KEYS.JWT_SECRET,
                DEVICES_KEY: CONFIG.REDIS.DEVICES_KEY
            };
            return await validateAccessToken(request, reply, app, authConfig);
        });

        await app.register(cronPlugin);
        app.register(require('./whiteboard/scheduler'));
        await ajvCompiler(app, {});
        
        return app;
    } catch (err) {
        logger.error(err, "Server setup error");
        process.exit(1);
    }
};

const swaggerConfig = (url) => {
    url = url || 'http://localhost:3007';
    return {
        routePrefix: url + 'swagger/public/documentation',
        swagger: {
            info: {
                title: 'Swagger',
                description: 'Swagger for the project',
                version: '1.0.0'
            },
            schemes: ['http', 'https'],
            rbac: ['*'],
            consumes: [
                'application/json',
                'application/x-www-form-urlencoded',
                'application/xml',
                'text/xml'
            ],
            produces: [
                'application/json',
                'application/javascript',
                'application/xml',
                'text/xml',
                'text/javascript'
            ],
            securityDefinitions: {
                ApiToken: {
                    description: 'Authorization header token, sample: "Bearer #TOKEN#"',
                    type: 'apiKey',
                    name: 'Authorization',
                    in: 'header'
                },
                StaticToken: {
                    description: 'Add the Static token : "Static Token"',
                    type: 'apiKey',
                    name: 'qp-tc-request-id',
                    in: 'header'
                }
            }
        },
        exposeRoute: true
    };
};

process.on('uncaughtException', (err) => {
    try {
        logger.error(err, "UNCAUGHT_EXCEPTION");
    } catch (e) {
        console.error("Logger failed:", e);
        console.error("UNCAUGHT_EXCEPTION:", err);
    }
    setTimeout(() => {
        process.exit(1);
    })
});

process.on('unhandledRejection', (reason, promise) => {
    try {
        logger.error({ promise, reason }, "UNHANDLED_REJECTION");
    } catch (e) {
        console.error("Logger failed:", e);
        console.error("UNHANDLED_REJECTION:", reason);
    }
    process.exit(1);
});

module.exports = { getAllRoutes, serverSetup, logger };
