# WorkChain Desktop Tracker

Privacy-first desktop activity tracker that creates verifiable proof of work on the Aptos blockchain.

## Features  

- 📸 **Screenshot Hashing** - Captures screenshot hashes every 5 minutes (images never stored)
- 🖥️ **Activity Monitoring** - Tracks active windows and categorizes applications
- 🔒 **Local Encryption** - All sensitive data encrypted with AES-256-GCM
- 💾 **SQLite Storage** - Efficient local database for activity logs
- 🎯 **System Tray** - Minimal, non-intrusive interface
- 🔐 **Privacy-First** - Only aggregated data leaves your device

## Privacy Model

### What's Tracked (Locally)
- Window titles (hashed with SHA-256)
- Application names (categorized)
- Active time vs idle time
- Screenshot hashes (NOT the actual images)

### What's Stored (Encrypted)
- Encrypted activity logs in local SQLite database
- Screenshot hashes
- Daily summaries

### What Goes On-Chain (Future)
- User wallet address
- Date
- Total active hours (number only)
- Merkle root hash (proof of detailed logs)

## Installation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode
npm run dev

# Package for Windows
npm run package
```

## Development

### Project Structure
```
workchain-tracker/
├── src/
│   └── main/
│       ├── index.ts          # Main process entry
│       ├── tracker.ts        # Core tracking orchestrator
│       ├── screenshot.ts     # Screenshot hashing
│       ├── activity.ts       # Activity monitoring
│       ├── encryption.ts     # AES-256 encryption
│       ├── database.ts       # SQLite operations
│       ├── tray.ts           # System tray UI
│       └── types.ts          # TypeScript definitions
├── assets/                   # Icons and images
└── package.json
```

### Tech Stack
- **Electron 28** - Desktop app framework
- **TypeScript** - Type-safe development
- **better-sqlite3** - Fast SQLite database
- **active-win** - Active window detection
- **screenshot-desktop** - Screenshot capture
- **robotjs** - Mouse/keyboard activity detection

## Usage

1. **Start the app** - It will appear in your system tray
2. **Tracking auto-starts** - Work activity is monitored automatically
3. **Pause anytime** - Right-click tray icon → Pause Tracking
4. **View stats** - Check daily summary in tray menu

## App Categories

The tracker automatically categorizes applications:

- **Coding**: VS Code, IntelliJ, PyCharm, etc.
- **Meetings**: Teams, Zoom, Slack, etc.
- **Browser**: Chrome, Firefox, Edge, etc.
- **Communication**: Outlook, Mail, Discord, etc.
- **Productivity**: Excel, Word, Notion, etc.
- **Other**: Everything else

## Database Schema

### activity_snapshots
- `timestamp` - When activity was captured
- `window_title_hash` - SHA-256 hash of window title
- `app_name` - Application name
- `app_category` - Categorized app type
- `is_active` - Whether user was active
- `encrypted_data` - Encrypted snapshot JSON
- `iv`, `tag` - Encryption parameters

### screenshot_hashes
- `timestamp` - When screenshot was captured
- `hash` - SHA-256 hash of screenshot

### daily_summaries
- `date` - Date (YYYY-MM-DD)
- `total_active_minutes` - Total active time
- `coding_minutes` - Time spent coding
- `meeting_minutes` - Time in meetings
- `browser_minutes` - Time in browser
- `communication_minutes` - Time in communication apps
- `productivity_minutes` - Time in productivity apps
- `merkle_root` - Merkle root of daily activity (future)
- `submitted_to_chain` - Whether submitted to blockchain (future)

## Security

- **Machine-specific encryption** - Uses machine ID in encryption key
- **No cloud storage** - All data stays on your device
- **Screenshot hashing only** - Original screenshots never stored
- **User control** - Pause/delete data anytime

## Future Features

- [ ] Angular dashboard for visualization
- [ ] Aptos blockchain integration
- [ ] Photon SDK for rewards
- [ ] Payment streaming based on verified hours
- [ ] Team leaderboards
- [ ] NFT achievement badges

## License

MIT

## Built For

Aptos Hackathon - India Blockchain Week 2025
