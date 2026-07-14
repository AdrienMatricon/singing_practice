
import musicalPatterns from "./musical_patterns.js";
import pitches from "./pitches.js";
import generateWav from "./wavGenerator.js"


// Get intervals for the full pattern, including repetitions
function getFullPattern()
{
    const selectedPattern = document.getElementById("musical_pattern").value;
    let intervals = musicalPatterns[selectedPattern].intervals;
    const repetition = document.getElementById("pattern_repetition").value
    let fullPattern = [];
    for (let char of repetition)
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
function getFirstNotes()
{
    const selectedStartPitch = document.getElementById("start_note_pitch").value;
    const selectedStartOctave = document.getElementById("start_note_octave").value;
    const startNote = pitches[selectedStartPitch].number + 12 * (1 + parseInt(selectedStartOctave));

    const selectedEndPitch = document.getElementById("end_note_pitch").value;
    const selectedEndOctave = document.getElementById("end_note_octave").value;
    const endNote = pitches[selectedEndPitch].number + 12 * (1 + parseInt(selectedEndOctave));

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
function getWhatToPlay()
{
    const fullPattern = getFullPattern();
    const firstNotes = getFirstNotes();

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


// Get the tempo
function getTempo()
{
    return parseInt(document.getElementById("tempo").value);
}


// Generate a filename (without the extension)
function getMeaningfulFileName()
{
    return document.getElementById("musical_pattern").value
         + "_"
         + document.getElementById("pattern_repetition").value
         + "_"
         + pitches[document.getElementById("start_note_pitch").value].name
         + document.getElementById("start_note_octave").value
         +"_to_"
         + pitches[document.getElementById("end_note_pitch").value].name
         + document.getElementById("end_note_octave").value;
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
    const player = document.getElementById("player");
    const generateButton = document.getElementById("generate");
    const downloadLink = document.getElementById("download");
    player.hidden = true;
    downloadLink.hidden = true;
    generateButton.innerText = "Generating..."

    const generated = await generateWav(getWhatToPlay(), getTempo());
    const url = URL.createObjectURL(generated);
    const audio = document.querySelector("audio");
    audio.src = url;
    downloadLink.href = url;
    downloadLink.download = getMeaningfulFileName() + ".wav"

    player.hidden = false;
    downloadLink.hidden = false;
    generateButton.innerText = "Generate"
};
