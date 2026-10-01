import type { CurriculumDay } from "../types/curriculum";
import type { NoteName } from "../types/music";

const rawDays = import.meta.glob("/content/stage-1/day-*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const rawOverview = import.meta.glob("/content/stage-1-overview.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

interface Frontmatter {
  day: number;
  week: number;
  title: string;
  goal: string;
  minutes: number;
  newNotes: NoteName[];
  exerciseIds: string[];
  songTask: boolean;
  assessment: boolean;
}

function parseValue(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^-?\d+$/.test(trimmed)) return Number(trimmed);
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(",").map((item) => parseValue(item));
  }
  return trimmed.replace(/^['"]|['"]$/g, "");
}

export function parseMarkdown(markdown: string): { frontmatter: Frontmatter; body: string } {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error("Curriculum Markdown is missing frontmatter");

  const frontmatter: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const separator = line.indexOf(":");
    if (separator === -1) throw new Error(`Invalid frontmatter line: ${line}`);
    const key = line.slice(0, separator).trim();
    frontmatter[key] = parseValue(line.slice(separator + 1));
  }

  const required = ["day", "week", "title", "goal", "minutes", "newNotes", "exerciseIds"];
  for (const key of required) {
    if (frontmatter[key] === undefined) throw new Error(`Frontmatter is missing ${key}`);
  }

  return {
    frontmatter: {
      day: frontmatter.day as number,
      week: frontmatter.week as number,
      title: frontmatter.title as string,
      goal: frontmatter.goal as string,
      minutes: frontmatter.minutes as number,
      newNotes: frontmatter.newNotes as NoteName[],
      exerciseIds: frontmatter.exerciseIds as string[],
      songTask: Boolean(frontmatter.songTask),
      assessment: Boolean(frontmatter.assessment),
    },
    body: match[2],
  };
}

export const curriculumDays: readonly CurriculumDay[] = Object.entries(rawDays)
  .map(([path, markdown]) => {
    const parsed = parseMarkdown(markdown);
    return { ...parsed.frontmatter, body: parsed.body, path };
  })
  .sort((first, second) => first.day - second.day);

export function getCurriculumDay(day: number): CurriculumDay | undefined {
  return curriculumDays.find((candidate) => candidate.day === day);
}

export const stageOverviewMarkdown = Object.values(rawOverview)[0] ?? "";
