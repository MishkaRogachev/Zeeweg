/// Maximum number of markers a single tile chunk can store without realloc.
/// Computed as: floor((10_240 - 8 (discriminator) - 8 (Tile) - 4 (vec len)) / 32)
pub const MAX_MARKERS_IN_CHUNK: usize = 319;

/// Size of a tile in microdegrees (° × 1e6).
/// Each tile covers 0.1° × 0.1° of geodetic space.
pub const TILE_RESOLUTION: i32 = 100_000;
