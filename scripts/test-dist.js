#!/usr/bin/env node

"use strict";

const path = require("path");
const shell = require("shelljs");
const tempy = require("tempy");
const { isCI } = require("ci-info");

shell.config.fatal = true;

const rootDir = path.join(__dirname, "..");
const distDir = path.join(rootDir, "dist");

const file = shell.exec("npm pack", { cwd: distDir }).stdout.trim();
const tarPath = path.join(distDir, file);
const tmpDir = tempy.directory();

shell.config.silent = true;
shell.exec("npm init -y", { cwd: tmpDir });
shell.exec(`npm install "${tarPath}"`, { cwd: tmpDir });
shell.config.silent = false;

const runInBand = isCI ? "--runInBand" : "";
const testPath = process.env.TEST_STANDALONE ? "tests/" : "";
const cmd = `yarn test --color ${runInBand} ${testPath}`;

const { code } = shell.exec(cmd, {
  cwd: rootDir,
  env: {
    ...process.env,
    NODE_ENV: "production",
    AST_COMPARE: "1",
    PRETTIER_DIR: path.join(tmpDir, "node_modules/prettier"),
  },
  shell: true,
});

process.exit(code);
