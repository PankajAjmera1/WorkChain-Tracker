# ⚡ WorkChain Tracker

**Gamified Decentralized Productivity Tracker built on Aptos & Shelby Protocol.**

WorkChain is a privacy-first desktop application that tracks your productivity, stores your data securely on the decentralized Shelby Protocol, and rewards you for your hard work with on-chain reputation and APT tokens.

![Dashboard](https://raw.githubusercontent.com/PankajAjmera1/WorkChain-Tracker/main/screenshots/dashboard.png)

## 🏆 Hackathon Tracks

We are submitting to the **Build on Aptos Hackathon - IBW**:

*   **Primary Track**: **Track 4: Shelby Consumer Integration**
    *   *Why*: We use Shelby Protocol as the backbone for user data storage, creating a "Training Data Compliance Platform" for personal productivity history.
*   **Secondary Track**: **Track 3: Consumer Apps, Culture & Others**
    *   *Why*: A consumer-facing app that gamifies the "boring" task of time tracking with leaderboards and rewards.

## 🚀 Key Features

*   **📊 Automated Tracking**: Automatically detects Coding, Meetings, and Browsing activity.
*   **🔒 Privacy-First**: All data is encrypted locally (AES-256) before leaving your device.
*   **☁️ Decentralized Storage**: Encrypted daily summaries are stored on **Shelby Protocol**, ensuring you own your data.
*   **⛓️ On-Chain Verification**: Work proofs and `blob_ids` are committed to the **Aptos Blockchain**.
*   **🏆 Gamified Leaderboard**: Compete with others based on a verified "Productivity Score".
*   **💰 Monthly Rewards**: Smart contract automatically distributes APT rewards to the top 3 users (50% / 30% / 20% split).

## 🧠 Proof of Work & Bounty System

WorkChain uses a smart evaluation engine to calculate a **Productivity Score** for every employee, which directly translates into monthly bounties.

### 1. Activity Evaluation
The system tracks "Core Activity" hours based on the active window:
*   **💻 Coding (High Value)**: VS Code, IntelliJ, Terminal. (1.5x Multiplier)
*   **📞 Communication (Medium Value)**: Slack, Discord, Zoom, Google Meet. (1.0x Multiplier)
*   **🌐 Research (Standard Value)**: Browser activity (StackOverflow, Documentation). (0.8x Multiplier)
*   **❌ Idle/Entertainment**: Social media or inactivity is filtered out.

### 2. Verification & Privacy
*   **Local Processing**: All activity categorization happens locally on the user's machine.
*   **Encrypted Proofs**: The detailed logs are encrypted and stored on **Shelby Protocol**.
*   **On-Chain Commit**: Only the final *score* and the *proof hash* are sent to the **Aptos Blockchain**. This proves the work was done without revealing sensitive details.

### 3. 💰 Bounty Distribution
At the end of each month, the smart contract automatically distributes the **Bounty Pool** (in APT) to the top performers:

*   **🥇 1st Place**: 50% of the Monthly Pool
*   **🥈 2nd Place**: 30% of the Monthly Pool
*   **🥉 3rd Place**: 20% of the Monthly Pool

*Example: If the monthly pool is 1000 APT, the top coder gets 500 APT automatically!*

## 🛠️ Tech Stack

*   **Frontend**: Angular 18, Electron, TailwindCSS (Green Theme)
*   **Blockchain**: Aptos Move (Smart Contracts)
*   **Storage**: Shelby Protocol SDK
*   **Encryption**: Node.js Crypto (AES-256-GCM)
*   **Database**: SQLite (Local caching)

## 📦 Installation

### Prerequisites
*   Node.js v18+
*   Aptos CLI
*   Shelby Protocol API Key

### 1. Clone the Repo
```bash
git clone https://github.com/PankajAjmera1/WorkChain-Tracker.git
cd WorkChain-Tracker
```

### 2. Install Dependencies
```bash
# Install backend/tracker dependencies
cd workchain-tracker
npm install

# Install frontend dependencies
cd ../frontend/workchain-dashboard
npm install
```

### 3. Configure Environment
Create a `.env` file in `workchain-tracker`:
```env
SHELBY_API_KEY=your_shelby_key
APTOS_PRIVATE_KEY=your_private_key
```

### 4. Run the App
```bash
# Start the tracker (Backend)
cd workchain-tracker
npm start

# Start the dashboard (Frontend)
cd frontend/workchain-dashboard
ng serve
```

## 📜 Smart Contract

The smart contract is deployed on **Aptos Testnet**.

*   **Address**: `0x745fe21b1f69dcb88e325f4fc3f3a3a0bd4bfbb03e62aabbb34b7be305fd9365`
*   **Modules**: `WorkProof`, `Leaderboard`, `RewardPool`

### Key Functions
*   `submit_work_proof`: Records daily stats and Shelby blob ID.
*   `update_user_stats`: Updates leaderboard rankings.
*   `distribute_monthly_rewards`: Distributes APT to top 3 winners.

## 💎 Shelby Integration

We use Shelby Protocol to store encrypted "Daily Summaries".
1.  **Capture**: App aggregates 24h of activity.
2.  **Encrypt**: JSON data is encrypted with the user's key.
3.  **Upload**: `ShelbyNodeClient` uploads the blob.
4.  **Link**: The returned `blob_id` is saved on-chain in the `WorkProof` struct.

This ensures that while the *proof* of work is public (on Aptos), the *details* of the work remain private and owned by the user (on Shelby).

## 📄 License
MIT
