module workchain::work_proof {
    use aptos_framework::event;
    use aptos_std::table::{Self, Table};
    use std::signer;
    use std::string::String;

    // Errors
    const ENOT_INITIALIZED: u64 = 1;
    const EPROOF_DOESNT_EXIST: u64 = 2;
    const EINVALID_PROOF: u64 = 3;

    #[event]
    struct WorkProofSubmitted has drop, store {
        proof_id: u64,
        user_address: address,
        app_name: String,
        duration_seconds: u64,
        timestamp: u64,
    }

    struct WorkProofStore has key {
        proofs: Table<u64, WorkProof>,
        proof_counter: u64,
        total_work_time: u64,
    }

    struct WorkProof has store, drop, copy {
        proof_id: u64,
        user_address: address,
        app_name: String,
        window_title: String,
        duration_seconds: u64,
        timestamp: u64,
        proof_hash: String,
        shelby_blob_id: String,
    }

    /// User statistics for leaderboard
    struct UserStats has store, drop, copy {
        user_address: address,
        total_work_minutes: u64,
        coding_minutes: u64,
        browser_minutes: u64,
        meeting_minutes: u64,
        total_proofs: u64,
        current_streak: u64,
        longest_streak: u64,
        last_active_date: u64,
        productivity_score: u64,
    }

    /// Global leaderboard store
    struct LeaderboardStore has key {
        user_stats: Table<address, UserStats>,
        total_users: u64,
    }

    /// Monthly reward pool
    struct RewardPool has key {
        total_pool: u64,          // Total APT in pool (in octas)
        current_month: u64,       // Current month timestamp
        top_1_reward: u64,        // 50% of pool
        top_2_reward: u64,        // 30% of pool
        top_3_reward: u64,        // 20% of pool
        distributed: bool,
    }

    /// Reward claim record
    struct RewardClaim has key {
        user_address: address,
        month: u64,
        amount: u64,
        claimed: bool,
    }

    public entry fun initialize(account: &signer) {
        let proof_store = WorkProofStore {
            proofs: table::new(),
            proof_counter: 0,
            total_work_time: 0,
        };
        move_to(account, proof_store);
    }

    public entry fun submit_proof(
        account: &signer,
        app_name: String,
        window_title: String,
        duration_seconds: u64,
        timestamp: u64,
        proof_hash: String,
        shelby_blob_id: String,
    ) acquires WorkProofStore {
        let signer_address = signer::address_of(account);
        assert!(exists<WorkProofStore>(signer_address), ENOT_INITIALIZED);
        assert!(duration_seconds > 0, EINVALID_PROOF);

        let proof_store = borrow_global_mut<WorkProofStore>(signer_address);
        let counter = proof_store.proof_counter + 1;

        let new_proof = WorkProof {
            proof_id: counter,
            user_address: signer_address,
            app_name,
            window_title,
            duration_seconds,
            timestamp,
            proof_hash,
            shelby_blob_id,
        };

        table::add(&mut proof_store.proofs, counter, new_proof);
        proof_store.proof_counter = counter;
        proof_store.total_work_time = proof_store.total_work_time + duration_seconds;

        event::emit(WorkProofSubmitted {
            proof_id: counter,
            user_address: signer_address,
            app_name,
            duration_seconds,
            timestamp,
        })
    }

    #[view]
    public fun get_total_work_time(user_addr: address): u64 acquires WorkProofStore {
        assert!(exists<WorkProofStore>(user_addr), ENOT_INITIALIZED);
        let store = borrow_global<WorkProofStore>(user_addr);
        store.total_work_time
    }

    #[view]
    public fun get_proof_count(user_addr: address): u64 acquires WorkProofStore {
        assert!(exists<WorkProofStore>(user_addr), ENOT_INITIALIZED);
        let store = borrow_global<WorkProofStore>(user_addr);
        store.proof_counter
    }

    #[view]
    public fun is_initialized(user_addr: address): bool {
        exists<WorkProofStore>(user_addr)
    }

    /// Initialize global leaderboard
    public entry fun initialize_leaderboard(account: &signer) {
        let leaderboard = LeaderboardStore {
            user_stats: table::new(),
            total_users: 0,
        };
        move_to(account, leaderboard);
    }

