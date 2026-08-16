export const en = {
    "title": "Singing practice",
} as const;

export type TranslationKey = keyof typeof en;
export type Translation = Record<TranslationKey, string>;
