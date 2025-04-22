PUB_KEY := shell('solana-keygen pubkey')

# list all recipies
list:
    @just vars
    @just --list --unsorted

# evaluate all variables
vars:
    @just --evaluate

# pnpm: install dependencies, sync keys, anchor-build
[group('build')]
install-and-build:
    pnpm install
    pnpm anchor keys sync
    pnpm anchor-build

# pnpm: deploy on provided cluster
[group('build')]
deploy cluster="devnet":
    pnpm anchor deploy --provider.cluster devnet

# generate new private key
[group('solana-keygen')]
key-new:
    solana-keygen new

# generate public key
[group('solana-keygen')]
key-pub:
    solana-keygen pubkey

# verify public key
[group('solana-keygen')]
key-ver:
    solana-keygen verify {{PUB_KEY}}


@_balance net account=PUB_KEY:
    echo `solana balance {{account}} --url {{net}}` ' on ' {{net}}
[group('balance')]
balance-loc account=PUB_KEY: (_balance "http://localhost:8899" account)
[group('balance')]
balance-dev account=PUB_KEY: (_balance "https://api.devnet.solana.com" account)
[group('balance')]
balance-tst account=PUB_KEY: (_balance "https://api.testnet.solana.com" account)
# check balances on loc, dev, tst
[group('balance')]
@balance: (balance-loc) (balance-dev) (balance-tst)

_airdrop net account=PUB_KEY:
    solana airdrop 1 {{account}} --url {{net}}
[group('airdrop')]
airdrop-loc account=PUB_KEY: (_airdrop "http://localhost:8899" account)
[group('airdrop')]
airdrop-dev account=PUB_KEY: (_airdrop "https://api.devnet.solana.com" account)
[group('airdrop')]
airdrop-tst account=PUB_KEY: (_airdrop "https://api.testnet.solana.com" account)
