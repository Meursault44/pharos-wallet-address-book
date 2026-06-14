---
name: pharos-wallet-address-book
description: Manage reusable aliases for public Pharos wallet addresses. Use when a user asks to save, add, list, resolve, rename, update, or remove a named wallet such as main, trading, treasury, or bot, or when another Pharos skill needs to resolve a saved wallet name to a public EVM address.
---

# Pharos Wallet Address Book

Manage a shared local address book containing public EVM addresses only. Never request or store private keys, seed phrases, signatures, passwords, or API secrets.

## Capability Index

| User intent | Capability | Instructions |
|---|---|---|
| add wallet, save address | Add or update an alias | [Add Or Update](references/address-book.md#add-or-update) |
| list wallets, show saved names | List aliases | [List](references/address-book.md#list) |
| resolve wallet, get address | Resolve an alias | [Resolve](references/address-book.md#resolve) |
| rename wallet | Rename an alias | [Rename](references/address-book.md#rename) |
| remove wallet, delete wallet | Remove an alias | [Remove](references/address-book.md#remove) |

## Rules

1. Treat names case-insensitively and store them in lowercase.
2. Accept names containing 1-40 letters, numbers, dots, underscores, or dashes; names cannot begin with `0x`.
3. Validate every address as `0x` followed by 40 hexadecimal characters.
4. Confirm the resulting alias and public address after mutations.
5. Use `assets/wallets.json` as the canonical shared file.
6. Other skills may read this file but must not modify it directly.

For exact commands, output, and errors, read [references/address-book.md](references/address-book.md).
