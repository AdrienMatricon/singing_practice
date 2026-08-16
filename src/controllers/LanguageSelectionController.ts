import { t } from "../i18n/translate";
import { Language, ActiveLanguage } from "../model/Language";
import { LanguageSelectionView } from "../ui/LanguageSelectionView";


// Set the title of the web page in the correct language
function setWebPageTitle(): void
{
    document.title = t("title");
}


export class LanguageSelectionController
{
    constructor(languageSelectionView: LanguageSelectionView, activeLanguage: ActiveLanguage)
    {
        // Set the web page's title and keep it in the correct language
        activeLanguage.addEventListener("change", () => {
            setWebPageTitle();
        });
        setWebPageTitle();


        // Refresh the widget when language is changed
        // (note: we assume the model is never destroyed and subscribe forever)
        languageSelectionView.addEventListener(
            "change",
            (event) => {
                setWebPageTitle(),
                activeLanguage.set((event as CustomEvent<Language>).detail);
            }
        );
    }

};
