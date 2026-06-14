# Pharos Wallet Address Book

A Codex skill for managing reusable aliases for public Pharos wallet addresses.

The address book stores public EVM addresses only. It does not store private keys, seed phrases, signatures, passwords, or API secrets.

## Features

- Add or update a wallet alias.
- Resolve aliases case-insensitively.
- List, rename, and remove aliases.
- Normalize alias names to lowercase.
- Share one address book between Pharos skills.
- Write updates atomically to avoid partial JSON files.

## Install As A Codex Skill

Clone the repository into the global Codex skills directory:

```bash
git clone https://github.com/Meursault44/pharos-wallet-address-book.git ~/.codex/skills/pharos-wallet-address-book
```

Restart Codex after installation. The skill will then be available as:

```text
$pharos-wallet-address-book
```

## CLI Usage

Node.js 18 or newer is required.

Add or update an alias:

```bash
npm run wallet -- --add main:0x1111111111111111111111111111111111111111
```

List aliases:

```bash
npm run wallet -- --list
```

Resolve an alias:

```bash
npm run wallet -- --get main
```

Rename an alias:

```bash
npm run wallet -- --rename main:primary
```

Remove an alias:

```bash
npm run wallet -- --remove primary
```

Aliases are stored in `assets/wallets.json`.

## Use From Other Skills

Other Pharos skills may read `assets/wallets.json` to resolve aliases. Address-book mutations should go through this skill's CLI so validation, normalization, and atomic writes are preserved.

## Test

```bash
npm test
```

## License

MIT
