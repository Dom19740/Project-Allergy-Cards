import { describe, it, expect } from "vitest";
import { CustomAlertPreset } from "../types";
import { getCustomAlertPresets, saveCustomAlertPreset, deleteCustomAlertPreset } from "../customAlertPresets";

const makePreset = (overrides: Partial<CustomAlertPreset> = {}): CustomAlertPreset => ({
  id: "preset-1",
  name: "Me",
  iAmAllergicTo: "I am allergic to",
  theyMakeMeSick: "they make me sick",
  ...overrides,
});

describe("custom alert presets (device-wide list, independent of any single card)", () => {
  it("starts empty", async () => {
    expect(await getCustomAlertPresets()).toEqual([]);
  });

  it("saveCustomAlertPreset appends a brand new preset", async () => {
    const preset = makePreset();
    const updated = await saveCustomAlertPreset(preset);

    expect(updated).toEqual([preset]);
    expect(await getCustomAlertPresets()).toEqual([preset]);
  });

  it("saveCustomAlertPreset appends multiple distinct presets in order", async () => {
    const first = makePreset({ id: "1", name: "Me" });
    const second = makePreset({ id: "2", name: "My Kid" });

    await saveCustomAlertPreset(first);
    await saveCustomAlertPreset(second);

    expect(await getCustomAlertPresets()).toEqual([first, second]);
  });

  it("saveCustomAlertPreset with an existing id updates that preset in place instead of duplicating it", async () => {
    const original = makePreset({ id: "1", name: "Me", iAmAllergicTo: "old text" });
    await saveCustomAlertPreset(original);

    const updated = makePreset({ id: "1", name: "Me", iAmAllergicTo: "new text" });
    const result = await saveCustomAlertPreset(updated);

    expect(result).toEqual([updated]);
    expect(await getCustomAlertPresets()).toEqual([updated]);
  });

  it("deleteCustomAlertPreset removes only the matching id", async () => {
    const first = makePreset({ id: "1", name: "Me" });
    const second = makePreset({ id: "2", name: "My Kid" });
    await saveCustomAlertPreset(first);
    await saveCustomAlertPreset(second);

    const result = await deleteCustomAlertPreset("1");

    expect(result).toEqual([second]);
    expect(await getCustomAlertPresets()).toEqual([second]);
  });

  it("deleteCustomAlertPreset is a no-op for an id that doesn't exist", async () => {
    const preset = makePreset();
    await saveCustomAlertPreset(preset);

    const result = await deleteCustomAlertPreset("does-not-exist");

    expect(result).toEqual([preset]);
  });
});
