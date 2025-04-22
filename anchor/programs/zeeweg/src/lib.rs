use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

declare_id!("HGY1cAiRYbgAcCFpSU9cYw21wpj9gVgWERpo8RRTeZdu");

use instructions::*;

#[program]
pub mod zeeweg {
    use super::*;

    pub fn add_marker(
        ctx: Context<AddMarker>,
        description: state::MarkerDescription,
        position: state::Position,
    ) -> Result<()> {
        instructions::add_marker(ctx, description, position)
    }

    pub fn update_marker(
        ctx: Context<UpdateMarker>,
        description: state::MarkerDescription,
        position: state::Position,
    ) -> Result<()> {
        instructions::update_marker(ctx, description, position)
    }

    pub fn delete_marker(ctx: Context<DeleteMarker>, position: state::Position) -> Result<()> {
        instructions::delete_marker(ctx, position)
    }

    pub fn like_marker(ctx: Context<LikeMarker>) -> Result<()> {
        instructions::like_marker(ctx)
    }
}
