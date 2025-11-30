/**
 * Simple Database Inspector - Works without Electron
 * Run with: node dist/main/inspect-db-simple.js
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function inspectDatabase() {
    try {
        // Initialize sql.js
        const SQL = await initSqlJs();

        // Get database path (Windows AppData)
        const dbPath = path.join(
            process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'),
            'workchain-tracker',
            'workchain.db'
        );

        console.log('📂 Database Location:', dbPath);
        console.log('');

        // Check if database exists
        if (!fs.existsSync(dbPath)) {
            console.log('❌ Database not found!');
            console.log('   Make sure the Electron tracker has been running.');
            return;
        }

        // Load database
        const dbBuffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(dbBuffer);

        console.log('✅ Database loaded successfully!');
        console.log('');

        // 1. Show all tables
        console.log('📊 TABLES IN DATABASE:');
        console.log('═'.repeat(80));
        const tables = db.exec(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `);

        if (tables[0]) {
            tables[0].values.forEach((row) => {
                console.log(`  📋 ${row[0]}`);
            });
        }
        console.log('');

        // 2. Show table schemas
        console.log('🏗️  TABLE SCHEMAS:');
        console.log('═'.repeat(80));

        if (tables[0]) {
            tables[0].values.forEach((row) => {
                const tableName = row[0];
                console.log(`\n📋 Table: ${tableName}`);
                console.log('─'.repeat(80));

                const schema = db.exec(`PRAGMA table_info(${tableName})`);
                if (schema[0]) {
                    console.log('  Columns:');
                    schema[0].values.forEach((col) => {
                        const nullable = col[3] ? 'NOT NULL' : '';
                        const pk = col[5] ? 'PRIMARY KEY' : '';
                        console.log(`    - ${col[1]} (${col[2]}) ${nullable} ${pk}`.trim());
                    });
                }
            });
        }
        console.log('');

        // 3. Show row counts
        console.log('📈 ROW COUNTS:');
        console.log('═'.repeat(80));

        if (tables[0]) {
            tables[0].values.forEach((row) => {
                const tableName = row[0];
                const count = db.exec(`SELECT COUNT(*) FROM ${tableName}`);
                if (count[0]) {
                    console.log(`  ${tableName}: ${count[0].values[0][0]} rows`);
                }
            });
        }
        console.log('');

        // 4. Show recent activity snapshots
        console.log('🔍 RECENT ACTIVITY SNAPSHOTS (Last 10):');
        console.log('═'.repeat(80));

        const snapshots = db.exec(`
      SELECT 
        datetime(timestamp/1000, 'unixepoch', 'localtime') as time,
        app_name,
        app_category,
        is_active
      FROM activity_snapshots 
      ORDER BY timestamp DESC 
      LIMIT 10
    `);

        if (snapshots[0] && snapshots[0].values.length > 0) {
            console.log('  Time                | App Name          | Category      | Active');
            console.log('  ' + '─'.repeat(76));
            snapshots[0].values.forEach((row) => {
                const time = row[0];
                const app = (row[1] || 'Unknown').padEnd(17).substring(0, 17);
                const category = (row[2] || 'other').padEnd(13).substring(0, 13);
                const active = row[3] ? '✅' : '❌';
                console.log(`  ${time} | ${app} | ${category} | ${active}`);
            });
        } else {
            console.log('  No activity snapshots yet');
        }
        console.log('');

        // 5. Show screenshot hashes
        console.log('📸 SCREENSHOT HASHES (Last 5):');
        console.log('═'.repeat(80));

        const hashes = db.exec(`
      SELECT 
        datetime(timestamp/1000, 'unixepoch', 'localtime') as time,
        hash
      FROM screenshot_hashes 
      ORDER BY timestamp DESC 
      LIMIT 5
    `);

        if (hashes[0] && hashes[0].values.length > 0) {
            console.log('  Time                | Hash');
            console.log('  ' + '─'.repeat(76));
            hashes[0].values.forEach((row) => {
                console.log(`  ${row[0]} | ${row[1]}`);
            });
        } else {
            console.log('  No screenshot hashes yet');
        }
        console.log('');

        // 6. Show daily summaries
        console.log('📅 DAILY SUMMARIES:');
        console.log('═'.repeat(80));

        const summaries = db.exec(`
      SELECT 
        date,
        total_active_minutes,
        coding_minutes,
        meeting_minutes,
        browser_minutes,
        submitted_to_chain
      FROM daily_summaries 
      ORDER BY date DESC 
      LIMIT 5
    `);

        if (summaries[0] && summaries[0].values.length > 0) {
            console.log('  Date       | Total | Coding | Meetings | Browser | Submitted');
            console.log('  ' + '─'.repeat(76));
            summaries[0].values.forEach((row) => {
                const total = `${Math.floor(row[1] / 60)}h ${row[1] % 60}m`.padEnd(5);
                const coding = `${Math.floor(row[2] / 60)}h ${row[2] % 60}m`.padEnd(6);
                const meetings = `${Math.floor(row[3] / 60)}h ${row[3] % 60}m`.padEnd(8);
                const browser = `${Math.floor(row[4] / 60)}h ${row[4] % 60}m`.padEnd(7);
                const submitted = row[5] ? '✅' : '❌';
                console.log(`  ${row[0]} | ${total} | ${coding} | ${meetings} | ${browser} | ${submitted}`);
            });
        } else {
            console.log('  No daily summaries yet');
        }
        console.log('');

        // 7. Show category breakdown for today
        console.log('📊 TODAY\'S CATEGORY BREAKDOWN:');
        console.log('═'.repeat(80));

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const today = `${year}-${month}-${day}`;
        const categoryBreakdown = db.exec(`
      SELECT 
        app_category,
        COUNT(*) as snapshots,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_snapshots
      FROM activity_snapshots
      WHERE date(timestamp/1000, 'unixepoch', 'localtime') = '${today}'
      GROUP BY app_category
      ORDER BY active_snapshots DESC
    `);

        if (categoryBreakdown[0] && categoryBreakdown[0].values.length > 0) {
            console.log('  Category      | Total Snapshots | Active Snapshots | Est. Minutes');
            console.log('  ' + '─'.repeat(76));
            categoryBreakdown[0].values.forEach((row) => {
                const category = (row[0] || 'other').padEnd(13);
                const total = String(row[1]).padEnd(15);
                const active = String(row[2]).padEnd(16);
                const minutes = Math.floor(row[2] * 0.5); // Each snapshot is ~30 seconds
                console.log(`  ${category} | ${total} | ${active} | ~${minutes}m`);
            });
        } else {
            console.log('  No activity recorded today');
        }
        console.log('');

        console.log('✅ Database inspection complete!');
        console.log('');
        console.log('💡 TIP: You can also use DB Browser for SQLite to explore visually:');
        console.log('   Download: https://sqlitebrowser.org/dl/');

        db.close();

    } catch (error) {
        console.error('❌ Error inspecting database:', error);
    }
}

// Run the inspector
inspectDatabase();
