import { Language, ActiveLanguage } from "../model/Language";
import * as jsextra from "../utils/jsextra";
import { en, type Translation, type TranslationKey } from "./translations/en";
import { fr } from "./translations/fr";

export { TranslationKey };


// Map translations to supported languages
const translations: Record<Language, Translation> = {
    en,
    fr,
};

// Keep track of the active language
let usedActiveLanguage: ActiveLanguage;
export function initializeTranslation(activeLanguage: ActiveLanguage)
{
    usedActiveLanguage = activeLanguage;
}


// Associate a DOM element with a translation key
export function setTranslationKey(element: HTMLElement, key: TranslationKey): void
{
    element.dataset.i18n = key;
}


// Remove the translation key from a DOM element
export function removeTranslationKey(element: HTMLElement): void
{
    element.removeAttribute("data-i18n");
}


// Get the text associated with a translation key, without processing placeholders
function getRawTranslation(key: TranslationKey): string
{
    return translations[usedActiveLanguage.get()][key];
}


// Get the text associated with a translation key, filling the placeholders with the passed strings
export function t(key: TranslationKey, toInsert: string[] = []): string
{
    const textWithPlaceholders = getRawTranslation(key);
    const splitText = textWithPlaceholders.split("{}");
    let fullText = "";
    for ( let iText = 0, iToInsert = 0;
            ( (iText < splitText.length) || (iToInsert < toInsert.length) );
            ++iText, ++iToInsert )
    {
        if (iText < splitText.length)
        {
            const text = splitText[iText];
            if (text !== "")
            {
                fullText += text;
            }
        }

        if (iToInsert < toInsert.length)
        {
            const text = toInsert[iText];
            if (text !== "")
            {
                fullText += text;
            }
        }
    }

    return fullText;
}


// Update the text of an element and all its descendents, based on associated translation keys
export function updateLanguage(parent: HTMLElement): void
{
    // Get elements that require text
    const translatableElements = Array.from(parent.querySelectorAll<HTMLElement>("[data-i18n]"));
    if (parent.dataset.i18n !== undefined)
    {
        translatableElements.push(parent);
    }

    // Update text for each element
    for (const element of translatableElements)
    {
        // Identify text
        const translationKey = element.dataset.i18n as TranslationKey;
        const fullText = getRawTranslation(translationKey);

        // Split text around placeholders
        const splitText = fullText.split("{}");

        // Extract all children (if any)
        const children = Array.from(element.children);
        jsextra.removeAllChildren(element);

        // Put text in the node, with children instead of placeholders
        for ( let iText = 0, iChild = 0;
                ( (iText < splitText.length) || (iChild < children.length) );
                ++iText, ++iChild )
        {
            if (iText < splitText.length)
            {
                const text = splitText[iText];
                if (text !== "")
                {
                    element.append(text);
                }
            }

            if (iChild < children.length)
            {
                const child = children[iChild];
                element.append(child);
            }
        }
    }
}
