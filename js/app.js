
import musicalPatterns from "./musical_patterns.js";
import pitches from "./pitches.js";
import generateWav from "./wavGenerator.js"


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


// The pattern will be played starting on a note, then again and again moved by a semitone until a given note is reached,
// then again and again until back to where we started
function getFirstNotes(parameters)
{
    const startNote = pitches[parameters.start_note_pitch].number + 12 * (1 + parameters.start_note_octave);
    const endNote = pitches[parameters.end_note_pitch].number + 12 * (1 + parameters.end_note_octave);

    // Go from start to end
    let firstNotes = [];
    if (startNote <= endNote)
    {
        for (let i = startNote; i <= endNote; ++i)
        {
            firstNotes.push(i);
        }
    }
    else
    {
        for (let i = startNote; i >= endNote; --i)
        {
            firstNotes.push(i);
        }
    }
    
    // Go back from end to first
    const back = [...firstNotes].reverse();
    if (back.length > 1)
    {
        back.shift();
        firstNotes.push(...back);
    }
    
    return firstNotes;
}


// Returns what to play as an array of arrays
// - The out array contains an array per beat
// - Each inner array is what to play on that beat
function getWhatToPlay(parameters)
{
    const fullPattern = getFullPattern(parameters);
    const firstNotes = getFirstNotes(parameters);

    let toPlay = [];

    for (const first of firstNotes)
    {
        const notes = fullPattern.map(number => number + first);

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


// Handle clicks
document.getElementById("generate").onclick = async () => {
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

    // Display
    player.hidden = false;
    downloadLink.hidden = false;
    generateButton.innerText = "Generate"
};
