import type { FormItemRule } from "naive-ui";

export const NAME_REGEXP = /^\p{L}+(?:[ '-]\p{L}+)*$/u;
export const PASSWORD_REGEXP = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

export const emailRules: FormItemRule[] = [
  { required: true, message: "Введите email", trigger: ["input", "blur"] },
  { type: "email", message: "Неверный формат email", trigger: ["input", "blur"] },
];

export const nameRules: FormItemRule[] = [
  { required: true, message: "Введите имя", trigger: ["input", "blur"] },
  { pattern: NAME_REGEXP, message: "Имя может содержать только буквы", trigger: ["input", "blur"] },
];

/** Just presence-checks a password — for fields like login or "current password" where the value already exists. */
export const requiredPasswordRules: FormItemRule[] = [
  { required: true, message: "Введите пароль", trigger: ["input", "blur"] },
];

/** Presence + complexity check — for fields where a new password is being set (registration, password change). */
export const newPasswordRules: FormItemRule[] = [
  { required: true, message: "Введите пароль", trigger: ["input", "blur"] },
  {
    pattern: PASSWORD_REGEXP,
    message: "Пароль должен содержать минимум 8 символов, заглавную, строчную букву и цифру",
    trigger: ["input", "blur"],
  },
];

/**
 * Build a rule that checks a confirmation field matches a live password value.
 * @param getPassword Getter returning the current password value to compare against.
 * @returns Rules array requiring a non-empty value that matches the password.
 */
export function confirmPasswordRules(getPassword: () => string): FormItemRule[] {
  return [
    { required: true, message: "Подтвердите пароль", trigger: ["input", "blur"] },
    {
      validator: (_rule, value: string) => (value === getPassword() ? true : new Error("Пароли не совпадают")),
      trigger: ["input", "blur"],
    },
  ];
}
