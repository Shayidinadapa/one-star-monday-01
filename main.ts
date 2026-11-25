// One Star for Monday — make.fun bounty u-clever-harbor-75-one-star-for-monday-9ead4a61
//
// Writes a single one-star review of Monday, written as if Monday were a
// restaurant, to <output-dir>/entry.txt. The line is fixed and deterministic:
// every run writes byte-identical output.
//
// The line was picked from three fresh candidates drafted for this bounty:
//   1. "One star. Waited an hour for Monday, the server forgot my weekend,
//      and the bill was five more workdays."                        <- CHOSEN
//   2. "One star. Monday seated me by the toilets, served cold coffee,
//      then charged me a whole week."
//   3. "One star. Booked a quiet Monday lunch; got a loud alarm, burnt
//      toast, and a meeting for dessert."
// Candidate 1 won: it reads like a genuine diner's complaint (a server, a
// wait, a bill), the joke only works for Monday (the weekend is gone and
// five more workdays are the bill), and at 19 words it is short enough to
// retype into a group chat without trimming a word.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const MAX_WORDS = 25;
const MAX_CHARS = 180;

const REVIEW =
  "One star. Waited an hour for Monday, the server forgot my weekend, and the bill was five more workdays.";

function outputDir(): string {
  const dir = process.env.MAKEFUN_OUTPUT_DIR ?? process.env.OUTPUT_DIR ?? "/output";
  if (dir === ".") {
    throw new Error('refusing to write into "." — set MAKEFUN_OUTPUT_DIR to a real output directory');
  }
  return dir;
}

function validate(line: string): void {
  if (line.trim().length === 0) {
    throw new Error("review must not be blank");
  }
  if (line !== line.trim()) {
    throw new Error("review must not have leading or trailing whitespace");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("review must be a single line");
  }
  // Reject control characters (tabs, bells, escapes, ...).
  for (const ch of line) {
    if (ch.charCodeAt(0) < 0x20 || ch.charCodeAt(0) === 0x7f) {
      throw new Error(`review contains a control character (U+${ch.charCodeAt(0).toString(16).padStart(4, "0")})`);
    }
  }
  const words = line.split(/\s+/).filter(Boolean);
  if (words.length > MAX_WORDS) {
    throw new Error(`review has ${words.length} words, over the ${MAX_WORDS}-word limit`);
  }
  if (line.length > MAX_CHARS) {
    throw new Error(`review is ${line.length} characters, over the ${MAX_CHARS}-character gate`);
  }
}

function main(): void {
  validate(REVIEW);
  const dir = outputDir();
  mkdirSync(resolve(dir), { recursive: true });
  const target = join(resolve(dir), "entry.txt");
  writeFileSync(target, REVIEW, "utf8");
  // Read back what landed on disk and confirm it is exactly the validated
  // line, so a partial write or encoding surprise cannot slip through.
  const written = readFileSync(target, "utf8");
  if (written !== REVIEW) {
    throw new Error("entry.txt on disk does not match the validated review");
  }
  console.log(`wrote entry.txt (${REVIEW.split(/\s+/).length} words, ${REVIEW.length} chars)`);
}

main();
