import { ActiveLanguage } from "../model/Language";
import { CreditsView } from "../ui/CreditsView";

export class CreditsController
{
    constructor(view: CreditsView, activeLanguage: ActiveLanguage)
    {
        // Refresh the widget when language is changed
        // (note: we assume the widget is never destroyed and subscribe forever)
        activeLanguage.addEventListener(
            "change",
            () => view.refreshLanguage()
        );
    }

};
