import { TranslationKey } from "../i18n/translate";
import * as jsextra from "../utils/jsextra";
import { MusicalPattern, isMusicalPattern, getSelectableMusicalPattern } from "./MusicalPattern";
import * as musicalSequence from "./MusicalSequence";
import { Note, isNote, fromABC } from "./Note";


// Type for exercises (V1)
type ExerciseV1 = {
    musical_pattern: string,
    pattern_repetition: string,
    start_note_pitch: string,
    start_note_octave: number,
    end_note_pitch: string,
    end_note_octave: number,
    tempo: number,
};


// ExerciseV1 type checker
function isExerciseV1(value: unknown): value is ExerciseV1
{
    if (!jsextra.isNonNullObject(value))
    {
        return false;
    }

    const obj = value as Record<string, unknown>;

    return ( jsextra.isString(obj.musical_pattern)
             && ( jsextra.isString(obj.pattern_repetition)
                  && ( (obj.pattern_repetition === "A")
                       || (obj.pattern_repetition === "D")
                       || (obj.pattern_repetition === "AD")
                       || (obj.pattern_repetition === "DA")
                       || (obj.pattern_repetition === "ADA")
                       || (obj.pattern_repetition === "DAD") ))
             && jsextra.isString(obj.start_note_pitch)
             && jsextra.isNumber(obj.start_note_octave)
             && jsextra.isString(obj.end_note_pitch)
             && jsextra.isNumber(obj.end_note_octave)
             && jsextra.isNumber(obj.tempo) );
}


// Conversion function
function toExerciseV1(value: unknown): ExerciseV1 | null
{
    if (isExerciseV1(value))
    {
        return value;
    }

    return null;
}


// Declare bound types, with associated language keys
export const progressionBoundTypes: Record<string, TranslationKey> = {
    "highest": "exercise/pattern-shift-bound-type/highest",
    "lowest": "exercise/pattern-shift-bound-type/lowest"
} as const;

// Make that into a type
export type ProgressionBoundType = keyof typeof progressionBoundTypes;

// ProgressionBoundType type checker
function isProgressionBoundType(value: unknown): value is ProgressionBoundType
{
    return ( jsextra.isString(value) && value in progressionBoundTypes );
}


// Type for bounds, when shifting the musical pattern around
export type ProgressionBound = {
    type: ProgressionBoundType,
    note: Note,
};

// ProgressionBound type checker
export function isProgressionBound(value: unknown): value is ProgressionBound
{
    if (!jsextra.isNonNullObject(value))
    {
        return false;
    }

    const obj = value as Record<string, unknown>;

    return ( isProgressionBoundType(obj.type) && isNote(obj.note) );
}


// Type for exercises (V2)
type ExerciseV2 = {
    musicalPattern: MusicalPattern,
    nbTimesPatternPlayed: number,
    reverseOnRepetition: boolean,
    progression: ProgressionBound[],
    tempo: number,
};


// ExerciseV2 type checker
function isExerciseV2(value: unknown): value is ExerciseV2
{
    if (!jsextra.isNonNullObject(value))
    {
        return false;
    }

    const obj = value as Record<string, unknown>;

    return ( isMusicalPattern(obj.musicalPattern)
             && jsextra.isNumber(obj.nbTimesPatternPlayed)
             && jsextra.isBoolean(obj.reverseOnRepetition)
             && ( Array.isArray(obj.progression) && obj.progression.every(isProgressionBound) )
             && jsextra.isNumber(obj.tempo) );
}


