use anchor_lang::prelude::*;

use crate::{errors::ErrorCode, state::*};

#[derive(Accounts)]
pub struct UnvoteMarker<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,

    /// CHECK: MarkerEntry is only used for its PDA
    pub marker_entry: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"marker_vote", marker_entry.key().as_ref()],
        bump,
        realloc = crate::marker_votes_space!(marker_votes.votes.len() - 1), // shrink size by one
        realloc::payer = voter,
        realloc::zero = false
    )]
    pub marker_votes: Account<'info, MarkerVotes>,

    pub system_program: Program<'info, System>,
}

pub fn unvote_marker(ctx: Context<UnvoteMarker>) -> Result<()> {
    let votes = &mut ctx.accounts.marker_votes.votes;
    let voter_key = ctx.accounts.voter.key();

    let Some(index) = votes.iter().position(|v| v.voter == voter_key) else {
        return err!(ErrorCode::NoExistingVote);
    };

    votes.remove(index);
    Ok(())
}
