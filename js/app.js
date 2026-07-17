
import musicalPatterns from "./musical_patterns.js";
import pitches from "./pitches.js";
import generateWav from "./wavGenerator.js"


// Global variables
let parameterHistory = [];
let savedParameters = [];


// Check that a given value is a valid option for a select object
function isValidOption(selectObject, value)
{
    for (const option of selectObject.options)
    {
        if (option.value == value)
        {
            return true;
        }
    }
    return false;
}


// Generate all the parameters set by the user
function getParameters()
{
    return {
        musical_pattern: document.getElementById("musical_pattern").value,
        pattern_repetition: document.getElementById("pattern_repetition").value,
        start_note_pitch: document.getElementById("start_note_pitch").value,
        start_note_octave: parseInt(document.getElementById("start_note_octave").value),
        end_note_pitch: document.getElementById("end_note_pitch").value,
        end_note_octave: parseInt(document.getElementById("end_note_octave").value),
        tempo: parseInt(document.getElementById("tempo").value)
    };
}


function setParameters(parameters)
{
    // Get relevant elements
    const musicalPattern = document.getElementById("musical_pattern");
    const patternRepetition = document.getElementById("pattern_repetition")
    const startNotePitch = document.getElementById("start_note_pitch");
    const startNoteOctave = document.getElementById("start_note_octave");
    const endNotePitch = document.getElementById("end_note_pitch");
    const endNoteOctave = document.getElementById("end_note_octave");
    const tempo = document.getElementById("tempo");

    // Check that parameters are valid
    if (!isValidOption(musicalPattern, parameters.musical_pattern)
     || !isValidOption(patternRepetition, parameters.pattern_repetition)
     || !isValidOption(startNotePitch, parameters.start_note_pitch)
     || !isValidOption(startNoteOctave, parameters.start_note_octave)
     || !isValidOption(endNotePitch, parameters.end_note_pitch)
     || !isValidOption(endNoteOctave, parameters.end_note_octave)
     || parameters.tempo < 1)
    {
        console.log("Cannot set parameters because they are invalid:", JSON.stringify(parameters));
        return;
    }

    musicalPattern.value = parameters.musical_pattern;
    patternRepetition.value = parameters.pattern_repetition;
    startNotePitch.value = parameters.start_note_pitch;
    startNoteOctave.value = parameters.start_note_octave;
    endNotePitch.value = parameters.end_note_pitch;
    endNoteOctave.value = parameters.end_note_octave;
    tempo.value = parameters.tempo;
}


// Get intervals for the full pattern, including repetitions
function getFullPattern(parameters)
{
    let intervals = musicalPatterns[parameters.musical_pattern].intervals;
    let fullPattern = [];
    for (let char of parameters.pattern_repetition)
    {
        let toAppend = [];
        if (char == "A")
        {
            toAppend = [...intervals];
        }
        else
        {
            toAppend = [...intervals].reverse()
        }

        if (fullPattern.length > 0)
        {
            // Don't repeat last note from previous repetitions
            toAppend.shift();
        }

        fullPattern.push(...toAppend)
    }

    return fullPattern;
}


// The pattern will be played at an initial position, then shifted semitone by semitone until a given position and back
function getLowestNotes(parameters)
{
    const startNote = pitches[parameters.start_note_pitch].number + 12 * (1 + parameters.start_note_octave);
    const endNote = pitches[parameters.end_note_pitch].number + 12 * (1 + parameters.end_note_octave);

    // Go from start to end
    let lowestNotes = [];
    if (startNote <= endNote)
    {
        for (let i = startNote; i <= endNote; ++i)
        {
            lowestNotes.push(i);
        }
    }
    else
    {
        for (let i = startNote; i >= endNote; --i)
        {
            lowestNotes.push(i);
        }
    }

    // Go back from end to start
    const back = [...lowestNotes].reverse();
    if (back.length > 1)
    {
        back.shift();
        lowestNotes.push(...back);
    }

    return lowestNotes;
}


// Returns what to play as an array of arrays
// - The out array contains an array per beat
// - Each inner array is what to play on that beat
function getWhatToPlay(parameters)
{
    const fullPattern = getFullPattern(parameters);
    const lowestNotes = getLowestNotes(parameters);

    let toPlay = [];

    for (const lowest of lowestNotes)
    {
        const notes = fullPattern.map(number => number + lowest);

        toPlay.push([]);
        toPlay.push([notes[0]]);
        toPlay.push([]);
        for (const note of notes)
        {
            toPlay.push([note]);
        }
    }

    return toPlay;
}


// Generate a filename (without the extension)
function getMeaningfulFileName(parameters)
{
    return parameters.musical_pattern
         + "_"
         + parameters.pattern_repetition
         + "_"
         + pitches[parameters.start_note_pitch].name
         + parameters.start_note_octave
         +"_to_"
         + pitches[parameters.end_note_pitch].name
         + parameters.end_note_octave
         + "_"
         + parameters.tempo
         + "bpm";
}


// Update the displayed history
function displayHistory()
{
    // Get element
    const history = document.getElementById("history");

    // Remove all children
    while (history.hasChildNodes())
    {
        history.removeChild(history.firstChild);
    }

    // Create list caption
    let caption = document.createElement("figcaption");
    caption.innerText = (parameterHistory.length == 0) ? "No history" : "History:";
    history.appendChild(caption);

    // Create list
    let list = document.createElement("ul");
    history.appendChild(list);
    const reversedHistory = [...parameterHistory].reverse();
    for (const toDisplay of reversedHistory)
    {
        let historyItem = document.createElement("li");
        historyItem.innerText = getMeaningfulFileName(toDisplay);
        list.appendChild(historyItem);

        historyItem.addEventListener("click", () => { setParameters(toDisplay); });
    }
}


