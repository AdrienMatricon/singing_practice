
import { CreditsController } from "./controllers/CreditsController";
import { ExerciseSelectionController } from "./controllers/ExerciseSelectionController";
import { LanguageSelectionController } from "./controllers/LanguageSelectionController";
import { initializeTranslation } from "./i18n/translate";
import { Exercise, toExercise, getMusicalSequence } from "./model/Exercise";
import { ActiveLanguage } from "./model/Language";
import { toABC } from "./model/Note";
import { CreditsView } from "./ui/CreditsView";
import { ExerciseSelectionView } from "./ui/ExerciseSelectionView";
import { LanguageSelectionView } from "./ui/LanguageSelectionView";
import * as jsextra from "./utils/jsextra";
import { generateWav } from "./utils/wavGenerator"

import "./style.css";


// Initialize translation
const activeLanguage = new ActiveLanguage();
initializeTranslation(activeLanguage);

// Views
const languageSelectionView
    = new LanguageSelectionView(document.querySelector("#language-selector")!);
const creditsView
    = new CreditsView(document.querySelector("#credits")!);
const exerciseSelectionView
    = new ExerciseSelectionView(document.querySelector("#exercise-selector")!);

// Controllers
const languageSelectionController
    = new LanguageSelectionController(languageSelectionView, activeLanguage);
const creditsController
    = new CreditsController(creditsView, activeLanguage);
const exerciseSelectionController
    = new ExerciseSelectionController(exerciseSelectionView, activeLanguage);


type SavedExercise = {
    name: string,
    exercise: Exercise,
};

// Global variables
let exerciseHistory: Exercise[] = [];
let savedExercises: SavedExercise[] = [];


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


// Update the displayed history
function displayHistory(): void
{
    // Get element
    const history = document.getElementById("history") as HTMLElement;

    // Remove all children
    while (history.firstChild)
    {
        history.removeChild(history.firstChild);
    }

    // Create list caption
    let caption = document.createElement("figcaption");
    caption.innerText = (exerciseHistory.length === 0) ? "No history" : "History:";
    history.appendChild(caption);

    // Create list
    let list = document.createElement("ul");
    history.appendChild(list);
    const reversedHistory = [...exerciseHistory].reverse();
    for (const toDisplay of reversedHistory)
    {
        let historyItem = document.createElement("li");
        historyItem.innerText = getMeaningfulFileName(toDisplay);
        list.appendChild(historyItem);

        historyItem.addEventListener("click", () => { exerciseSelectionView.setExercise(toDisplay); });
    }
}


// Update the displayed saved exercises
function displaySaved(): void
{
    // Get element
    const saved = document.getElementById("saved") as HTMLElement;

    // Remove all children
    while (saved.firstChild)
    {
        saved.removeChild(saved.firstChild);
    }

    // Create list caption
    let caption = document.createElement("figcaption");
    caption.innerText = (savedExercises.length === 0) ? "No saved exercise" : "Saved exercises:";
    saved.appendChild(caption);

    // Create list
    let list = document.createElement("ul");
    saved.appendChild(list);
    for (let i = savedExercises.length - 1; i >= 0; --i)
    {
        let toDisplay = savedExercises[i];

        // List item
        let savedItem = document.createElement("li");
        list.appendChild(savedItem);

        // Div with the chosen and default names, clickable to load the exercise
        {
            let div = document.createElement("div");
            savedItem.appendChild(div);

            if (toDisplay.name !== "")
            {
                let chosenName = document.createElement("div");
                chosenName.innerText = toDisplay.name;
                div.appendChild(chosenName);
            }

            let defaultName = document.createElement("div");
            defaultName.innerText = getMeaningfulFileName(toDisplay.exercise);
            div.appendChild(defaultName);

            div.addEventListener("click", () => { exerciseSelectionView.setExercise(toDisplay.exercise); });
        }

        // Rename button
        {
            let button = document.createElement("button");
            button.innerText = "✏️";
            savedItem.appendChild(button);
            button.addEventListener("click", () => {
                // Prompt new name
                let name = prompt("Edit optional name", toDisplay.name);
                if (name === null)
                {
                    // User clicked Cancel
                    return;
                }

                // Save new name
                name = name.trim();
                toDisplay.name = name;

                // Update
                window.localStorage.setItem("saved", JSON.stringify(savedExercises))
                displaySaved();
            });
        }

        // Remove button
        {
            let button = document.createElement("button");
            button.innerText = "🗑️";
            savedItem.appendChild(button);
            button.addEventListener("click", () => {
                // Get name
                const name = (toDisplay.name !== "") ? toDisplay.name : getMeaningfulFileName(toDisplay.exercise);

                // Ask for confirmation
                if (!confirm("Are you sure you want to remove " + name + ' ?'))
                {
                    return;
                }

                // Remove saved
                savedExercises.splice(i, 1);

                // Update
                window.localStorage.setItem("saved", JSON.stringify(savedExercises))
                displaySaved();
            });
        }
    }
}


