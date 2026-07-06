import type { FormItemRule } from "naive-ui";
import { i18n } from "@/i18n";

const t = i18n.global.t;

export const NAME_REGEXP = /^\p{L}+(?:[ '-]\p{L}+)*$/u;
export const PASSWORD_REGEXP = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

/** Builds email validation rules using the current locale's messages. */
export function emailRules(): FormItemRule[] {
  return [
    { required: true, message: t("validation.email.required"), trigger: ["input", "blur"] },
    { type: "email", message: t("validation.email.invalid"), trigger: ["input", "blur"] },
  ];
}

/** Builds name validation rules using the current locale's messages. */
export function nameRules(): FormItemRule[] {
  return [
    { required: true, message: t("validation.name.required"), trigger: ["input", "blur"] },
    { pattern: NAME_REGEXP, message: t("validation.name.invalid"), trigger: ["input", "blur"] },
  ];
}

/** Just presence-checks a password — for fields like login or "current password" where the value already exists. */
export function requiredPasswordRules(): FormItemRule[] {
  return [{ required: true, message: t("validation.password.required"), trigger: ["input", "blur"] }];
}

/** Presence + complexity check — for fields where a new password is being set (registration, password change). */
export function newPasswordRules(): FormItemRule[] {
  return [
    { required: true, message: t("validation.password.required"), trigger: ["input", "blur"] },
    {
      pattern: PASSWORD_REGEXP,
      message: t("validation.password.complexity"),
      trigger: ["input", "blur"],
    },
  ];
}

/**
 * Build a rule that checks a confirmation field matches a live password value.
 * @param getPassword Getter returning the current password value to compare against.
 * @returns Rules array requiring a non-empty value that matches the password.
 */
export function confirmPasswordRules(getPassword: () => string): FormItemRule[] {
  return [
    { required: true, message: t("validation.confirmPassword.required"), trigger: ["input", "blur"] },
    {
      validator: (_rule, value: string) =>
        value === getPassword() ? true : new Error(t("validation.confirmPassword.mismatch")),
      trigger: ["input", "blur"],
    },
  ];
}
