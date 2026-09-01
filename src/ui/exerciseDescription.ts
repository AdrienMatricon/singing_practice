import { setTranslationKey, updateLanguage } from "../i18n/translate";
import { Exercise, progressionBoundTypes } from "../model/Exercise";
import { toABC, toDoReMi } from "../model/Note";

// Create a translatable span element to hold the description of an exercise
export function getExerciseDescriptionSpan(exercise: Exercise): HTMLSpanElement
{
    // Create span associated with description text, with placeholders
    const element = document.createElement("span");
    setTranslationKey(element, "exercise/description");

    // Add a child element for each placeholder

    // Pattern name
    const patternName = document.createElement("span");
    setTranslationKey(patternName, exercise.musicalPattern.translationKey);
    element.append(patternName);

    // Tempo
    const tempo = document.createElement("span");
    tempo.append(exercise.tempo.toString());
    element.append(tempo);

    // Number of times to play the pattern
    const nbPlayed = document.createElement("span");
    nbPlayed.append(exercise.nbTimesPatternPlayed.toString());
    element.append(nbPlayed);

    // Whether repetitions are identical or reversed
    const repetitionType = document.createElement("span");
    setTranslationKey(repetitionType, (exercise.reverseOnRepetition ? "exercise/reverseOnRepetition/true" : "exercise/reverseOnRepetition/false"));
    element.append(repetitionType);

    // Line break
    element.append(document.createElement("br"));

    // Shift bounds, with placeholders
    const shiftBounds = document.createElement("span");
    for (const [i, progressionBound] of exercise.progression.entries())
    {
        if (i !== 0)
        {
            shiftBounds.append(" -> ");
        }
        shiftBounds.append(toABC(progressionBound.note) + "/" + toDoReMi(progressionBound.note) + " (");
        const boundTypeElement = document.createElement("span");
        setTranslationKey(boundTypeElement, progressionBoundTypes[progressionBound.type]);
        shiftBounds.append(boundTypeElement);
        shiftBounds.append(")");
    }
    element.append(shiftBounds);

    return element;
}


// Get a string describing an exercise in the current language
export function getExerciseDescription(exercise: Exercise): string
{
    // Create translatable span
    const span = getExerciseDescriptionSpan(exercise);

    // Get current translation
    updateLanguage(span);

    // Extract string
    return span.innerText;
}
