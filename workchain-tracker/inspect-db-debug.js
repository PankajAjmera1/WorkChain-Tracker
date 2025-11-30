const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function inspectDb() {
    const dbPath = path.join(os.homedir(), 'AppData', 'Roaming', 'workchain-tracker', 'workchain.db');
    console.log(`Reading database from: ${dbPath}`);

    if (!fs.existsSync(dbPath)) {
        console.error('Database file not found!');
        return;
    }

    const SQL = await initSqlJs();
    const buffer = fs.readFileSync(dbPath);
    const db = new SQL.Database(buffer);

    const result = db.exec("SELECT * FROM daily_summaries ORDER BY date DESC LIMIT 1");

    if (result.length > 0) {
        const columns = result[0].columns;
        const row = result[0].values[0];
        console.log('Latest Summary:');
        columns.forEach((col, i) => {
            console.log(`${col}: ${row[i]}`);
        });
    } else {
        console.log('No summaries found.');
    }
}

inspectDb();
