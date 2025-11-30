# ⚡ WorkChain: Gamified Decentralized Productivity
## Build on Aptos Hackathon - IBW Submission

---

## 🎯 Track Submission
**Primary Track:** Track 4: Shelby Consumer Integration
**Secondary Track:** Track 3: Consumer Apps, Culture & Others

**Why Track 4?**
WorkChain leverages **Shelby Protocol** to give users true ownership of their productivity data. Instead of storing sensitive work logs on centralized servers, we encrypt and store them on Shelby's decentralized storage, creating a "Training Data Compliance Platform" for personal productivity.

---

## 🔴 The Problem
1. **Data Silos**: Your work history (coding, meetings, browsing) is scattered across apps and owned by corporations.
2. **Lack of Motivation**: Remote work can be isolating and demotivating without feedback loops.
3. **Privacy Concerns**: Productivity trackers often spy on users, creating a surveillance culture.
4. **Zero Value for Data**: Users generate valuable work data but get nothing in return.

---

## 🟢 The Solution: WorkChain
A privacy-first, gamified productivity tracker built on **Aptos** and **Shelby Protocol**.

*   **🛡️ Privacy First**: Data is encrypted locally and stored on **Shelby**. You own your data.
*   **🎮 Gamified**: Earn XP, badges, and streaks for productive work. Compete on the global leaderboard.
*   **💰 Rewarding**: Top performers earn **PAT (Productivity Aptos Token)** rewards monthly.
*   **⚡ Verifiable**: Work proofs are submitted on-chain to Aptos, creating a verifiable "Proof of Work" history.

---

## 🚀 Key Features
*   **Automated Tracking**: Smartly categorizes Coding (VS Code), Meetings (Zoom/Meet), and Research (Browser).
*   **Shelby Integration**: Daily summaries are encrypted and uploaded to Shelby Protocol (Blob storage).
*   **Aptos Leaderboard**: On-chain ranking system based on verified productivity scores.
*   **Monthly Rewards**: Smart contract automatically distributes APT to top 3 users (50%/30%/20% split).
*   **Modern UI**: Beautiful, dark-mode dashboard with real-time analytics.

---

## 🛠️ Technical Architecture
*   **Frontend**: Angular + Electron (Desktop App)
*   **Blockchain**: Aptos Move (Smart Contracts for Proofs & Rewards)
*   **Storage**: Shelby Protocol (Decentralized Data Lake)
*   **Identity**: Aptos Wallet (Login & Rewards)
*   **Encryption**: AES-256 (Local encryption before Shelby upload)

---

## 💎 Shelby Integration Details
We use Shelby Protocol to solve the **Data Sovereignty** problem.

1.  **Capture**: Electron app captures activity snapshots.
2.  **Encrypt**: Data is encrypted using the user's wallet signature.
3.  **Upload**: Encrypted blobs are uploaded to **Shelby Testnet**.
4.  **Verify**: The `blob_id` is stored on the Aptos smart contract as proof of storage.

*This allows users to carry their work history between employers or platforms without privacy risks.*

---

## 💰 Business Model & Tokenomics
*   **Freemium Model**: Basic tracking is free.
*   **Premium Features**: Advanced analytics and team leaderboards.
*   **Data Marketplace (Future)**: Users can opt-in to sell anonymized productivity datasets to AI researchers (via Shelby).
*   **Rewards**: Sponsored prize pools for the monthly leaderboard.

---

## 🗺️ Roadmap
*   **Phase 1 (Done)**: Desktop Tracker, Shelby Storage, Aptos Leaderboard.
*   **Phase 2 (Next)**: Team/Organization Leaderboards, NFT Badges.
*   **Phase 3**: AI Productivity Coach (using personal data from Shelby).
*   **Phase 4**: "Proof of Skill" Verifiable Credentials for hiring.

---

## 🔚 Conclusion
WorkChain isn't just a tracker; it's the future of **WorkFi**. By combining Aptos speed with Shelby's storage, we're making productivity fun, private, and profitable.

**Links:**
*   [GitHub Repo](https://github.com/PankajAjmera1/WorkChain-Tracker)
