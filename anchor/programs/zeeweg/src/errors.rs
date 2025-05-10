use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Already voted")]
    AlreadyVoted,

    #[msg("No existing vote")]
    NoExistingVote,
}
