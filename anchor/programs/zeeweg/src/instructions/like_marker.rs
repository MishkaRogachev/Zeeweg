// filepath: /Users/vdtn/Workspaces/Solana/Zeeweg/anchor/programs/zeeweg/src/instructions/like_marker.rs
use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct LikeMarker<'info> {

    #[account(mut)]
    pub author: Signer<'info>,

    #[account(mut)]
    pub marker_entry: Account<'info, MarkerEntry>,

}

pub fn like_marker(ctx: Context<LikeMarker>) -> Result<()> {
    let marker = &mut ctx.accounts.marker_entry;
    marker.likes += 1; // Increment the likes count
    Ok(())
}