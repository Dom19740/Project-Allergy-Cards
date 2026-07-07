import { describe, it, expect, vi } from "vitest";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { speakText } from "../tts";

const speak = vi.mocked(TextToSpeech.speak);

describe("speakText", () => {
  it("speaks the given text with the given language unmodified", async () => {
    await speakText("I am allergic to peanuts", "fr");
    expect(speak).toHaveBeenCalledTimes(1);
    expect(speak).toHaveBeenCalledWith(
      expect.objectContaining({ text: "I am allergic to peanuts", lang: "fr" })
    );
  });

  it("remaps legacy Google Translate codes to the BCP-47 tag TTS engines expect", async () => {
    await speakText("hello", "iw"); // Hebrew
    expect(speak).toHaveBeenCalledWith(expect.objectContaining({ lang: "he" }));

    speak.mockClear();
    await speakText("hello", "jw"); // Javanese
    expect(speak).toHaveBeenCalledWith(expect.objectContaining({ lang: "jv" }));
  });

  it("retries with the base language when the exact region tag has no installed voice", async () => {
    speak.mockRejectedValueOnce(new Error("voice not found")).mockResolvedValueOnce(undefined as any);

    await speakText("hola", "es-419");

    expect(speak).toHaveBeenCalledTimes(2);
    expect(speak).toHaveBeenNthCalledWith(1, expect.objectContaining({ lang: "es-419" }));
    expect(speak).toHaveBeenNthCalledWith(2, expect.objectContaining({ lang: "es" }));
  });

  it("does not retry and rethrows when the language has no region to strip (already a base tag)", async () => {
    const error = new Error("no voice for this language at all");
    speak.mockRejectedValueOnce(error);

    await expect(speakText("hello", "eo")).rejects.toThrow(error);
    expect(speak).toHaveBeenCalledTimes(1);
  });

  it("propagates the error when both the exact tag and the base-language retry fail", async () => {
    speak.mockRejectedValueOnce(new Error("first failure"));
    speak.mockRejectedValueOnce(new Error("second failure"));

    await expect(speakText("hola", "es-419")).rejects.toThrow("second failure");
    expect(speak).toHaveBeenCalledTimes(2);
  });
});
