import { Language, supportedLanguages } from "../model/Language";
import * as jsextra from "../utils/jsextra";
import { View } from "./View";

export class LanguageSelectionView extends View
{
    constructor(container: HTMLElement)
    {
        super(container);
        this.render();
    }


    // Render or re-render the whole widget
    private render(): void
    {
        // Empty the container if relevant
        jsextra.removeAllChildren(this.container);

        // Add a flag for each language
        for (const language of supportedLanguages)
        {
            const img = document.createElement("img");
            img.alt = language;
            img.src = `/languages/${language}.svg`
            img.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent<Language>("change", {
                    detail: language,
                }));
            });
            this.container.append(img);
        }
    }
};
