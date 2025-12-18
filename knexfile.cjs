require('dotenv').config();

module.exports = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'danvin',
      password: process.env.DB_PASSWORD || 'pass',
      database: process.env.DB_DATABASE || 'postgres',
      port: process.env.DB_PORT || 5432,
    },
    migrations: {
      directory: "./migrations",
      extension: "js",
    },
    seeds: {
      directory: "./seeds",
    },
  },
};


//   production: {
//     client: "pg",
//     connection: process.env.DATABASE_URL, 
//     migrations: {
//       directory: "../migrations",
//       extension: "js"
//     },
//     seeds: {
//       directory: "./seeds"
//     }
//   }
// };
