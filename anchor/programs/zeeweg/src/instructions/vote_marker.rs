use anchor_lang::prelude::*;

use crate::{errors::ErrorCode, state::*};

#[derive(Accounts)]
pub struct VoteMarker<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,

    /// CHECK: MarkerEntry is only used for its PDA
    pub marker_entry: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [b"marker_vote", marker_entry.key().as_ref()],
        bump,
        realloc = crate::marker_votes_space!(marker_votes.votes.len() + 1), // increase size by one vote
        realloc::payer = voter,
        realloc::zero = false
    )]
    pub marker_votes: Account<'info, MarkerVotes>,

    pub system_program: Program<'info, System>,
}

pub fn vote_marker(ctx: Context<VoteMarker>, vote: VoteValue) -> Result<()> {
    let votes = &mut ctx.accounts.marker_votes.votes;
    let voter_key = ctx.accounts.voter.key();

    // Prevent duplicate votes
    if votes.iter().any(|v| v.voter == voter_key) {
        return err!(ErrorCode::AlreadyVoted);
    }

    votes.push(MarkerVote {
        voter: voter_key,
        value: vote,
    });

    Ok(())
}
