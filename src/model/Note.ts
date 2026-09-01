import * as jsextra from "../utils/jsextra";

// A note is identified by its midi number
export type Note = number;

// Note type checker
export function isNote(value: unknown): value is Note
{
    return jsextra.isNumber(value);
}


// Lowest and highest note on the piano
export const pianoLowestNote: Note = 21;
export const pianoHighestNote: Note = 108;


// Pitch names, semitone per semitone, starting with C/do
const pitches = [
    ["C", "do"],
    ["C#", "do#"],
    ["D", "re"],
    ["D#", "re#"],
    ["E", "mi"],
    ["F", "fa"],
    ["F#", "fa#"],
    ["G", "sol"],
    ["G#", "sol#"],
    ["A", "la"],
    ["A#", "la#"],
    ["B", "si"],
] as const;


// Convert note name in ABC notation to actual note (if valid)
export function fromABC(noteName: string): Note|null
{
    const match = noteName.match(/^(\D+)(\d+)$/);
    if (!match)
    {
        return null;
    }

    const pitch = match[1];
    const octave = Number(match[2]);

    for (const [index, value] of pitches.entries())
    {
        if (value[0] === pitch)
        {
            return index + 12 * (1 + octave);
        }
    }

    return null;
}


// Convert note to ABC notation
export function toABC(note: Note): string
{
    const pitchNumber = note % 12;
    const octave = Math.floor(note / 12) - 1;
    return pitches[pitchNumber][0] + octave.toString();
}


// Convert note name in DoReMi notation to actual note (if valid)
export function fromDoReMi(noteName: string): Note|null
{
    const match = noteName.match(/^(\D+)(\d+)$/);
    if (!match)
    {
        return null;
    }

    const pitch = match[1];
    const octave = Number(match[2]);

    for (const [index, value] of pitches.entries())
    {
        if (value[1] === pitch)
        {
            return index + 12 * (2 + octave);
        }
    }

    return null;
}


// Convert note to DoReMi notation
export function toDoReMi(note: Note): string
{
    const pitchNumber = note % 12;
    const octave = Math.floor(note / 12)-2;
    return pitches[pitchNumber][1] + octave.toString();
}
