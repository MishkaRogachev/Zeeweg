use anchor_lang::prelude::*;

use crate::{constants::*, state::*};

#[derive(Accounts)]
#[instruction(position: Position)]
pub struct DeleteMarker<'info> {
    #[account(mut)]
    pub author: Signer<'info>,

    #[account(
        mut,
        seeds = [
            b"marker_entry",
            position.lat.to_le_bytes().as_ref(),
            position.lon.to_le_bytes().as_ref()
        ],
        bump,
        has_one = author,
        close = author
    )]
    pub marker_entry: Account<'info, MarkerEntry>,

    #[account(
        mut,
        seeds = [
            b"marker_tile",
            position.tile(TILE_RESOLUTION).x.to_le_bytes().as_ref(),
            position.tile(TILE_RESOLUTION).y.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub marker_tile: Account<'info, MarkerTile>,

    #[account(
        mut,
        seeds = [b"marker_author", author.key().as_ref()],
        bump
    )]
    pub marker_author: Account<'info, MarkerAuthor>,

    #[account(
        mut,
        seeds = [b"marker_vote", marker_entry.key().as_ref()],
        bump,
        close = author
    )]
    pub marker_votes: Account<'info, MarkerVotes>,

    pub system_program: Program<'info, System>,
}

pub fn delete_marker(ctx: Context<DeleteMarker>, _position: Position) -> Result<()> {
    let marker_key = ctx.accounts.marker_entry.key();

    // Remove from tile index
    let marker_tile = &mut ctx.accounts.marker_tile;
    marker_tile.markers.retain(|key| key != &marker_key);

    // Remove from author index
    let marker_author = &mut ctx.accounts.marker_author;
    marker_author.markers.retain(|key| key != &marker_key);

    // NOTE: don't close empty marker_tile and marker_author accounts for now

    // marker_entry and marker_votes are closed automatically by #[account(close = author)]
    Ok(())
}
