export const en = {
} as const;

export type TranslationKey = keyof typeof en;
export type Translation = Record<TranslationKey, string>;
