# Zeeweg

[![CI](https://github.com/MishkaRogachev/Zeeweg/actions/workflows/test-anchor.yml/badge.svg)](https://github.com/MishkaRogachev/Zeeweg/actions)
[![CI](https://github.com/MishkaRogachev/Zeeweg/actions/workflows/test-web.yml/badge.svg)](https://github.com/MishkaRogachev/Zeeweg/actions)

Built as part of the [Encode x Solana Rust Bootcamp Q1 2025](https://www.encode.club/solana-rust-bootcamp) 

## Summary

Zeeweg is Solana dApp there users can add, edit, and vote on geolocated markers — such as parks, historical sites, hazards and etc. — with all metadata stored **fully on-chain** using the Anchor framework.
Think open-source Google Maps where contributions are verifiable, decentralized, and censorship-resistant.

<img width="1287" alt="Screenshot 2025-04-23 at 17 47 42" src="https://github.com/user-attachments/assets/cfa3e150-f044-4a57-930d-c7d8d1ad95ac" />


## Getting Started

### Prerequisites

- Node v18.18.0 or higher

- Rust v1.77.2 or higher
- Anchor CLI 0.30.1 or higher
- Solana CLI 1.18.17 or higher

### Installation

#### Clone the repo

```shell
git clone https://github.com/MishkaRogachev/Zeeweg
cd Zeeweg
```

#### Install Dependencies

```shell
pnpm install
```

#### Start the web app

```
pnpm dev
```

## Apps

### anchor

This is a Solana program written in Rust using the Anchor framework.

#### Commands

You can use any normal anchor commands. Either move to the `anchor` directory and run the `anchor` command or prefix the
command with `pnpm`, eg: `pnpm anchor`.

#### Sync the program id:

Running this command will create a new keypair in the `anchor/target/deploy` directory and save the address to the
Anchor config file and update the `declare_id!` macro in the `./src/lib.rs` file of the program.

You will manually need to update the constant in `anchor/lib/basic-exports.ts` to match the new program id.

```shell
pnpm anchor keys sync
```

#### Build the program:

```shell
pnpm anchor-build
```

#### Start the test validator with the program deployed:

```shell
pnpm anchor-localnet
```

#### Run the tests

```shell
pnpm anchor-test
```

#### Deploy to Devnet

```shell
pnpm anchor deploy --provider.cluster devnet
```

### web

This is a React app that uses the Anchor generated client to interact with the Solana program.

#### Commands

Start the web app

```shell
pnpm dev
```

Build the web app

```shell
pnpm build
```
