import { Exercise } from "../model/Exercise";
import { ExerciseHistory } from "../model/ExerciseHistory";
import { ActiveLanguage } from "../model/Language";
import { ExerciseHistoryView } from "../ui/ExerciseHistoryView";
import { ExerciseSelectionView } from "../ui/ExerciseSelectionView";

export class ExerciseHistoryController
{
    constructor(exerciseHistoryView: ExerciseHistoryView,
                activeLanguage: ActiveLanguage,
                exerciseHistory: ExerciseHistory,
                exerciseSelectionView: ExerciseSelectionView)
    {
        // Refresh the widget when language is changed
        // (note: we assume the widget is never destroyed and subscribe forever)
        activeLanguage.addEventListener(
            "change",
            () => exerciseHistoryView.refreshLanguage()
        );

        // Update history view when history changes
        // (note: we assume the widget is never destroyed and subscribe forever)
        exerciseHistory.addEventListener(
            "change",
            () => { exerciseHistoryView.set(exerciseHistory.get()); }
        );

        // Initialize history view with current state of the history
        const currentHistory = exerciseHistory.get();
        exerciseHistoryView.set(currentHistory);

        // If an exercise from history is clicked, load it into the selection view
        // (note: we assume the widget is never destroyed and subscribe forever)
        exerciseHistoryView.addEventListener(
            "click",
            (event) => { exerciseSelectionView.setExercise((event as CustomEvent<Exercise>).detail); }
        );

        // Initialize selector with latest item from history (if any)
        if (currentHistory.length > 0)
        {
            const latestExercise = currentHistory[currentHistory.length - 1];
            exerciseSelectionView.setExercise(latestExercise);
        }
    }
};
