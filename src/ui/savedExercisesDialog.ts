
import { t } from "../i18n/translate";
import { Exercise } from "../model/Exercise";
import { SavedExerciseEntry } from "../model/SavedExercises";
import { getExerciseDescription } from "./exerciseDescription";


function promptName(suggestion: string|null): string|null
{
    let name = prompt(
        t("saved-exercises/name-prompt"),
        ( (suggestion === null) ? "" : suggestion)
    );

    if (name === null)
    {
        // User clicked Cancel
        return null;
    }

    // Return trimmed name
    name = name.trim();
    return name;
}


// Prompt the user to save (and possibly name) an exercise, and run the callback if they don't cancel
export function showSavePrompt(exercise: Exercise, callback: (exercise: Exercise, name: string|null) => void): void
{
    // Prompt name
    let name = promptName(null);

    // Do nothing if user clicked cancel
    if (name === null)
    {
        return;
    }

    // Identify when the user chose not to give a name to the exercise
    if (name === "")
    {
        name = null;
    }

    // Run callback
    callback(exercise, name);
}


// Prompt the user to rename a saved exercise, and run the callback if they don't cancel
export function showRenamePrompt(entry: SavedExerciseEntry, callback: (entry: SavedExerciseEntry) => void): void
{
    // Prompt new name
    let name = promptName(entry.name);

    // Do nothing if user clicked cancel
    if (name === null)
    {
        return;
    }

    // Identify when the user chose not to give a name to the exercise
    if (name === "")
    {
        name = null;
    }

    // Run callback
    callback({
        "id": entry.id,
        "name": name,
        "exercise": entry.exercise,
    });
}


// Prompt the user to remove a saved exercise, and run the callback if they don't cancel
export function showRemovePrompt(entry: SavedExerciseEntry, callback: (entry: SavedExerciseEntry) => void): void
{
    // Create confirmation message
    const confirmationMessage = t(
        "saved-exercises/confirm-remove",
        [
            ((entry.name === null) ? getExerciseDescription(entry.exercise) : ('"' + entry.name + '"'))
        ]
    );

    // Ask for confirmation
    if (!confirm(confirmationMessage))
    {
        return;
    }

    // Run callback
    callback(entry);
}