// Update the displayed saved params
function displaySaved()
{
    // Get element
    const saved = document.getElementById("saved");

    // Remove all children
    while (saved.hasChildNodes())
    {
        saved.removeChild(saved.firstChild);
    }

    // Create list caption
    let caption = document.createElement("figcaption");
    caption.innerText = (savedParameters.length == 0) ? "No saved exercices" : "Saved exercices:";
    saved.appendChild(caption);

    // Create list
    let list = document.createElement("ul");
    saved.appendChild(list);
    for (let i = savedParameters.length - 1; i >= 0; --i)
    {
        let toDisplay = savedParameters[i];

        // List item
        let savedItem = document.createElement("li");
        list.appendChild(savedItem);

        // Div with the chosen and default names, clickable to use the params
        {
            let div = document.createElement("div");
            savedItem.appendChild(div);

            if (toDisplay.name != "")
            {
                let chosenName = document.createElement("div");
                chosenName.innerText = toDisplay.name;
                div.appendChild(chosenName);
            }

            let defaultName = document.createElement("div");
            defaultName.innerText = getMeaningfulFileName(toDisplay.params);
            div.appendChild(defaultName);

            div.addEventListener("click", () => { setParameters(toDisplay.params); });
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
                window.localStorage.setItem("saved", JSON.stringify(savedParameters))
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
                const name = (toDisplay.name != "") ? toDisplay.name : getMeaningfulFileName(toDisplay.params);

                // Ask for confirmation
                if (!confirm("Are you sure you want to remove " + name + ' ?'))
                {
                    return;
                }

                // Remove saved
                savedParameters.splice(i, 1);

                // Update
                window.localStorage.setItem("saved", JSON.stringify(savedParameters))
                displaySaved();
            });
        }
    }
}


// Initialize pattern selector
{
    const selector = document.getElementById("musical_pattern");
    for (const key of Object.keys(musicalPatterns))
    {
        selector.add(new Option(musicalPatterns[key].name, key));
    }
}


// Initialize note selectors
{
    const startPitchSelector = document.getElementById("start_note_pitch");
    const endPitchSelector = document.getElementById("end_note_pitch");
    for (const key of Object.keys(pitches))
    {
        startPitchSelector.add(new Option(pitches[key].name, key));
        endPitchSelector.add(new Option(pitches[key].name, key));
    }

    const startOctaveSelector = document.getElementById("start_note_octave");
    const endOctaveSelector = document.getElementById("end_note_octave");
    for (let i = 0; i <= 9; ++i)
    {
        startOctaveSelector.add(new Option(i));
        endOctaveSelector.add(new Option(i));
    }
}


// Enforce valid value for tempo
{
    const tempo = document.getElementById("tempo");
    tempo.addEventListener("input", () => {
        if (!tempo.checkValidity())
        {
            tempo.value = 200;
        }
    });
}


// Retrieve and display history (if any)
{
    // Get history (if any)
    const serialized = window.localStorage.getItem("history");
    if (serialized)
    {
        parameterHistory = JSON.parse(serialized);
    }

    // Display history
    displayHistory();

    // Restore last parameters
    if (parameterHistory.length > 0)
    {
        setParameters(parameterHistory[parameterHistory.length - 1]);
    }
}


// Retrieve and display saved (if any)
{
    // Get saved (if any)
    const serialized = window.localStorage.getItem("saved");
    if (serialized)
    {
        savedParameters = JSON.parse(serialized);
    }

    // Display saved
    displaySaved();
}


// Save parameters when the button is clicked
document.getElementById("save").addEventListener("click", () => {
    // Get params
    const parameters = getParameters();

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
    savedParameters.push({name: name, params: parameters});
    window.localStorage.setItem("saved", JSON.stringify(savedParameters))

    // Update display
    displaySaved();
});


// Generate audio when the button is clicked
document.getElementById("generate").addEventListener("click", async () => {
    // Clear previous
    const player = document.getElementById("player");
    const generateButton = document.getElementById("generate");
    const downloadLink = document.getElementById("download");
    player.hidden = true;
    downloadLink.hidden = true;
    generateButton.innerText = "Generating..."

    // Generate
    const parameters = getParameters();
    const generated = await generateWav(getWhatToPlay(parameters), parameters.tempo);
    const url = URL.createObjectURL(generated);
    const audio = document.querySelector("audio");
    audio.src = url;
    downloadLink.href = url;
    downloadLink.download = getMeaningfulFileName(parameters) + ".wav"

    // Update history
    {
        // Remove parameters if they already were in the history
        parameterHistory = parameterHistory.filter(p => JSON.stringify(p) != JSON.stringify(parameters));

        // Push new parameters
        parameterHistory.push(parameters);

        // Maximum history length
        while(parameterHistory.length > 20)
        {
            parameterHistory.shift();
        }

        // Save new history
        window.localStorage.setItem("history", JSON.stringify(parameterHistory))

        // Update display
        displayHistory();
    }

    // Display
    player.hidden = false;
    downloadLink.hidden = false;
    generateButton.innerText = "Generate"
});
