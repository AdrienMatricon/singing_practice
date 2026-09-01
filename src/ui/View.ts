import { updateLanguage } from "../i18n/translate";
import * as jsextra from "../utils/jsextra";

export class View extends EventTarget
{
    constructor(protected readonly container: HTMLElement)
    {
        super();
    }


    // Update the translation for all translatable elements of the view
    public refreshLanguage(): void
    {
        updateLanguage(this.container);
    }
};
