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
        };

        proof_store.proofs.upsert(counter, new_proof);
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
}
