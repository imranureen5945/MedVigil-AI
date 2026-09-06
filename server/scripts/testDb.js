const fs = require('fs');
const path = require('path');

const dbFile = path.resolve(__dirname, '../data/medvigil.db');
if (fs.existsSync(dbFile)) {
    fs.unlinkSync(dbFile);
    console.log('Removed old database file.');
}

const { initDb, prepareAndAll } = require('../config/database');

async function test() {
    await initDb();
    const tables = prepareAndAll("SELECT name FROM sqlite_master WHERE type='table'").map(t => t.name);
    console.log('Database tables:', tables);
    const medCount = prepareAndAll("SELECT COUNT(*) as c FROM medicines")[0].c;
    console.log('Medicine count:', medCount);
    const historyCount = prepareAndAll("SELECT COUNT(*) as c FROM medicine_history")[0].c;
    console.log('Active medicine history count:', historyCount);
    const allergyCount = prepareAndAll("SELECT COUNT(*) as c FROM allergies")[0].c;
    console.log('Allergies count:', allergyCount);
    console.log('Database setup verification passed!');
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
