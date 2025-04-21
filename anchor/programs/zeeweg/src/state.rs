use anchor_lang::prelude::*;

/// Position represents a geographical point in WGS84 coordinate system
/// on the map using latitude and longitude in microdegrees ( degrees * 1e6).
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub struct Position {
    pub lat: i32,
    pub lon: i32,
}

/// Tile represents a fixed-size square region on the map,
/// defined by a resolution in microdegrees (e.g. 100_000 = 0.1°).
///
/// For example, given:
///   lat = 43160889 (43.160889°)
/// 
///   lon = -2934364 (-2.934364°)
/// and resolution = 100_000,
/// the resulting tile will be:
///   x = 43160889 / 100_000 = 431
///   y = -2934364 / 100_000 = -29
///
/// This allows grouping markers spatially for fast region queries.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub struct Tile {
    pub x: i32,
    pub y: i32,
}

/// MarkerType enum representing different types of markers.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum MarkerType {
    Basic,
    Park,
    Beach,
    MountainPeak,
    Historical,
    Restaurant,
    Hazard,
}

/// MarkerDescription holds metadata about a marker, including its name, details, and type.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub struct MarkerDescription {
    pub name: String,
    pub details: String,
    pub marker_type: MarkerType,
}

/// MarkerEntry is a PDA that stores the marker's author, metadata, position on the map and timestamps.
#[account]
pub struct MarkerEntry {
    pub author: Pubkey,
    pub description: MarkerDescription,
    pub position: Position,
    pub created_at: i64,
    pub updated_at: i64,
    pub likes: u64, // New field to track likes
}

/// MarkerTile is a PDA that stores mapping tile -> markers.
#[account]
pub struct MarkerTile {
    pub tile: Tile,
    pub markers: Vec<Pubkey>, // PDAs of marker entries in this tile
}

/// MarkerAuthor is a PDA that stores mapping author -> markers.
#[account]
pub struct MarkerAuthor {
    pub author: Pubkey,
    pub markers: Vec<Pubkey>, // PDAs of marker entries in this tile
}

impl Position {
    pub fn tile(&self, resolution: i32) -> Tile {
        Tile {
            x: self.lat.div_euclid(resolution),
            y: self.lon.div_euclid(resolution),
        }
    }
}

#[macro_export]
macro_rules! marker_entry_space {
    ($description:expr) => {
        8 +                                     // discriminator
        32 +                                    // author: Pubkey
        4 + $description.name.len() +           // name
        4 + $description.details.len() +        // details
        std::mem::size_of::<MarkerType>() +     // marker_type
        std::mem::size_of::<Position>() +       // position
        8 +                                     // created_at: i64
         8 +                                    // updated_at: i64
        8                                       // likes: u64
    };
}

#[macro_export]
macro_rules! marker_tile_space {
    ($max_markers:expr) => {
        8 +                                     // discriminator
        std::mem::size_of::<Tile>() +           // tile
        4 + ($max_markers * 32)                 // Vec<Pubkey>: 4-byte length + 32 bytes per pubkey
    };
}

#[macro_export]
macro_rules! marker_author_space {
    ($max_markers:expr) => {
        8 +                                     // discriminator
        32 +                                    // author: Pubkey
        4 + ($max_markers * 32)                 // Vec<Pubkey>: 4-byte length + 32 bytes per pubkey
    };
}
