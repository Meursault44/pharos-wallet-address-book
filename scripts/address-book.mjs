#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_BOOK = path.join(__dirname, "..", "assets", "wallets.json");
const NAME_PATTERN = /^[A-Za-z0-9_.-]{1,40}$/;

function parseArgs(argv) {
  const args = {};
  for (let index = 2; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--")) continue;
    args[key.slice(2)] = argv[index + 1] && !argv[index + 1].startsWith("--") ? argv[++index] : true;
  }
  return args;
}

function normalizeName(value) {
  if (typeof value !== "string" || !NAME_PATTERN.test(value) || value.toLowerCase().startsWith("0x")) {
    throw new Error(`Invalid wallet name: ${String(value)}`);
  }
  return value.toLowerCase();
}

function validateAddress(value) {
  if (typeof value !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(value)) {
    throw new Error(`Invalid wallet address: ${String(value)}`);
  }
  return value;
}

function parseMapping(value) {
  if (typeof value !== "string") throw new Error("Invalid wallet mapping: expected name:0xAddress");
  const separator = value.indexOf(":");
  if (separator < 1) throw new Error(`Invalid wallet mapping: ${value}`);
  return {
    name: normalizeName(value.slice(0, separator).trim()),
    address: validateAddress(value.slice(separator + 1).trim()),
  };
}

function parseRename(value) {
  if (typeof value !== "string") throw new Error("Invalid rename mapping: expected old:new");
  const parts = value.split(":");
  if (parts.length !== 2) throw new Error(`Invalid rename mapping: ${value}`);
  return { oldName: normalizeName(parts[0].trim()), newName: normalizeName(parts[1].trim()) };
}

function loadBook(bookPath) {
  if (!fs.existsSync(bookPath)) return {};
  const parsed = JSON.parse(fs.readFileSync(bookPath, "utf8"));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(`Invalid address book: ${bookPath}`);
  const book = {};
  for (const [rawName, rawAddress] of Object.entries(parsed)) {
    const name = normalizeName(rawName);
    const address = validateAddress(rawAddress);
    if (book[name] && book[name].toLowerCase() !== address.toLowerCase()) {
      throw new Error(`Invalid address book: conflicting alias ${name}`);
    }
    book[name] = address;
  }
  return book;
}

function saveBook(bookPath, book) {
  fs.mkdirSync(path.dirname(bookPath), { recursive: true });
  const sorted = Object.fromEntries(Object.entries(book).sort(([left], [right]) => left.localeCompare(right)));
  const temporary = `${bookPath}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");
  fs.renameSync(temporary, bookPath);
}

function help() {
  console.log(`Pharos wallet address book

Usage:
  npm run wallet -- --add main:0x...
  npm run wallet -- --list
  npm run wallet -- --get main
  npm run wallet -- --rename main:primary
  npm run wallet -- --remove primary

Names are case-insensitive and stored in lowercase. Public addresses only.`);
}

function errorCode(message) {
  if (message.includes("Choose exactly one")) return "MULTIPLE_OPERATIONS";
  if (message.includes("Missing operation")) return "MISSING_OPERATION";
  if (message.includes("Invalid wallet name")) return "INVALID_NAME";
  if (message.includes("Invalid wallet address")) return "INVALID_ADDRESS";
  if (message.includes("mapping")) return "INVALID_MAPPING";
  if (message.includes("Unknown wallet name")) return "UNKNOWN_NAME";
  if (message.includes("already exists")) return "NAME_EXISTS";
  if (message.includes("Invalid address book") || message.includes("JSON")) return "INVALID_BOOK";
  return "INTERNAL_ERROR";
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help || args.h) return help();
  const operations = ["add", "list", "get", "rename", "remove"].filter((name) => args[name] !== undefined);
  if (operations.length === 0) throw new Error("Missing operation. Use --help.");
  if (operations.length > 1) throw new Error("Choose exactly one address-book operation.");

  const bookPath = typeof args.book === "string" ? path.resolve(args.book) : DEFAULT_BOOK;
  const book = loadBook(bookPath);
  const operation = operations[0];

  if (operation === "add") {
    const { name, address } = parseMapping(args.add);
    const updated = Boolean(book[name]);
    book[name] = address;
    saveBook(bookPath, book);
    console.log(`${updated ? "Updated" : "Saved"} wallet ${name}: ${address}`);
    return;
  }
  if (operation === "list") {
    const entries = Object.entries(book);
    if (entries.length === 0) return console.log("No saved wallets.");
    for (const [name, address] of entries) console.log(`${name}: ${address}`);
    return;
  }
  if (operation === "get") {
    const name = normalizeName(args.get);
    if (!book[name]) throw new Error(`Unknown wallet name: ${name}`);
    console.log(book[name]);
    return;
  }
  if (operation === "rename") {
    const { oldName, newName } = parseRename(args.rename);
    if (!book[oldName]) throw new Error(`Unknown wallet name: ${oldName}`);
    if (book[newName]) throw new Error(`Wallet name already exists: ${newName}`);
    book[newName] = book[oldName];
    delete book[oldName];
    saveBook(bookPath, book);
    console.log(`Renamed wallet ${oldName} to ${newName}: ${book[newName]}`);
    return;
  }
  const name = normalizeName(args.remove);
  if (!book[name]) throw new Error(`Unknown wallet name: ${name}`);
  const address = book[name];
  delete book[name];
  saveBook(bookPath, book);
  console.log(`Removed wallet ${name}: ${address}`);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(JSON.stringify({ code: errorCode(message), error: message }, null, 2));
  process.exit(1);
}
