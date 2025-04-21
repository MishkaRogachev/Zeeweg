import { AnchorProvider } from '@coral-xyz/anchor'

import * as zeeweg from '@project/anchor'
import { PublicKey } from '@solana/web3.js'

export interface Marker {
  description: zeeweg.MarkerDescription
  position: zeeweg.Position
  likes: number // Add the likes property
}

export async function upsertMarker(provider: AnchorProvider, marker: Marker, isNew: boolean): Promise<string> {
  const program = zeeweg.getZeewegProgram(provider)

  // Step 1: Get PDAs for the marker entry and tile
  const entryPda = zeeweg.getMarkerEntryPda(program, marker.position)

  const tileX = Math.floor(marker.position.lat / zeeweg.MARKER_TILE_RESOLUTION)
  const tileY = Math.floor(marker.position.lon / zeeweg.MARKER_TILE_RESOLUTION)
  const tilePda = zeeweg.getMarkerTilePda(program, tileX, tileY)

  const accounts = {
    author: provider.wallet.publicKey,
    markerEntry: entryPda,
    markerTile: tilePda,
  } as any

  let sig = ''
  if (isNew) {
    // Step 2a: Create a new marker
    sig = await program.methods
      .addMarker(marker.description, marker.position)
      .accounts(accounts)
      .rpc()
  } else {
    // Step 2b: Update an existing marker
    sig = await program.methods
      .updateMarker(marker.description, marker.position)
      .accounts(accounts)
      .rpc()
  }

  // Step 3: Confirm the transaction
  const latestBlockHash = await provider.connection.getLatestBlockhash();
  await provider.connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: sig,
  });

  return sig
}

export async function deleteMarker(provider: AnchorProvider, marker: Marker): Promise<string> {
  const program = zeeweg.getZeewegProgram(provider)

  // Step 1: Get PDAs for the marker entry and tile
  const entryPda = zeeweg.getMarkerEntryPda(program, marker.position)

  const tileX = Math.floor(marker.position.lat / zeeweg.MARKER_TILE_RESOLUTION)
  const tileY = Math.floor(marker.position.lon / zeeweg.MARKER_TILE_RESOLUTION)
  const tilePda = zeeweg.getMarkerTilePda(program, tileX, tileY)

  // Step 2: Delete the marker
  const sig = await program.methods
    .deleteMarker(marker.position)
    .accounts({
      author: provider.wallet.publicKey,
      markerEntry: entryPda,
      markerTile: tilePda,
    })
    .rpc()

  // Step 3: Confirm the transaction
  const latestBlockHash = await provider.connection.getLatestBlockhash();
  await provider.connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: sig,
  });

  return sig
}


export async function getMarkersByTiles(provider: AnchorProvider, tiles: { x: number; y: number }[]): Promise<Marker[]> {
  const program = zeeweg.getZeewegProgram(provider)

  // Step 1: Get PDAs for each tile
  const tilePdas = tiles.map(tile => zeeweg.getMarkerTilePda(program, tile.x, tile.y))

  // Step 2: Fetch tile accounts
  const tileAccounts = await program.account.markerTile.fetchMultiple(tilePdas)

  // Step 3: Extract all marker PDAs from those tiles
  const markerPdas = tileAccounts.flatMap(tile => tile?.markers ?? [])
  if (markerPdas.length === 0) return []

  // Step 4: Fetch marker entries
  const markerEntries = await program.account.markerEntry.fetchMultiple(markerPdas)

  // Step 5: Combine entries with decoded positions
  return markerEntries
    .filter((entry): entry is zeeweg.MarkerEntry => !!entry)
    .map((entry) => ({
      description: entry.description,
      position: entry.position,
      likes: entry.likes.toNumber(),
    }))
}

export async function getMarkersByAuthor(provider: AnchorProvider, pubkey: PublicKey): Promise<Marker[]> {
  const program = zeeweg.getZeewegProgram(provider)

  // Step 1: Get PDA for author public key
  const authorPda = zeeweg.getMarkerAuthorPda(program, pubkey)

  // Step 2: Fetch author account (can be null)
  const authorAccount = await program.account.markerAuthor.fetchNullable(authorPda)
  if (!authorAccount) return []

  // Step 3: Extract all marker PDAs from the author account
  const markerPdas = authorAccount?.markers ?? []
  if (markerPdas.length === 0) return []

  // Step 4: Fetch marker entries
  const markerEntries = await program.account.markerEntry.fetchMultiple(markerPdas)

  return markerEntries
    .filter((entry): entry is zeeweg.MarkerEntry => !!entry)
    .map((entry) => ({
      description: entry.description,
      position: entry.position,
      likes: entry.likes.toNumber(),
    }))
}

export async function getMarkerByLonLat(provider: AnchorProvider, lon: number, lat: number): Promise<Marker | null> {
  const program = zeeweg.getZeewegProgram(provider)

  // Step 1: Get PDA for the marker entry
  const entryPda = zeeweg.getMarkerEntryPda(program, { lon, lat })

  // Step 2: Fetch marker entry account (can be null)
  const markerAccount = await program.account.markerEntry.fetchNullable(entryPda)
  if (!markerAccount) return null

  return {
    description: markerAccount.description as zeeweg.MarkerDescription,
    position: markerAccount.position as zeeweg.Position,
    likes: markerAccount.likes.toNumber(),
  }
}


export async function likeMarker(provider: AnchorProvider, marker: Marker): Promise<string> {
  const program = zeeweg.getZeewegProgram(provider)

  // Step 1: Get PDAs for the marker entry and tile
  const entryPda = zeeweg.getMarkerEntryPda(program, marker.position)

  const tileX = Math.floor(marker.position.lat / zeeweg.MARKER_TILE_RESOLUTION)
  const tileY = Math.floor(marker.position.lon / zeeweg.MARKER_TILE_RESOLUTION)
  const tilePda = zeeweg.getMarkerTilePda(program, tileX, tileY)

  // Step 2: Delete the marker
  const sig = await program.methods
    .likeMarker()
    .accounts({
      author: provider.wallet.publicKey,
      markerEntry: entryPda,
    })
    .rpc()

  // Step 3: Confirm the transaction
  const latestBlockHash = await provider.connection.getLatestBlockhash();
  await provider.connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: sig,
  });

  return sig
}