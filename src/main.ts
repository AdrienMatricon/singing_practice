
import { CreditsController } from "./controllers/CreditsController";
import { ExerciseHistoryController } from "./controllers/ExerciseHistoryController";
import { ExerciseSelectionController } from "./controllers/ExerciseSelectionController";
import { LanguageSelectionController } from "./controllers/LanguageSelectionController";
import { initializeTranslation } from "./i18n/translate";
import { Exercise, toExercise, getMusicalSequence } from "./model/Exercise";
import { ExerciseHistory } from "./model/ExerciseHistory";
import { ActiveLanguage } from "./model/Language";
import { SavedExercises } from "./model/SavedExercises";
import { toABC } from "./model/Note";
import { CreditsView } from "./ui/CreditsView";
import { ExerciseHistoryView } from "./ui/ExerciseHistoryView";
import { ExerciseSelectionView } from "./ui/ExerciseSelectionView";
import { LanguageSelectionView } from "./ui/LanguageSelectionView";
import { SavedExercisesView } from "./ui/SavedExercisesView";
import * as jsextra from "./utils/jsextra";
import { generateWav } from "./utils/wavGenerator"

import "./style.css";
import { SavedExercisesController } from "./controllers/SavedExercisesController";


// Initialize translation
const activeLanguage = new ActiveLanguage();
initializeTranslation(activeLanguage);

// Models
const exerciseHistory = new ExerciseHistory();
const savedExercises = new SavedExercises();

// Views
const languageSelectionView
    = new LanguageSelectionView(document.querySelector("#language-selector")!);
const creditsView
    = new CreditsView(document.querySelector("#credits")!);
const exerciseSelectionView
    = new ExerciseSelectionView(document.querySelector("#exercise-selector")!);
const exerciseHistoryView
    = new ExerciseHistoryView(document.querySelector("#exercise-history")!);
const savedExercisesView
    = new SavedExercisesView(document.querySelector("#saved-exercises")!);

// Controllers
const languageSelectionController
    = new LanguageSelectionController(languageSelectionView, activeLanguage);
const creditsController
    = new CreditsController(creditsView, activeLanguage);
const exerciseSelectionController
    = new ExerciseSelectionController(exerciseSelectionView, activeLanguage);
const exerciseHistoryController
    = new ExerciseHistoryController(exerciseHistoryView, activeLanguage, exerciseHistory, exerciseSelectionView);
const savedExercisesController
    = new SavedExercisesController(savedExercisesView, activeLanguage, savedExercises, exerciseSelectionView);


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


// Generate audio when the button is clicked
(document.getElementById("generate") as HTMLElement).addEventListener("click", async () => {
    // Clear previous
    const player = document.getElementById("player") as HTMLElement;
    const generateButton = document.getElementById("generate") as HTMLElement;
    const downloadLink = document.getElementById("download") as HTMLAnchorElement;
    player.hidden = true;
    downloadLink.hidden = true;
    generateButton.innerText = "Generating..."

    // Get exercise
    const exercise = exerciseSelectionView.getExercise();
    if (exercise === null)
    {
        alert("Cannot generate invalid exercise");
        return;
    }

    // Generate
    const generated = await generateWav(getMusicalSequence(exercise), exercise.tempo);
    const url = URL.createObjectURL(generated);
    const audio = document.querySelector("audio") as HTMLAudioElement;
    audio.src = url;
    downloadLink.href = url;
    downloadLink.download = getMeaningfulFileName(exercise) + ".wav"

    // Update history
    exerciseHistory.push(exercise);

    // Display
    player.hidden = false;
    downloadLink.hidden = false;
    generateButton.innerText = "Generate"
});
