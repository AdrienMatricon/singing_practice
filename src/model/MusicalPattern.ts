import { TranslationKey } from "../i18n/translate";
import * as jsextra from "../utils/jsextra";
import { MusicalSequence, isMusicalSequence } from "./MusicalSequence";

export type MusicalPattern = {
    translationKey: TranslationKey,
    sequence: MusicalSequence,  // Only intervals matter, not actual notes, since the pattern will be shifted around
};


// MusicalPattern type checker
export function isMusicalPattern(value: unknown): value is MusicalPattern
{
    if (!jsextra.isNonNullObject(value))
    {
        return false;
    }

    const obj = value as Record<string, unknown>;

    return ( jsextra.isString(obj.translationKey)
             && isMusicalSequence(obj.sequence) );
}


// All musical patterns that can be selected by the user
export const selectableMusicalPatterns: MusicalPattern[] = [
    {
        translationKey: "musical-pattern/pentachord-ascending",
        sequence: [
            { note: 0,    duration: 1},
            { note: 2,    duration: 1},
            { note: 4,    duration: 1},
            { note: 5,    duration: 1},
            { note: 7,    duration: 1},
        ]
    },
    {
        translationKey: "musical-pattern/pentachord-descending",
        sequence: [
            { note: 7,    duration: 1},
            { note: 5,    duration: 1},
            { note: 4,    duration: 1},
            { note: 2,    duration: 1},
            { note: 0,    duration: 1},
        ]
    },
    {
        translationKey: "musical-pattern/major-third-ascending",
        sequence: [
            { note: 0,    duration: 1},
            { note: 4,    duration: 1},
        ]
    },
    {
        translationKey: "musical-pattern/major-third-descending",
        sequence: [
            { note: 4,   duration: 1},
            { note: 0,    duration: 1},
        ]
    },
    {
        translationKey: "musical-pattern/minor-third-ascending",
        sequence: [
            { note: 0,    duration: 1},
            { note: 3,    duration: 1},
        ]
    },
    {
        translationKey: "musical-pattern/minor-third-descending",
        sequence: [
            { note: 3,   duration: 1},
            { note: 0,    duration: 1},
        ]
    },
    {
        translationKey: "musical-pattern/major-arpeggio-ascending",
        sequence: [
            { note: 0,    duration: 1},
            { note: 4,    duration: 1},
            { note: 7,    duration: 1},
            { note: 12,   duration: 1},
        ]
    },
    {
        translationKey: "musical-pattern/major-arpeggio-descending",
        sequence: [
            { note: 12,   duration: 1},
            { note: 7,    duration: 1},
            { note: 4,    duration: 1},
            { note: 0,    duration: 1},
        ]
    },
    {
        translationKey: "musical-pattern/minor-arpeggio-ascending",
        sequence: [
            { note: 0,    duration: 1},
            { note: 3,    duration: 1},
            { note: 7,    duration: 1},
            { note: 12,   duration: 1},
        ]
    },
    {
        translationKey: "musical-pattern/minor-arpeggio-descending",
        sequence: [
            { note: 12,   duration: 1},
            { note: 7,    duration: 1},
            { note: 3,    duration: 1},
            { note: 0,    duration: 1},
        ]
    },
    {
        translationKey: "musical-pattern/major-scale-ascending",
        sequence: [
            { note: 0,    duration: 1},
            { note: 2,    duration: 1},
            { note: 4,    duration: 1},
            { note: 5,    duration: 1},
            { note: 7,    duration: 1},
            { note: 9,    duration: 1},
            { note: 11,   duration: 1},
            { note: 12,   duration: 1},
        ]
    },
    {
        translationKey: "musical-pattern/major-scale-descending",
        sequence: [
            { note: 12,   duration: 1},
            { note: 11,   duration: 1},
            { note: 9,    duration: 1},
            { note: 7,    duration: 1},
            { note: 5,    duration: 1},
            { note: 4,    duration: 1},
            { note: 2,    duration: 1},
            { note: 0,    duration: 1},
        ]
    },
    {
        translationKey: "musical-pattern/minor-scale-ascending",
        sequence: [
            { note: 0,    duration: 1},
            { note: 2,    duration: 1},
            { note: 3,    duration: 1},
            { note: 5,    duration: 1},
            { note: 7,    duration: 1},
            { note: 8,    duration: 1},
            { note: 10,   duration: 1},
            { note: 12,   duration: 1},
        ]
    },
    {
        translationKey: "musical-pattern/minor-scale-descending",
        sequence: [
            { note: 12,   duration: 1},
            { note: 10,   duration: 1},
            { note: 8,    duration: 1},
            { note: 7,    duration: 1},
            { note: 5,    duration: 1},
            { note: 3,    duration: 1},
            { note: 2,    duration: 1},
            { note: 0,    duration: 1},
        ]
    },
] as const;


export type SelectableMusicalPatternKey = typeof selectableMusicalPatterns[number]["translationKey"];


// Get a selectable musical pattern from its key
export function getSelectableMusicalPattern(key: SelectableMusicalPatternKey): MusicalPattern
{
    return selectableMusicalPatterns.find(element => element.translationKey === key)!;
}
