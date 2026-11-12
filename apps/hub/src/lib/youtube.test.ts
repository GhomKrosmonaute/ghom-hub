import { describe, expect, test } from "bun:test";
import { parseAbout, parseCount, parseFeed } from "./youtube";

describe("youtube", () => {
  test("parseCount", () => {
    expect(parseCount("150 subscribers")).toBe(150);
    expect(parseCount("30,293 views")).toBe(30293);
    expect(parseCount("38.6K subscribers")).toBe(38600);
    expect(parseCount("1.2M views")).toBe(1200000);
    expect(parseCount(undefined)).toBeNull();
  });

  test("parseAbout ignore les autres chaînes de la page", () => {
    const html = `"subscriberCountText":"416K subscribers" … "aboutChannelViewModel":{"description":"x","subscriberCountText":"150 subscribers","viewCountText":"30,293 views","joinedDateText":{"content":"Joined Jan 29, 2025"},"videoCountText":"190 videos"}`;
    expect(parseAbout(html)).toEqual({
      subscribers: 150,
      views: 30293,
      videos: 190,
      joined: "2025-01-29",
    });
    expect(parseAbout("<html></html>")).toBeNull();
  });

  test("parseFeed", () => {
    const xml = `<feed><entry><yt:videoId>abc</yt:videoId><published>2026-11-09T10:00:00+00:00</published><media:group><media:title>Tombes &amp; 110 Hz</media:title><media:community><media:statistics views="77"/></media:community></media:group></entry></feed>`;
    expect(parseFeed(xml)).toEqual([
      { id: "abc", title: "Tombes & 110 Hz", published: "2026-11-09T10:00:00+00:00", views: 77 },
    ]);
  });
});
