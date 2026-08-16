export const en = {
    "credits/flagpedia/description": "All flags for the language selector come from {}",
    "credits/flagpedia/link": "Flagpedia",
    "credits/project/description": "This tool was made by Adrien Matricon and has its own {}",
    "credits/project/link": "GitHub page",
    "credits/salamander/description": "All piano samples are taken from the {}, licensed under the Creative Commons Attribution 3.0 Unported License (CC BY 3.0)",
    "credits/salamander/link": "Salamander Grand Piano V3, by Alexander Holm",
    "credits/tonejs/description": "It relies on {} for sound generation, licensed under the MIT License",
    "credits/tonejs/link": "ToneJS",
    "title": "Singing practice",
} as const;

export type TranslationKey = keyof typeof en;
export type Translation = Record<TranslationKey, string>;
