import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const contentDir = join(process.cwd(), "content", "stage-1");
const files = readdirSync(contentDir).filter((file) => /^day-\d{2}\.md$/.test(file)).sort();
const errors = [];

if (files.length !== 28) errors.push(`expected 28 day files, found ${files.length}`);

const days = new Set();
for (const file of files) {
  const source = readFileSync(join(contentDir, file), "utf8");
  const match = source.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    errors.push(`${file}: missing frontmatter`);
    continue;
  }
  const values = Object.fromEntries(match[1].split("\n").filter(Boolean).map((line) => {
    const index = line.indexOf(":");
    return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
  }));
  const day = Number(values.day);
  if (!Number.isInteger(day) || day < 1 || day > 28) errors.push(`${file}: invalid day ${values.day}`);
  if (days.has(day)) errors.push(`${file}: duplicate day ${day}`);
  days.add(day);
  if (Number(values.minutes) !== 60) errors.push(`${file}: minutes must be 60, found ${values.minutes}`);
  const exerciseIds = values.exerciseIds?.replace(/^\[|\]$/g, "").split(",").map((item) => item.trim()).filter(Boolean) ?? [];
  for (const id of exerciseIds) {
    if (!new RegExp(`^day-${day}-(fretboard|ear|phrase|chord)$`).test(id)) errors.push(`${file}: invalid exercise id ${id}`);
  }
  if (exerciseIds.length !== 4) errors.push(`${file}: expected 4 exercise ids, found ${exerciseIds.length}`);
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated 28 day files, 60 minutes each, with 112 linked exercises.`);
