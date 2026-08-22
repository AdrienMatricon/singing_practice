import { Exercise } from "../model/Exercise";
import { ActiveLanguage } from "../model/Language";
import { SavedExerciseEntry, SavedExercises } from "../model/SavedExercises";
import { ExerciseSelectionView } from "../ui/ExerciseSelectionView";
import { showRemovePrompt, showRenamePrompt } from "../ui/savedExercisesDialog";
import { SavedExercisesView } from "../ui/SavedExercisesView";

export class SavedExercisesController
{
    constructor(savedExercisesView: SavedExercisesView,
                activeLanguage: ActiveLanguage,
                savedExercises: SavedExercises,
                exerciseSelectionView: ExerciseSelectionView)
    {
        // Refresh the widget when language is changed
        // (note: we assume the widget is never destroyed and subscribe forever)
        activeLanguage.addEventListener(
            "change",
            () => savedExercisesView.refreshLanguage()
        );

        // Update saved exercises view when saved exercises change
        // (note: we assume the widget is never destroyed and subscribe forever)
        savedExercises.addEventListener(
            "change",
            () => { savedExercisesView.set(savedExercises.getAll()); }
        );

        // Initialize saved exercises view with currently saved exercises
        savedExercisesView.set(savedExercises.getAll());

        // If a saved exercise is clicked, load it into the selection view
        // (note: we assume the widget is never destroyed and subscribe forever)
        savedExercisesView.addEventListener(
            "click",
            (event) => { exerciseSelectionView.setExercise((event as CustomEvent<Exercise>).detail); }
        );

        // Handle clicks on the rename button
        // (note: we assume the widget is never destroyed and subscribe forever)
        savedExercisesView.addEventListener(
            "rename",
            (event) => {
                showRenamePrompt(
                    (event as CustomEvent<SavedExerciseEntry>).detail,
                    (entry) => { savedExercises.update(entry); }
                );
            }
        );

        // Handle clicks on the remove button
        // (note: we assume the widget is never destroyed and subscribe forever)
        savedExercisesView.addEventListener(
            "remove",
            (event) => {
                showRemovePrompt(
                    (event as CustomEvent<SavedExerciseEntry>).detail,
                    (entry) => { savedExercises.remove(entry); }
                );
            }
        );
    }
};
