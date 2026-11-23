const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_RULES = [
    {
        id: "length",
        label: "Pelo menos 8 caracteres",
        error: "A senha precisa ter pelo menos 8 caracteres.",
        test: (value) => value.length >= 8
    },
    {
        id: "uppercase",
        label: "Uma letra maiúscula",
        error: "A senha precisa ter uma letra maiúscula.",
        test: (value) => /\p{Lu}/u.test(value)
    },
    {
        id: "lowercase",
        label: "Uma letra minúscula",
        error: "A senha precisa ter uma letra minúscula.",
        test: (value) => /\p{Ll}/u.test(value)
    },
    {
        id: "number",
        label: "Um número",
        error: "A senha precisa ter um número.",
        test: (value) => /\p{N}/u.test(value)
    },
    {
        id: "symbol",
        label: "Um caractere especial",
        error: "A senha precisa ter um caractere especial (ex.: ! @ # ?).",
        test: (value) => /[^\p{L}\p{N}]/u.test(value)
    }
];

export const PASSWORD_STRENGTH_LABELS = ["Muito fraca", "Muito fraca", "Fraca", "Média", "Boa", "Forte"];

export function isValidEmail(value) {
    return EMAIL_PATTERN.test(value);
}

export function checkPassword(value) {
    const results = PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(value) }));
    const score = results.filter((rule) => rule.passed).length;
    const firstFailure = results.find((rule) => !rule.passed);

    return {
        results,
        score,
        isValid: !firstFailure,
        error: firstFailure ? firstFailure.error : ""
    };
}