use crate::STATE;
use candid::Principal;
use ic_cdk::caller;
use junobuild_satellite::get_admin_controllers;

pub fn caller_is_user() -> Result<(), String> {
    let caller = caller();
    let user: Principal = STATE.with(|state| state.borrow().user).unwrap();
    if caller == user {
        Ok(())
    } else {
        Err("Caller is not the user of the canister.".to_string())
    }
}

pub fn caller_is_admin() -> Result<(), String> {
    let caller = caller();
    let admins = get_admin_controllers();

    if admins.contains(&caller) {
        Ok(())
    } else {
        Err("Caller is not the admin of the canister.".to_string())
    }
}
