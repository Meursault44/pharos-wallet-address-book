import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const script = path.join(repoDir, "scripts", "address-book.mjs");

function run(book, args) {
  return spawnSync(process.execPath, [script, ...args, "--book", book], {
    cwd: repoDir,
    encoding: "utf8",
  });
}

test("add, resolve, rename, and remove aliases case-insensitively", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "pharos-wallet-book-"));
  const book = path.join(directory, "wallets.json");
  const address = "0x1111111111111111111111111111111111111111";

  assert.equal(run(book, ["--add", `Main:${address}`]).status, 0);
  assert.equal(run(book, ["--get", "MAIN"]).stdout.trim(), address);
  assert.equal(run(book, ["--rename", "main:primary"]).status, 0);
  assert.match(run(book, ["--list"]).stdout, /^primary: 0x1111/);
  assert.equal(run(book, ["--remove", "PRIMARY"]).status, 0);
  assert.match(run(book, ["--list"]).stdout, /No saved wallets/);
});

test("rejects private-key-shaped values as addresses", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "pharos-wallet-book-"));
  const book = path.join(directory, "wallets.json");
  const result = run(book, ["--add", `main:0x${"1".repeat(64)}`]);
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stderr).code, "INVALID_ADDRESS");
});