// Retrieve and display history (if any)
{
    // Get history (if any)
    const serialized = window.localStorage.getItem("history");
    if (!serialized)
    {
        console.error("Cannot load saved exercises (cannot parse JSON): ", serialized);
    }
    else
    {
        const parsed = JSON.parse(serialized);
        if (!Array.isArray(parsed))
        {
            console.error("Cannot load history (not an array):", parsed);
        }
        else
        {
            const converted = parsed.map(x => toExercise(x));
            if (!converted.every(x => (x !== null)))
            {
                console.error("Cannot load history (invalid exercises): ", parsed);
            }
            else
            {
                exerciseHistory = converted;
            }
        }
    }

    // Display history
    displayHistory();

    // Restore last exercise
    if (exerciseHistory.length > 0)
    {
        exerciseSelectionView.setExercise(exerciseHistory[exerciseHistory.length - 1]);
    }
}


// Retrieve and display saved (if any)
{
    // Get saved (if any)
    const serialized = window.localStorage.getItem("saved");
    if (!serialized)
    {
        console.error("Cannot load saved exercises (cannot parse JSON): ", serialized);
    }
    else
    {
        const parsed = JSON.parse(serialized);
        if (!Array.isArray(parsed))
        {
            console.error("Cannot load saved exercises (not an array): ", parsed);
        }
        else
        {
            const converted = parsed.map(x => ({ name: x.name, exercise: toExercise(x.exercise)}));
            if (!converted.every(x => ( (jsextra.isString(x.name)) && (x.exercise !== null) ) ))
            {
                console.error("Cannot load saved exercises (invalid exercises): ", parsed);
            }
            else
            {
                savedExercises = converted as SavedExercise[];
            }
        }
    }

    // Display saved
    displaySaved();
}


// Save exercise when the button is clicked
(document.getElementById("save") as HTMLElement).addEventListener("click", () => {
    // Get exercise
    const exercise = exerciseSelectionView.getExercise();

    if (exercise === null)
    {
        alert("Cannot save invalid exercise");
        return;
    }

    // Get name
    let name = prompt("Choose a name (optional)");
    if (name === null)
    {
        // User clicked Cancel
        return;
    }
    else
    {
        name = name.trim();
    }

    // Save
    savedExercises.push({name: name, exercise: exercise});
    window.localStorage.setItem("saved", JSON.stringify(savedExercises))

    // Update display
    displaySaved();
});


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
    {
        // Remove exercise if it already was in the history
        exerciseHistory = exerciseHistory.filter(p => JSON.stringify(p) !== JSON.stringify(exercise));

        // Push new exercise
        exerciseHistory.push(exercise);

        // Maximum history length
        while(exerciseHistory.length > 20)
        {
            exerciseHistory.shift();
        }

        // Save new history
        window.localStorage.setItem("history", JSON.stringify(exerciseHistory))

        // Update display
        displayHistory();
    }

    // Display
    player.hidden = false;
    downloadLink.hidden = false;
    generateButton.innerText = "Generate"
});
