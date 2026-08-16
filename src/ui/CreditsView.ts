import { TranslationKey, setTranslationKey } from "../i18n/translate";
import * as jsextra from "../utils/jsextra";
import { View } from "./View";

type Credited = {
    descriptionKey: TranslationKey,
    linkKey: TranslationKey,
    linkUrl: string,
};


export class CreditsView extends View
{
    private readonly entries: Credited[] = [
        {
            descriptionKey: "credits/project/description",
            linkKey: "credits/project/link",
            linkUrl: "https://github.com/AdrienMatricon/singing_practice"
        },
        {
            descriptionKey: "credits/tonejs/description",
            linkKey: "credits/tonejs/link",
            linkUrl: "https://tonejs.github.io"
        },
        {
            descriptionKey: "credits/salamander/description",
            linkKey: "credits/salamander/link",
            linkUrl: "https://github.com/sfzinstruments/SalamanderGrandPiano"
        },
        {
            descriptionKey: "credits/flagpedia/description",
            linkKey: "credits/flagpedia/link",
            linkUrl: "https://flagpedia.net/"
        },
    ] as const;


    constructor(container: HTMLElement)
    {
        super(container);

        // Render the widget
        this.render();
    }


    // Render or re-render the whole widget
    private render(): void
    {
        // Empty the container if relevant
        jsextra.removeAllChildren(this.container);

        // Create list
        const list = document.createElement("ul");
        this.container.append(list);

        // Create list elements
        for (const entry of this.entries)
        {
            // Create list item, with associated text
            const item = document.createElement("li");
            setTranslationKey(item, entry.descriptionKey);
            list.append(item);

            // Item description contains a placeholder for a link,
            // so create a link, with associated text, and put it inside
            const link = document.createElement("a");
            link.href = entry.linkUrl;
            setTranslationKey(link, entry.linkKey);
            item.append(link);
        }

        // Fill text
        this.refreshLanguage();
    }
}
