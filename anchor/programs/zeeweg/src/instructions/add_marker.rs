use anchor_lang::prelude::*;

use crate::{constants::*, state::*};

#[derive(Accounts)]
#[instruction(description: MarkerDescription, position: Position)]
pub struct AddMarker<'info> {
    #[account(mut)]
    pub author: Signer<'info>,

    #[account(
        init,
        payer = author,
        space = crate::marker_entry_space!(description),
        seeds = [
            b"marker_entry",
            position.lat.to_le_bytes().as_ref(),
            position.lon.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub marker_entry: Account<'info, MarkerEntry>,

    #[account(
        // NOTE: Using init_if_needed to avoid explicit init for tiles, there’s no re-initialization risk
        init_if_needed,
        payer = author,
        space = crate::marker_tile_space!(MAX_MARKERS_IN_TILE),
        seeds = [
            b"marker_tile",
            position.tile(TILE_RESOLUTION).x.to_le_bytes().as_ref(),
            position.tile(TILE_RESOLUTION).y.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub marker_tile: Account<'info, MarkerTile>,

    #[account(
         // NOTE: Using init_if_needed to avoid explicit init for author, there’s no re-initialization risk
        init_if_needed,
        payer = author,
        space = crate::marker_author_space!(MAX_MARKERS_PER_AUTHOR),
        seeds = [b"marker_author", author.key().as_ref()],
        bump,
    )]
    pub marker_author: Account<'info, MarkerAuthor>,

    pub system_program: Program<'info, System>,
}

pub fn add_marker(
    ctx: Context<AddMarker>,
    description: MarkerDescription,
    position: Position,
) -> Result<()> {
    let marker_key = ctx.accounts.marker_entry.key();
    let tile = position.tile(TILE_RESOLUTION);
    let now = Clock::get()?.unix_timestamp;

    // Write marker data
    let marker_entry = &mut ctx.accounts.marker_entry;
    marker_entry.author = ctx.accounts.author.key();
    marker_entry.description = description;
    marker_entry.position = position;
    marker_entry.likes = 0;
    marker_entry.created_at = now;
    marker_entry.updated_at = now;

    // Update marker_tile
    let marker_tile = &mut ctx.accounts.marker_tile;
    if marker_tile.markers.iter().all(|k| k != &marker_key) {
        marker_tile.markers.push(marker_key);
        if marker_tile.markers.len() == 1 {
            marker_tile.tile = tile;
        }
    }

    // Update marker_author
    let marker_author = &mut ctx.accounts.marker_author;

    if marker_author.markers.is_empty() {
        marker_author.author = ctx.accounts.author.key();
    }

    if marker_author.markers.iter().all(|k| k != &marker_key) {
        marker_author.markers.push(marker_key);
    }

    Ok(())
}
