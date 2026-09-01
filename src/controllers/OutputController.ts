import { Exercise, getMusicalSequence } from "../model/Exercise";
import { ExerciseHistory } from "../model/ExerciseHistory";
import { ActiveLanguage } from "../model/Language";
import { toABC } from "../model/Note";
import { SavedExercises } from "../model/SavedExercises";
import { ExerciseSelectionView } from "../ui/ExerciseSelectionView";
import { OutputView } from "../ui/OutputView";
import { showSavePrompt } from "../ui/savedExercisesDialog";
import { generateWav } from "../utils/wavGenerator";


// Generate a filename (without the extension)
function getMeaningfulFileName(exercise: Exercise): string
{
    let name = "";

    const splitPatternKey = exercise.musicalPattern.translationKey.split("/");
    name += splitPatternKey[splitPatternKey.length - 1];

    name += "_x" + exercise.nbTimesPatternPlayed;

    for (const bound of exercise.progression)
    {
        name += "_";
        switch (bound.type)
        {
        case "lowest": name += "lo"; break;
        case "highest": name += "hi"; break;
        }   // switch (bound.type)
        name += toABC(bound.note);
    }

    name += "_" + exercise.tempo + "bpm";

    return name;
}


export class OutputController
{
    constructor(outputView: OutputView,
                activeLanguage: ActiveLanguage,
                exerciseHistory: ExerciseHistory,
                savedExercises: SavedExercises,
                exerciseSelectionView: ExerciseSelectionView)
    {
        // Refresh the widget when language is changed
        // (note: we assume the widget is never destroyed and subscribe forever)
        activeLanguage.addEventListener(
            "change",
            () => outputView.refreshLanguage()
        );


        // Handle clicks on the save button
        // (note: we assume the widget is never destroyed and subscribe forever)
        outputView.addEventListener(
            "save",
            (event) => {
                showSavePrompt(
                    exerciseSelectionView.getExercise(),
                    (exercise, name) => { savedExercises.push(exercise, name); }
                );
            }
        );


        // Handle clicks on the generate button
        // (note: we assume the widget is never destroyed and subscribe forever)
        outputView.addEventListener(
            "generate",
            async (event) => {
                const exercise = exerciseSelectionView.getExercise();
                const generated = await generateWav(getMusicalSequence(exercise), exercise.tempo);
                const url = URL.createObjectURL(generated);
                outputView.setAudioFile(url, getMeaningfulFileName(exercise) + ".wav");
                exerciseHistory.push(exercise);
            }
        );
    }
};
