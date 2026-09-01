import { ActiveLanguage } from "../model/Language";
import { ExerciseSelectionView } from "../ui/ExerciseSelectionView";

export class ExerciseSelectionController
{
    constructor(view: ExerciseSelectionView, activeLanguage: ActiveLanguage)
    {
        // Refresh the widget when language is changed
        // (note: we assume the widget is never destroyed and subscribe forever)
        activeLanguage.addEventListener(
            "change",
            () => view.refreshLanguage()
        );
    }

};
