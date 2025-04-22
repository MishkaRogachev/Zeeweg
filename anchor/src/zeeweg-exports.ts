// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor'
import * as anchor from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'

import ZeewegIDL from '../target/idl/zeeweg.json'
import type { Zeeweg } from '../target/types/zeeweg'

// Re-export the generated IDL and type
export { Zeeweg, ZeewegIDL }

// The programId is imported from the program IDL.
export const ZEEWEG_PROGRAM_ID = new PublicKey(ZeewegIDL.address)

// This is a helper function to get the Basic Anchor program.
export function getZeewegProgram(provider: AnchorProvider) {
  return new Program(ZeewegIDL as Zeeweg, provider)
}

// Tile resolution is the size of the tile in microdegrees
export const MARKER_TILE_RESOLUTION = 100_000

// This marker type enumeration, should match MarkerType from state.rs
export type MarkerType =
  | { basic: {} }
  | { park: {} }
  | { beach: {} }
  | { mountainPeak: {} }
  | { historical: {} }
  | { restaurant: {} }
  | { hazard: {} }

// This is the position type, should match Position from state.rs
export interface Position {
  lat: number // in microdegrees ( degrees * 1e6)
  lon: number // in microdegrees ( degrees * 1e6)
}

// This is the marker data type, should match MarkerDescription from state.rs
export interface MarkerDescription {
  name: string
  details: string
  markerType: MarkerType
}

// This is the marker entry type, should match MarkerEntry from state.rs
export interface MarkerEntry {
  author: PublicKey
  description: MarkerDescription
  position: Position
  createdAt: BN
  updatedAt: BN
  likes: BN
}

// MarkerEntry PDA depends on the position (lat, lon)
export function getMarkerEntryPda(program: Program<Zeeweg>, position: Position): PublicKey {
  const [entryPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('marker_entry'),
      Buffer.from(new Int32Array([position.lat]).buffer),
      Buffer.from(new Int32Array([position.lon]).buffer),
    ],
    program.programId
  )
  return entryPda
}

// MarkerTile PDA depends on the tile X and Y coordinates
// Tile coordinates are calculated by dividing the lat/lon by the tile resolution
export function getMarkerTilePda(program: Program<Zeeweg>, tileX: number, tileY: number): PublicKey {
  const [tilePda] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('marker_tile'),
      Buffer.from(new Int32Array([tileX]).buffer),
      Buffer.from(new Int32Array([tileY]).buffer),
    ],
    program.programId
  )
  return tilePda
}

// MarkerAuthor PDA depends on the author public key
export function getMarkerAuthorPda(program: Program<Zeeweg>, author: PublicKey): PublicKey {
  const [authorPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('marker_author'), author.toBuffer()],
    program.programId
  )
  return authorPda
}
