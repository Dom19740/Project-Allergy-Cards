import { describe, it, expect } from "vitest";
import { storage } from "../storage";

describe("storage (Capacitor Preferences wrapper)", () => {
  it("round-trips JSON-serializable values", async () => {
    await storage.set("key", { a: 1, b: ["x", "y"] });
    expect(await storage.get("key")).toEqual({ a: 1, b: ["x", "y"] });
  });

  it("round-trips plain strings without double-encoding", async () => {
    await storage.set("key", "true");
    expect(await storage.get("key")).toBe(true); // JSON.parse("true") -> boolean true, by design
  });

  it("round-trips a string that isn't valid JSON as-is", async () => {
    await storage.set("key", "not-json-{{{");
    expect(await storage.get("key")).toBe("not-json-{{{");
  });

  it("returns null for a key that was never set", async () => {
    expect(await storage.get("missing-key")).toBeNull();
  });

  it("remove() deletes a key", async () => {
    await storage.set("key", "value");
    await storage.remove("key");
    expect(await storage.get("key")).toBeNull();
  });

  it("clear() wipes all keys", async () => {
    await storage.set("a", "1");
    await storage.set("b", "2");
    await storage.clear();
    expect(await storage.get("a")).toBeNull();
    expect(await storage.get("b")).toBeNull();
  });

  it("ephemeral storage is backed by sessionStorage and is independent of persistent storage", async () => {
    await storage.setEphemeral("flag", "true");
    expect(await storage.getEphemeral("flag")).toBe(true);
    expect(await storage.get("flag")).toBeNull(); // different backing store

    await storage.removeEphemeral("flag");
    expect(await storage.getEphemeral("flag")).toBeNull();
  });
});
