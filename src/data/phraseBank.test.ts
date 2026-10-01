import { phraseBank, phrasesFor } from "./phraseBank";

describe("phrase bank", () => {
  it("contains the planned 300 unique phrases", () => {
    expect(phraseBank).toHaveLength(300);
    expect(new Set(phraseBank.map((entry) => `${entry.length}:${entry.notes.join("")}:${entry.rhythm.join(",")}`)).size).toBe(300);
  });

  it("matches the length distribution and 80/20 partition", () => {
    expect(phraseBank.filter((entry) => entry.length === 2)).toHaveLength(30);
    expect(phraseBank.filter((entry) => entry.length === 3)).toHaveLength(50);
    expect(phraseBank.filter((entry) => entry.length === 4)).toHaveLength(80);
    expect(phraseBank.filter((entry) => entry.length === 5)).toHaveLength(80);
    expect(phraseBank.filter((entry) => entry.length === 6)).toHaveLength(60);
    expect(phraseBank.filter((entry) => entry.partition === "daily")).toHaveLength(240);
    expect(phraseBank.filter((entry) => entry.partition === "reserved")).toHaveLength(60);
  });

  it("can provide daily phrases inside the first-week three-note pool", () => {
    expect(phrasesFor(3, ["C", "E", "G"], "daily").length).toBeGreaterThanOrEqual(10);
  });
});
