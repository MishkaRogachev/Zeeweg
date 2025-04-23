import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import assert from 'assert'

import * as zeeweg from '../src/zeeweg-exports'
import * as helpers from './helpers'

describe('markers', () => {
  anchor.setProvider(anchor.AnchorProvider.env())
  const program = anchor.workspace.Zeeweg as Program<zeeweg.Zeeweg>
  const provider = anchor.getProvider()
  const alice = provider.publicKey as anchor.web3.PublicKey

  // Create a new keypair for Bob
  const bobKeypair = anchor.web3.Keypair.generate()
  const bob = bobKeypair.publicKey

  // Base position for the marker and tile
  const positionAlice: zeeweg.Position = { lat: 43160889, lon: -2934364 } // Bilbao
  const positionBob = { lat: positionAlice.lat + 1, lon: positionAlice.lon + 1 }
  const tileX = Math.floor(positionAlice.lat / zeeweg.MARKER_TILE_RESOLUTION)
  const tileY = Math.floor(positionAlice.lon / zeeweg.MARKER_TILE_RESOLUTION)

  // Calculate the PDAs 
  const tilePda = zeeweg.getMarkerTilePda(program, tileX, tileY)
  const aliceEntryPda = zeeweg.getMarkerEntryPda(program, positionAlice)
  const aliceAuthorPda = zeeweg.getMarkerAuthorPda(program, alice)
  const aliceVotesPda = zeeweg.getMarkerVotesPda(program, aliceEntryPda)
  const bobEntryPda = zeeweg.getMarkerEntryPda(program, positionBob)
  const bobAuthorPda = zeeweg.getMarkerAuthorPda(program, bob)
  const bobVotesPda = zeeweg.getMarkerVotesPda(program, bobEntryPda)

  const description: zeeweg.MarkerDescription = {
    name: 'Pinxo Restaurant',
    details: 'Traditional Basque tapas',
    markerType: { restaurant: {} },
  }

  it('Alice adds the initial marker', async () => {
    const sig = await program.methods
      .addMarker(description, positionAlice)
      .accounts({
        author: alice,
        markerEntry: aliceEntryPda,
        markerTile: tilePda,
        markerAuthor: aliceAuthorPda,
        markerVotes: aliceVotesPda,
      } as any)
      .rpc()
    helpers.confirmTransactionWithLatestBlockhash(provider.connection, sig)

    // Validate entry account
    const entryAccount = await program.account.markerEntry.fetch(aliceEntryPda)
    assert.strictEqual(entryAccount.author.toBase58(), alice.toBase58())
    assert.deepEqual(entryAccount.description, description)
    assert.deepEqual(entryAccount.position, positionAlice)

    // Validate tile account
    let tileAccount = await program.account.markerTile.fetch(tilePda)
    assert.strictEqual(tileAccount.tile.x, tileX)
    assert.strictEqual(tileAccount.tile.y, tileY)
    assert.ok(tileAccount.markers.some((m: anchor.web3.PublicKey) => m.equals(aliceEntryPda)))

    // Validate author account
    let authorAccount = await program.account.markerAuthor.fetch(aliceAuthorPda)
    assert.strictEqual(authorAccount.author.toBase58(), alice.toBase58())
    assert.deepEqual(authorAccount.markers, [aliceEntryPda])
  })

  it('Alice fails to add the same marker again', async () => {
    const attempt = program.methods
      .addMarker(description, positionAlice)
      .accounts({
        author: alice,
        markerEntry: aliceEntryPda,
        markerTile: tilePda,
        markerAuthor: aliceAuthorPda,
        markerVotes: aliceVotesPda,
      } as any)
      .rpc()

    await expect(attempt).rejects.toThrow(/already in use/i)
  })

  const updatedDescription: zeeweg.MarkerDescription = {
    name: 'Artxanda',
    details: 'Mountain Peak 251 m',
    markerType: { mountainPeak: {} },
  }

  it('Bob fails to update the marker created by Alice', async () => {
    const attempt = program.methods
      .updateMarker(updatedDescription, positionAlice)
      .accounts({
        author: bob,
        markerEntry: aliceEntryPda,
      })
      .signers([bobKeypair])
      .rpc()

    // Assert: should throw with has_one = author constraint violation
    await expect(attempt).rejects.toThrow(/has one constraint was violated/i)

    // Should NOT be updated
    const entryAccount = await program.account.markerEntry.fetch(aliceEntryPda)
    assert.strictEqual(entryAccount.author.toBase58(), alice.toBase58())
    assert.deepEqual(entryAccount.description, description)
    assert.deepEqual(entryAccount.position, positionAlice)
  })

  it('Alice updates the initial marker', async () => {
    const sig = await program.methods
      .updateMarker(updatedDescription, positionAlice)
      .accounts({
        author: alice,
        markerEntry: aliceEntryPda,
      })
      .rpc()
    helpers.confirmTransactionWithLatestBlockhash(provider.connection, sig)

    // Should be updated
    const entryAccount = await program.account.markerEntry.fetch(aliceEntryPda)
    assert.strictEqual(entryAccount.author.toBase58(), alice.toBase58())
    assert.deepEqual(entryAccount.description, updatedDescription)
    assert.deepEqual(entryAccount.position, positionAlice)
  })

  it('Bob adds a marker in the same tile after Alice', async () => {
    // Airdrop 1 SOL to Bob's account
    await helpers.airdrop(provider.connection, bob, 1000000000)

    // Create a new marker for Bob
    const description: zeeweg.MarkerDescription = {
      name: 'Bob marker',
      details: 'Bob was here too',
      markerType: { beach: {} },
    }

    // Add new marker from bob's account
    const sig = await program.methods
      .addMarker(description, positionBob)
      .accounts({
        author: bob,
        markerEntry: bobEntryPda,
        markerTile: tilePda,
        markerAuthor: bobAuthorPda,
      } as any)
      .signers([bobKeypair])
      .rpc()
    helpers.confirmTransactionWithLatestBlockhash(provider.connection, sig)

    // Validate entry account
    const entryAccount = await program.account.markerEntry.fetch(bobEntryPda)
    assert.strictEqual(entryAccount.author.toBase58(), bob.toBase58())
    assert.deepEqual(entryAccount.description, description)
    assert.deepEqual(entryAccount.position, positionBob)

    // Validate tile account
    const tileAccount = await program.account.markerTile.fetch(tilePda)
    assert.strictEqual(tileAccount.tile.x, tileX)
    assert.strictEqual(tileAccount.tile.y, tileY)
    assert.ok(tileAccount.markers.some((m: anchor.web3.PublicKey) => m.equals(bobEntryPda)))

    // Validate author account
    let authorAccount = await program.account.markerAuthor.fetch(bobAuthorPda)
    assert.strictEqual(authorAccount.author.toBase58(), bob.toBase58())
    assert.deepEqual(authorAccount.markers, [bobEntryPda])
  })

  it('Bob fails to delete a marker created by Alice', async () => {
    const attempt = program.methods
      .deleteMarker(positionAlice)
      .accounts({
        author: bob,
        markerEntry: aliceEntryPda,
        markerTile: tilePda,
      })
      .signers([bobKeypair])
      .rpc()

    // Assert: should throw with has_one = author constraint violation
    await expect(attempt).rejects.toThrow(/has one constraint was violated/i)

    // Confirm marker still exists
    const stillExists = await program.account.markerEntry.fetchNullable(aliceEntryPda)
    expect(stillExists).not.toBeNull()
  })

  it('Alice deletes her own marker', async () => {
    const sig = await program.methods
      .deleteMarker(positionAlice)
      .accounts({
        author: alice,
        markerEntry: aliceEntryPda,
        markerTile: tilePda,
      })
      .rpc()
    helpers.confirmTransactionWithLatestBlockhash(provider.connection, sig)

    const deletedAccount = await program.account.markerEntry.fetchNullable(aliceEntryPda)
    expect(deletedAccount).toBeNull()

    const tileAccount = await program.account.markerTile.fetch(tilePda)
    expect(tileAccount.markers).not.toContainEqual(aliceEntryPda)

    const authorAccount = await program.account.markerAuthor.fetch(aliceAuthorPda)
    expect(authorAccount.markers).not.toContainEqual(aliceEntryPda)
  })

  it('Bob deletes his own marker', async () => {
    const sig = await program.methods
      .deleteMarker(positionBob)
      .accounts({
        author: bob,
        markerEntry: bobEntryPda,
        markerTile: tilePda,
        markerAuthor: bobAuthorPda,
      })
      .signers([bobKeypair])
      .rpc()
    helpers.confirmTransactionWithLatestBlockhash(provider.connection, sig)

    const deletedAccount = await program.account.markerEntry.fetchNullable(bobEntryPda)
    expect(deletedAccount).toBeNull()

    const tileAccount = await program.account.markerTile.fetch(tilePda)
    expect(tileAccount.markers).not.toContainEqual(bobEntryPda)

    const authorAccount = await program.account.markerAuthor.fetch(bobAuthorPda)
    expect(authorAccount.markers).not.toContainEqual(bobEntryPda)
  })
})
