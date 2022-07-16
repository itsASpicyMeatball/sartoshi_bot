import pkg from "pg";
import * as dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;
let pgClient: any;
if (process.env.NODE_ENV === "development") {
  pgClient = new Pool({
    connectionString: process.env.DEV_DATABASE_URL,
  });
} else {
  pgClient = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

pgClient.connect();

async function findId(author_id:number) {
    const query = `SELECT twitter_id from users where twitter_id=$1`

    const response = await pgClient.query(query, [author_id]);
    return response.rows.length > 0;
}

async function saveId(author_id:number) {
    const query = `INSERT INTO users (twitter_id, "createdAt", "updatedAt") VALUES ($1, NOW(), NOW())`;

    const response = await pgClient.query(query, [author_id]);
    return 1;
}

async function deleteId(author_id:number) {
  const query = `DELETE FROM users where twitter_id=$1`

  const response = await pgClient.query(query, [author_id])
  return 1;
}

export {findId, saveId, deleteId};