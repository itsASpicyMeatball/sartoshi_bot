"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const pkg = require("pg");
require("dotenv").config();
const { Pool } = pkg;
let pgClient;
if (process.env.NODE_ENV === "development") {
    pgClient = new Pool({
        connectionString: process.env.DEV_DATABASE_URL,
    });
}
else {
    pgClient = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    });
}
pgClient.connect();
function findId(author_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = `SELECT twitter_id from users where twitter_id=$1`;
        const response = yield pgClient.query(query, [author_id]);
        return response.rows.length > 0;
    });
}
function saveId(author_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = `INSERT INTO users (twitter_id, "createdAt", "updatedAt") VALUES ($1, NOW(), NOW())`;
        const response = yield pgClient.query(query, [author_id]);
        return 1;
    });
}
module.exports = { findId, saveId };
