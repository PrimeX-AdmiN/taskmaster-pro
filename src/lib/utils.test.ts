import { describe, it, expect } from "vitest";
import { cn, slugify } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("handles conditional classes", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
  });
});

describe("slugify", () => {
  it("converts to lowercase", () => {
    expect(slugify("Hello")).toBe("hello");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("hello world")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("hello! world?")).toBe("hello-world");
  });
});