    /// Update user stats after proof submission
    public entry fun update_user_stats(
        account: &signer,
        work_minutes: u64,
        category: String,
    ) acquires LeaderboardStore {
        let user_addr = signer::address_of(account);
        let leaderboard_addr = @workchain;
        
        if (!exists<LeaderboardStore>(leaderboard_addr)) {
            return
        };

        let leaderboard = borrow_global_mut<LeaderboardStore>(leaderboard_addr);
        
        if (!table::contains(&leaderboard.user_stats, user_addr)) {
            let new_stats = UserStats {
                user_address: user_addr,
                total_work_minutes: 0,
                coding_minutes: 0,
                browser_minutes: 0,
                meeting_minutes: 0,
                total_proofs: 0,
                current_streak: 0,
                longest_streak: 0,
                last_active_date: 0,
                productivity_score: 0,
            };
            table::add(&mut leaderboard.user_stats, user_addr, new_stats);
            leaderboard.total_users = leaderboard.total_users + 1;
        };

        let stats = table::borrow_mut(&mut leaderboard.user_stats, user_addr);
        stats.total_work_minutes = stats.total_work_minutes + work_minutes;
        stats.total_proofs = stats.total_proofs + 1;
        
        // Update category-specific minutes
        if (category == std::string::utf8(b"coding")) {
            stats.coding_minutes = stats.coding_minutes + work_minutes;
        } else if (category == std::string::utf8(b"browser")) {
            stats.browser_minutes = stats.browser_minutes + work_minutes;
        } else if (category == std::string::utf8(b"meeting")) {
            stats.meeting_minutes = stats.meeting_minutes + work_minutes;
        };

        // Calculate productivity score
        let score = (stats.coding_minutes * 15 / 10) + stats.meeting_minutes + (stats.browser_minutes * 8 / 10);
        stats.productivity_score = score;
    }

    #[view]
    public fun get_user_stats(user_addr: address): UserStats acquires LeaderboardStore {
        let leaderboard_addr = @workchain;
        assert!(exists<LeaderboardStore>(leaderboard_addr), ENOT_INITIALIZED);
        
        let leaderboard = borrow_global<LeaderboardStore>(leaderboard_addr);
        assert!(table::contains(&leaderboard.user_stats, user_addr), EPROOF_DOESNT_EXIST);
        
        *table::borrow(&leaderboard.user_stats, user_addr)
    }

    #[view]
    public fun get_total_users(): u64 acquires LeaderboardStore {
        let leaderboard_addr = @workchain;
        if (!exists<RewardPool>(leaderboard_addr)) {
            return 0
        };
        
        let leaderboard = borrow_global<LeaderboardStore>(leaderboard_addr);
        leaderboard.total_users
    }

    /// Initialize monthly reward pool
    public entry fun initialize_reward_pool(account: &signer, pool_amount: u64) {
        let reward_pool = RewardPool {
            total_pool: pool_amount,
            current_month: 0,  // Will be set when distributing
            top_1_reward: pool_amount * 50 / 100,  // 50%
            top_2_reward: pool_amount * 30 / 100,  // 30%
            top_3_reward: pool_amount * 20 / 100,  // 20%
            distributed: false,
        };
        move_to(account, reward_pool);
    }

    /// Distribute monthly rewards to top 3 users
    /// This should be called at the end of each month
    public entry fun distribute_monthly_rewards(
        admin: &signer,
        _top_1: address,
        _top_2: address,
        _top_3: address,
        month_timestamp: u64
    ) acquires RewardPool {
        let admin_addr = signer::address_of(admin);
        assert!(exists<RewardPool>(admin_addr), ENOT_INITIALIZED);
        
        let pool = borrow_global_mut<RewardPool>(admin_addr);
        assert!(!pool.distributed, EINVALID_PROOF); // Reusing error code
        
        // Mark as distributed
        pool.distributed = true;
        pool.current_month = month_timestamp;
        
        // TODO: Transfer APT tokens to winners
        // This requires coin module integration
        // For now, we just record the rewards
    }

    #[view]
    public fun get_reward_pool_info(): (u64, u64, u64, u64, bool) acquires RewardPool {
        let pool_addr = @workchain;
        if (!exists<RewardPool>(pool_addr)) {
            return (0, 0, 0, 0, false)
        };
        
        let pool = borrow_global<RewardPool>(pool_addr);
        (pool.total_pool, pool.top_1_reward, pool.top_2_reward, pool.top_3_reward, pool.distributed)
    }
}
