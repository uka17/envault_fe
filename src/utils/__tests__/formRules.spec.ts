import { describe, it, expect } from "vitest";
import type { FormItemRule } from "naive-ui";
import {
  NAME_REGEXP,
  PASSWORD_REGEXP,
  emailRules,
  nameRules,
  requiredPasswordRules,
  newPasswordRules,
  confirmPasswordRules,
} from "../formRules";

/** Runs a validator-style rule and normalizes the result to a boolean. */
function runValidator(rule: FormItemRule, value: string): boolean {
  const result = (rule.validator as (rule: FormItemRule, value: string) => true | Error)(rule, value);
  return result === true;
}

describe("NAME_REGEXP", () => {
  it("accepts simple names", () => {
    expect(NAME_REGEXP.test("Alice")).toBe(true);
  });

  it("accepts hyphenated and apostrophe names", () => {
    expect(NAME_REGEXP.test("Anne-Marie")).toBe(true);
    expect(NAME_REGEXP.test("O'Connor")).toBe(true);
    expect(NAME_REGEXP.test("Jean Paul")).toBe(true);
  });

  it("rejects names with digits or symbols", () => {
    expect(NAME_REGEXP.test("Alice123")).toBe(false);
    expect(NAME_REGEXP.test("")).toBe(false);
  });
});

describe("PASSWORD_REGEXP", () => {
  it("accepts a password with digit, lower and upper case and min length", () => {
    expect(PASSWORD_REGEXP.test("Passw0rd")).toBe(true);
  });

  it("rejects passwords missing complexity or length", () => {
    expect(PASSWORD_REGEXP.test("password")).toBe(false);
    expect(PASSWORD_REGEXP.test("PASSWORD1")).toBe(false);
    expect(PASSWORD_REGEXP.test("Pw1")).toBe(false);
  });
});

describe("emailRules", () => {
  it("returns a required rule and an email-type rule", () => {
    const rules = emailRules();
    expect(rules).toHaveLength(2);
    expect(rules[0]).toMatchObject({ required: true });
    expect(rules[1]).toMatchObject({ type: "email" });
  });
});

describe("nameRules", () => {
  it("returns a required rule and a pattern rule", () => {
    const rules = nameRules();
    expect(rules).toHaveLength(2);
    expect(rules[0]).toMatchObject({ required: true });
    expect(rules[1]).toMatchObject({ pattern: NAME_REGEXP });
  });
});

describe("requiredPasswordRules", () => {
  it("returns a single required rule", () => {
    const rules = requiredPasswordRules();
    expect(rules).toHaveLength(1);
    expect(rules[0]).toMatchObject({ required: true });
  });
});

describe("newPasswordRules", () => {
  it("returns a required rule and a complexity pattern rule", () => {
    const rules = newPasswordRules();
    expect(rules).toHaveLength(2);
    expect(rules[0]).toMatchObject({ required: true });
    expect(rules[1]).toMatchObject({ pattern: PASSWORD_REGEXP });
  });
});

describe("confirmPasswordRules", () => {
  it("returns a required rule and a validator rule", () => {
    const rules = confirmPasswordRules(() => "secret");
    expect(rules).toHaveLength(2);
    expect(rules[0]).toMatchObject({ required: true });
    expect(typeof rules[1].validator).toBe("function");
  });

  it("validator passes when value matches the live password", () => {
    const rules = confirmPasswordRules(() => "secret");
    expect(runValidator(rules[1], "secret")).toBe(true);
  });

  it("validator fails when value does not match the live password", () => {
    const rules = confirmPasswordRules(() => "secret");
    expect(runValidator(rules[1], "other")).toBe(false);
  });

  it("re-reads the password getter on each call", () => {
    let password = "first";
    const rules = confirmPasswordRules(() => password);
    expect(runValidator(rules[1], "first")).toBe(true);
    password = "second";
    expect(runValidator(rules[1], "first")).toBe(false);
    expect(runValidator(rules[1], "second")).toBe(true);
  });
});
