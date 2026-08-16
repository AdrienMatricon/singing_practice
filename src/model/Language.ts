import * as storage from "../utils/safeLocalStorage";

// Declare supported languages
export const supportedLanguages = ["en", "fr"] as const;

// Make that into a type
export type Language = typeof supportedLanguages[number];

// Language type checker
function isLanguage(value: string): value is Language
{
    return value in supportedLanguages;
}


// Active language management
export class ActiveLanguage extends EventTarget
{
    private readonly storageKey = "singing-practice.language";
    private value: Language;

    constructor()
    {
        super();
        this.value = this.getInitialLanguage();
    }

    public get(): Language
    {
        return this.value;
    }

    public set(newActiveLanguage: Language): void
    {
        if (newActiveLanguage !== this.value)
        {
            this.value = newActiveLanguage;
            storage.set(this.storageKey, newActiveLanguage);
            this.dispatchEvent(new Event("change"));
        }
    }

    // Determine what language to use when the user opens the page
    private getInitialLanguage(): Language
    {
        // If the user has made a choice, remember the choice
        const savedLanguage = storage.get(this.storageKey);
        if (savedLanguage && isLanguage(savedLanguage))
        {
            return savedLanguage;
        }

        // If not, try to use the browser's preferred language
        const browserLanguage = navigator.language.slice(0, 2);
        if (isLanguage(browserLanguage))
        {
            return browserLanguage;
        }

        // If all else fail, fall back on English
        return "en";
    }
};
