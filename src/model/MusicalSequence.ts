import * as jsextra from "../utils/jsextra";

import { Note, isNote } from "./Note";

export type TimedNote = {
    note: Note|null,    // What note is played (null for a rest)
    duration: number,   // For how long it's played
};

export type MusicalSequence = TimedNote[];


// TimedNote type checker
export function isTimedNote(value: unknown): value is TimedNote
{
    if (!jsextra.isNonNullObject(value))
    {
        return false;
    }

    const obj = value as Record<string, unknown>;

    return ( ( (obj.note === null) || isNote(obj.note) )
             && jsextra.isNumber(obj.duration) );
}


// MusicalSequence type checker
export function isMusicalSequence(value: unknown): value is MusicalSequence
{
    return Array.isArray(value) && value.every(isTimedNote);
}


// Get the duration of the sequence
export function getDuration(sequence: MusicalSequence): number
{
    if (sequence.length === 0)
    {
        return 0;
    }

    return sequence.map(timedNote => timedNote.duration).reduce((partialSum, a) => partialSum + a, 0);
}


// Get the first note
export function getFirstNote(sequence: MusicalSequence): Note|null
{
    const notes: Note[] = sequence.map(timedNote => timedNote.note).filter(x => (x!== null));

    if (notes.length === 0)
    {
        return null;
    }

    return notes[0];
}


// Get the last note
export function getLastNote(sequence: MusicalSequence): Note|null
{
    const notes: Note[] = sequence.map(timedNote => timedNote.note).filter(x => (x!== null));

    if (notes.length === 0)
    {
        return null;
    }

    return notes[notes.length - 1];
}


// Get the lowest note
export function getLowestNote(sequence: MusicalSequence): Note|null
{
    const notes: Note[] = sequence.map(timedNote => timedNote.note).filter(x => (x!== null));

    if (notes.length === 0)
    {
        return null;
    }

    return Math.min(...notes);
}


// Get the highest note
export function getHighestNote(sequence: MusicalSequence): Note|null
{
    const notes: Note[] = sequence.map(timedNote => timedNote.note).filter(x => (x!== null));

    if (notes.length === 0)
    {
        return null;
    }

    return Math.max(...notes);
}


// Shift musical sequence
export function getShiftedSequence(sequence: MusicalSequence, noteShift: number): MusicalSequence
{
    return sequence.map(timedNote => ({
        note: (timedNote.note === null) ? null : (timedNote.note + noteShift),
        duration: timedNote.duration,
    }));
}
