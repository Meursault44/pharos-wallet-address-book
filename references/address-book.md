# Pharos Wallet Address Book Reference

## Add Or Update

```bash
npm run wallet -- --add <name:0xAddress>
```

Adds an alias or updates its public address. Names are normalized to lowercase.

## List

```bash
npm run wallet -- --list
```

Prints one `name: address` pair per line in alphabetical order.

## Resolve

```bash
npm run wallet -- --get <name>
```

Prints the matching public address. Lookup is case-insensitive.

## Rename

```bash
npm run wallet -- --rename <old:new>
```

Renames an existing alias. The destination must not already exist.

## Remove

```bash
npm run wallet -- --remove <name>
```

Removes the alias only. It never changes anything onchain.

## Parameters

| Parameter | Description |
|---|---|
| `--add <name:address>` | Add or update a public wallet alias. |
| `--list` | List all aliases. |
| `--get <name>` | Resolve an alias to an address. |
| `--rename <old:new>` | Rename an alias. |
| `--remove <name>` | Delete an alias. |
| `--book <path>` | Override the address-book JSON path, primarily for tests or migration. |

## Error Handling

Errors are JSON on stderr with exit code `1`.

| Code | Meaning |
|---|---|
| `MISSING_OPERATION` | No supported operation was supplied. |
| `MULTIPLE_OPERATIONS` | More than one operation was supplied. |
| `INVALID_NAME` | Alias format is invalid. |
| `INVALID_ADDRESS` | Public address format is invalid. |
| `INVALID_MAPPING` | Expected `name:0xAddress` or `old:new`. |
| `UNKNOWN_NAME` | Alias does not exist. |
| `NAME_EXISTS` | Rename destination already exists. |
| `INVALID_BOOK` | Address-book JSON is malformed. |
| `INTERNAL_ERROR` | Unexpected local filesystem failure. |

## Agent Guidelines

1. Store public addresses only.
2. Never infer or request a private key for address-book operations.
3. Normalize aliases to lowercase before comparing or writing.
4. Use `--add` to intentionally update an existing alias.
5. Use `--rename` only when the destination name is free.
6. Do not claim that adding an alias imports a wallet or grants signing access.
