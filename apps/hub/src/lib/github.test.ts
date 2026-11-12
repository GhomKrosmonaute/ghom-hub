import { expect, test } from "bun:test";
import { parseContributions } from "./github";

test("parseContributions lit les jours, les niveaux et le total", () => {
  const html = `
    <h2>559
      contributions
        in the last year</h2>
    <td data-date="2025-11-10" id="contribution-day-component-1-0" data-level="2" class="d"></td>
    <td data-date="2025-11-09" id="contribution-day-component-0-0" data-level="0" class="d"></td>
    <tool-tip for="contribution-day-component-0-0" class="sr-only">No contributions on November 9th.</tool-tip>
    <tool-tip for="contribution-day-component-1-0" class="sr-only">3 contributions on November 10th.</tool-tip>`;
  const { total, days } = parseContributions(html);
  expect(total).toBe(559);
  expect(days).toEqual([
    { date: "2025-11-09", level: 0, count: 0 },
    { date: "2025-11-10", level: 2, count: 3 },
  ]);
});
