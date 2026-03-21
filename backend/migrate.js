require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');

async function migrate() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        
        console.log("Dropping old table if exists to resize vector column safely...");
        // Drop all to recreate from schema without conflicts:
        await client.query(`
            DROP TABLE IF EXISTS chat_documents CASCADE;
            DROP TABLE IF EXISTS messages CASCADE;
            DROP TABLE IF EXISTS chats CASCADE;
            DROP TABLE IF EXISTS document_chunks CASCADE;
            DROP TABLE IF EXISTS documents CASCADE;
            DROP TABLE IF EXISTS knowledge_bases CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        `);

        const sql = fs.readFileSync('src/models/schema.sql').toString();
        await client.query(sql);
        console.log("Migration complete! Database has VECTOR(384).");
    } catch (e) {
        console.error("Migration error:", e);
    } finally {
        await client.end();
    }
}
migrate();