// Conversion function
function toExerciseV2(value: unknown): ExerciseV2 | null
{
    // Direct conversion
    if (isExerciseV2(value))
    {
        return value;
    }

    // Try to convert to older implementation and upgrade
    const asV1 = toExerciseV1(value);
    if (asV1 === null)
    {
        return null;
    }

    const startsWithAscending = (asV1.pattern_repetition[0] === "A");
    let pattern: MusicalPattern | null = null;
    switch (asV1.musical_pattern)
    {
    case "pentachord":
        if (startsWithAscending)
        {
            pattern = getSelectableMusicalPattern("musical-pattern/pentachord-ascending");
        }
        else
        {
            pattern = getSelectableMusicalPattern("musical-pattern/pentachord-descending");
        }
        break;
    case "major_arpeggio":
        if (startsWithAscending)
        {
            pattern = getSelectableMusicalPattern("musical-pattern/major-arpeggio-ascending");
        }
        else
        {
            pattern = getSelectableMusicalPattern("musical-pattern/major-arpeggio-descending");
        }
        break;
    case "major_scale":
        if (startsWithAscending)
        {
            pattern = getSelectableMusicalPattern("musical-pattern/major-scale-ascending");
        }
        else
        {
            pattern = getSelectableMusicalPattern("musical-pattern/major-scale-descending");
        }
        break;
    }   // switch (asV1.musical_pattern)

    if (pattern === null )
    {
        return null;
    }

    const startNote = fromABC(asV1.start_note_pitch.toUpperCase() + asV1.start_note_octave.toString());
    const endNote = fromABC(asV1.end_note_pitch.toUpperCase() + asV1.end_note_octave.toString());
    if ( (startNote === null) || (endNote === null) )
    {
        return null;
    }

    const bounds: ProgressionBound[] = [
        {
            type: "lowest",
            note: startNote,
        },
        {
            type: "lowest",
            note: endNote,
        },
        {
            type: "lowest",
            note: startNote,
        },
    ]

    return {
        musicalPattern: pattern,
        nbTimesPatternPlayed: asV1.pattern_repetition.length,
        reverseOnRepetition: true,
        progression: bounds,
        tempo: asV1.tempo,
    };
}


// Most recent type and conversion function
export type Exercise = ExerciseV2;
export function toExercise(value: unknown): Exercise | null
{
    return toExerciseV2(value);
}


// Deduce musical sequence from exercise
export function getMusicalSequence(exercise: Exercise): musicalSequence.MusicalSequence
{
    // Determine some information about the pattern
    const patternFirstNote = musicalSequence.getFirstNote(exercise.musicalPattern.sequence);
    const patternLowestNote = musicalSequence.getLowestNote(exercise.musicalPattern.sequence);
    const patternHighestNote = musicalSequence.getHighestNote(exercise.musicalPattern.sequence);

    // Handle special cases
    if ( (patternFirstNote === null)
        || (patternLowestNote === null)
        || (patternHighestNote === null)
        || (exercise.progression.length < 1) )
    {
        return [];
    }

    // Build full pattern (i.e. with repetitions + giving the first note at the start)
    const rest: musicalSequence.TimedNote = { note: null, duration: 1 };
    const firstNote: musicalSequence.TimedNote = { note: patternFirstNote, duration: 1 };
    let fullPattern = [rest, firstNote, rest, ...exercise.musicalPattern.sequence];
    for (let i = 1; i < exercise.nbTimesPatternPlayed; ++i)
    {
        let toAppend = [...exercise.musicalPattern.sequence];
        if (exercise.reverseOnRepetition)
        {
            // Reverse pattern every other time to get mirrored repetitions
            if (i % 2 == 1)
            {
                toAppend.reverse();
            }

            // Don't repeat last note from previous time it was played,
            // simply prolong it its duration isn't a full number of beats
            fullPattern[fullPattern.length - 1].duration += (toAppend[0].duration % 1);
            toAppend.shift();
        }
        fullPattern.push(...toAppend);
    }


    // Determine extremal values for shifting
    const extremalShifts = exercise.progression.map(bound => {
        switch (bound.type)
        {
        case "lowest":  return (bound.note - patternLowestNote);
        case "highest": return (bound.note - patternHighestNote);
        }   // switch (bound.type)
    });

    // Shift pattern to create full sequence
    let fullSequence = musicalSequence.getShiftedSequence(fullPattern, extremalShifts[0]!);
    for (let i = 1; i < extremalShifts.length; ++i)
    {
        const excludedStart = extremalShifts[i - 1]!;
        const includedEnd = extremalShifts[i]!;
        const step = ((includedEnd > excludedStart) ? 1 : -1);

        for (let shift = excludedStart + step;
            (step > 0) ? (shift <= includedEnd) : (shift >= includedEnd);
            shift += step)
        {
            fullSequence.push(...musicalSequence.getShiftedSequence(fullPattern, shift));
        }
    }

    return fullSequence;
}
