import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Capacitor } from "@capacitor/core";
import { translateText, TranslationError } from "../translator";

const jsonResponse = (body: unknown, ok = true, status = 200) => ({
  ok,
  status,
  text: async () => JSON.stringify(body),
  json: async () => body,
});

describe("translateText", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it("passes text through unchanged for English or empty target language", async () => {
    expect(await translateText("Milk", "en")).toBe("Milk");
    expect(await translateText("Milk", "")).toBe("Milk");
    expect(await translateText("", "fr")).toBe("");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("resolves known allergens from the local dictionary without any network call", async () => {
    expect(await translateText("milk", "af")).toBe("melk");
    expect(await translateText("Milk", "af")).toBe("Melk"); // capitalization preserved
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("resolves fixed UI strings from the local dictionary without any network call", async () => {
    expect(await translateText("attention", "af")).toBe("aandag");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to the free Google endpoint for text not in either local dictionary", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse([[["texte traduit", "some text", null, null, 1]], null, "en"])
    );

    const result = await translateText("some text", "fr");

    expect(result).toBe("texte traduit");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain("translate.googleapis.com");
  });

  it("applies regional-override substitutions to free-endpoint results", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([[["maní", "peanut butter cups", null, null, 1]], null, "en"]));

    const result = await translateText("peanut butter cups", "es-ES");

    expect(result).toBe("cacahuete");
  });

  it("on web, retries via the /api/translate proxy when the free endpoint fails, and succeeds", async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, false, 503)) // free endpoint down
      .mockResolvedValueOnce(jsonResponse({ translatedText: "texte du proxy" })); // proxy succeeds

    const result = await translateText("some unmapped text", "fr");

    expect(result).toBe("texte du proxy");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe("/api/translate");
  });

  it("on web, throws TranslationError when both the free endpoint and the proxy fail", async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false);
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, false, 503))
      .mockResolvedValueOnce(jsonResponse({}, false, 500));

    await expect(translateText("some unmapped text", "fr")).rejects.toThrow(TranslationError);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("on native platforms, skips the proxy entirely and throws immediately after the free endpoint fails", async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    fetchMock.mockResolvedValueOnce(jsonResponse({}, false, 503));

    await expect(translateText("some unmapped text", "fr")).rejects.toThrow(TranslationError);
    expect(fetchMock).toHaveBeenCalledTimes(1); // no /api/translate call - native has no such backend
  });

  it("throws TranslationError when the free endpoint returns HTTP 200 with malformed data", async () => {
    vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true);
    fetchMock.mockResolvedValueOnce(jsonResponse({ unexpected: "shape" }));

    await expect(translateText("some unmapped text", "fr")).rejects.toThrow(TranslationError);
  });
});
