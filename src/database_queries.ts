const pkg = require("pg");
require("dotenv").config();

const { Pool } = pkg;
let pgClient;
if (process.env.NODE_ENV === "development") {
  pgClient = new Pool({
    connectionString: process.env.DEV_DATABASE_URL,
  });
} else {
  pgClient = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  });
}

pgClient.connect();

async function findId(author_id) {
    const query = `SELECT twitter_id from users where twitter_id=$1`

    const response = await pgClient.query(query, [author_id]);
    return response.rows.length > 0;
}

async function saveId(author_id) {
    const query = `INSERT INTO users (twitter_id, "createdAt", "updatedAt") VALUES ($1, NOW(), NOW())`;

    const response = await pgClient.query(query, [author_id]);
    return 1;
}
module.exports = { findId, saveId };