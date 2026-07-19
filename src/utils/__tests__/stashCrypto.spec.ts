import { describe, it, expect } from "vitest";
import { encryptStashBody, decryptStashBody, generateStashKey } from "../stashCrypto";

describe("encryptStashBody / decryptStashBody", () => {
  it("decrypts a body encrypted with the same key", async() => {
    const encrypted = await encryptStashBody("hello world", "correct-horse-battery-staple");
    const decrypted = await decryptStashBody(encrypted, "correct-horse-battery-staple");

    expect(decrypted).toBe("hello world");
  });

  it("produces a self-describing v1 blob with four dot-separated parts", async() => {
    const encrypted = await encryptStashBody("hello world", "some-key");

    const parts = encrypted.split(".");
    expect(parts).toHaveLength(4);
    expect(parts[0]).toBe("v1");
  });

  it("produces different ciphertext for the same input on each call (random salt/iv)", async() => {
    const first = await encryptStashBody("hello world", "some-key");
    const second = await encryptStashBody("hello world", "some-key");

    expect(first).not.toBe(second);
  });

  it("returns null when decrypting with the wrong key", async() => {
    const encrypted = await encryptStashBody("hello world", "correct-key");
    const decrypted = await decryptStashBody(encrypted, "wrong-key");

    expect(decrypted).toBeNull();
  });

  it("returns null for a malformed blob", async() => {
    const decrypted = await decryptStashBody("not-a-valid-blob", "any-key");

    expect(decrypted).toBeNull();
  });

  it("returns null for an unsupported format version", async() => {
    const encrypted = await encryptStashBody("hello world", "some-key");
    const tampered = encrypted.replace(/^v1\./, "v2.");

    const decrypted = await decryptStashBody(tampered, "some-key");

    expect(decrypted).toBeNull();
  });
});

describe("generateStashKey", () => {
  it("generates a key of the requested length", () => {
    expect(generateStashKey(24)).toHaveLength(24);
    expect(generateStashKey(12)).toHaveLength(12);
  });

  it("generates different keys on each call", () => {
    expect(generateStashKey()).not.toBe(generateStashKey());
  });
});
