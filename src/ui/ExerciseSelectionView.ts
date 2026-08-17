import { setTranslationKey, TranslationKey } from "../i18n/translate";
import { Exercise, ProgressionBound, ProgressionBoundType, isProgressionBound, progressionBoundTypes } from "../model/Exercise";
import { MusicalPattern, SelectableMusicalPatternKey, selectableMusicalPatterns, getSelectableMusicalPattern } from "../model/MusicalPattern";
import { Note, pianoHighestNote, pianoLowestNote, toABC, toDoReMi } from "../model/Note";
import * as jsextra from "../utils/jsextra";
import { View } from "./View";


const patternSelectionRowClass = "pattern-selection-row";
const repetitionsRowClass = "repetitions-row";
const progressionRowClass = "progression-row";
const tempoRowClass = "tempo-row";
const progressionSteps: Record<string, TranslationKey> = {
    "back": "exercise-selection/progression-step/back",
    "shift": "exercise-selection/progression-step/shift",
    "stop": "exercise-selection/progression-step/stop",
} as const;
type ProgressionStep = keyof typeof progressionSteps;

const backKey: ProgressionStep = "back";
const stopKey: ProgressionStep = "stop";

export class ExerciseSelectionView extends View
{
    constructor(container: HTMLElement)
    {
        super(container);

        // Render the widget
        this.render();
    }


    // Render or re-render the whole widget
    private render(): void
    {
        // Empty the container if relevant
        jsextra.removeAllChildren(this.container);

        // Add a row for the musical pattern
        this.container.append(this.createPatternSelectionRow());

        // Add a row for the repetitions
        this.container.append(this.createRepetitionsRow());

        // Add a big row for the progression
        this.container.append(this.createProgressionRow());

        // Add a row for the tempo
        this.container.append(this.createTempoRow());

        // Set a default exercise
        // (note: will also refresh language)
        this.setExercise({
            musicalPattern: getSelectableMusicalPattern("musical-pattern/pentachord-ascending"),
            nbTimesPatternPlayed: 2,
            reverseOnRepetition: true,
            progression: [
                { type: "lowest", note: 45 },
                { type: "lowest", note: 52 },
            ],
            tempo: 140,
        });
    }


    // Create the div element for the pattern-selection row
    private createPatternSelectionRow(): HTMLDivElement
    {
        const row = document.createElement("div");
        row.classList.add(patternSelectionRowClass);
        row.append(this.createPatternLabel());
        return row;
    }


    // Create the label element for the pattern selector
    private createPatternLabel(): HTMLLabelElement
    {
        const label = document.createElement("label");
        setTranslationKey(label, "exercise-selection/pattern-choice-label");
        label.append(this.createPatternSelect());
        return label;
    }


    // Create the select element for the pattern selector
    private createPatternSelect(): HTMLSelectElement
    {
        const select = document.createElement("select");
        for (const pattern of selectableMusicalPatterns)
        {
            select.append(this.createPatternOption(pattern));
        }
        return select;
    }


    // Create an option element for the pattern selector
    private createPatternOption(pattern: MusicalPattern): HTMLOptionElement
    {
        const option = document.createElement("option");
        option.value = pattern.translationKey;
        setTranslationKey(option, pattern.translationKey);
        return option;
    }


    // Create the div element for the repetitions row
    private createRepetitionsRow(): HTMLDivElement
    {
        const row = document.createElement("div");
        row.classList.add(repetitionsRowClass);
        row.append(this.createPlayedNumberLabel());
        row.append(this.createReverseOnRepetitionLabel());
        return row;
    }


    // Create the label element for the played number
    private createPlayedNumberLabel(): HTMLLabelElement
    {
        const label = document.createElement("label");
        setTranslationKey(label, "exercise-selection/played-number-label");
        label.append(this.createPlayedNumberField());
        return label;
    }


    // Create the input element for the played number
    private createPlayedNumberField(): HTMLInputElement
    {
        const field = document.createElement("input");
        field.type = "number";
        field.min = "1";
        field.step = "1";
        return field;
    }


    // Create the label element for the reverse-on-repetition checkbox
    private createReverseOnRepetitionLabel(): HTMLLabelElement
    {
        // Create label
        const label = document.createElement("label");
        setTranslationKey(label, "exercise-selection/reverse-on-repetition-label");
        const checkbox = this.createReverseOnRepetitionCheckbox();
        label.append(checkbox);
        const span = document.createElement("span");
        label.append(span);

        // Make the span's translation key match the checkbox state
        checkbox.addEventListener("change", () => {
            this.setRepetitionSpanTranslationKey(span, checkbox.checked);
            this.refreshLanguage();
        });
        this.setRepetitionSpanTranslationKey(span, checkbox.checked);

        // Return label
        return label
    }


    // Create the input element for the reverse-on-repetition checkbox
    private createReverseOnRepetitionCheckbox(): HTMLInputElement
    {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        return checkbox;
    }


    // Create the translatable span element for the reverse-on-repetition checkbox
    private setRepetitionSpanTranslationKey(span: HTMLSpanElement, shouldReverse: boolean): void
    {
        setTranslationKey(span, (shouldReverse ? "exercise/reverseOnRepetition/true" : "exercise/reverseOnRepetition/false"));
    }


    // Create the div element for the progression row
    private createProgressionRow(): HTMLDivElement
    {
        const row = document.createElement("div");
        row.classList.add(progressionRowClass);
        row.append(this.createProgressionLabel());
        return row;
    }


    // Create the label element for the progression list
    private createProgressionLabel(): HTMLLabelElement
    {
        const label = document.createElement("label");
        setTranslationKey(label, "exercise-selection/progression-label");
        label.append(this.createProgressionList());
        return label;
    }


    // Create the list element for the progression list
    private createProgressionList(): HTMLOListElement
    {
        const list = document.createElement("ol");
        this.renderProgressionList(list, []);
        return list;
    }


    // Render or re-render the whole progression list
    private renderProgressionList(list: HTMLOListElement, progression: ProgressionBound[])
    {
        // Empty progression list
        jsextra.removeAllChildren(list);

        // Special case when first created (should not happen when setting an exercise)
        if (progression.length == 0)
        {
            return;
        }

        // Recreate items
        for (const [i, bound] of progression.entries())
        {
            const isFirstBound = (i === 0);
            const step: ProgressionStep = ( ( !isFirstBound
                                              && (progression[i].note == progression[0].note)
                                              && (progression[i].type == progression[0].type))
                                            ? "back"
                                            : "shift" );
            list.append(this.createProgressionItem(isFirstBound, step, progression[i]));
        }

        // Add last item for stop step
        list.append(this.createProgressionItem(false, "stop", progression[progression.length - 1]));
    }


    // Create an item element for the progression list
    private createProgressionItem(isFirst: boolean, step: ProgressionStep, bound: ProgressionBound): HTMLLIElement
    {
        const item = document.createElement("li");
        setTranslationKey(item, isFirst ? "exercise-selection/progression-item/start": "exercise-selection/progression-item/then");
        if (!isFirst)
        {
            item.append(this.createProgressionStepSelect(step));
        }
        item.append(this.createProgressionBoundTypeSelect(bound.type));
        item.append(this.createProgressionBoundNoteSelect(bound.note));

        // Set relevant callbacks
        this.setProgressionItemCallbacks(item, isFirst);
        this.updateProgressionItemDisplay(item);
        return item;
    }


    // Create a select element for a progression step
    private createProgressionStepSelect(step: ProgressionStep): HTMLSelectElement
    {
        const select = document.createElement("select");
        for (const key in progressionSteps)
        {
            select.append(this.createProgressionStepOption(key));
        }
        select.value = step;
        return select;
    }


    // Create an option element for a progression step
    private createProgressionStepOption(step: ProgressionStep): HTMLOptionElement
    {
        const option = document.createElement("option");
        option.value = step;
        setTranslationKey(option, progressionSteps[step]);
        return option;
    }


    // Create a select element for a progression-bound type
    private createProgressionBoundTypeSelect(type: ProgressionBoundType): HTMLSelectElement
    {
        const select = document.createElement("select");
        for (const key in progressionBoundTypes)
        {
            select.append(this.createProgressionBoundTypeOption(key));
        }
        select.value = type;
        return select;
    }


    // Create an option element for a progression-bound type
    private createProgressionBoundTypeOption(type: ProgressionBoundType): HTMLOptionElement
    {
        const option = document.createElement("option");
        option.value = type;
        setTranslationKey(option, progressionBoundTypes[type]);
        return option;
    }


    // Create a select element for a progression-bound note
    private createProgressionBoundNoteSelect(note: Note): HTMLSelectElement
    {
        const select = document.createElement("select");
        for (let n = pianoLowestNote; n <= pianoHighestNote ; ++n)
        {
            select.append(this.createProgressionBoundNoteOption(n));
        }
        select.value = note.toString();
        return select;
    }


    // Create an option element for a progression-bound note
    private createProgressionBoundNoteOption(note: Note): HTMLOptionElement
    {
        const option = document.createElement("option");
        option.value = note.toString();
        option.append(toABC(note) + " / " + toDoReMi(note));
        return option;
    }


    // Set callbacks on a progression item
    private setProgressionItemCallbacks(item: HTMLLIElement, isFirst: boolean): void
    {
        // Update values of "back" steps when first bound is changed
        if (isFirst)
        {
            const firstSelects = Array.from(item.querySelectorAll("select"));
            jsextra.assert(firstSelects.length >= 2);

            for (const s of firstSelects)
            {
                s.addEventListener("change", () => {
                    const parent = item.parentElement;
                    jsextra.assert(parent !== null);

                    for (let [i, item] of parent.querySelectorAll("li").entries())
                    {
                        if (i === 0)
                        {
                            continue;
                        }

                        const selects = Array.from(item.querySelectorAll("select"));
                        jsextra.assert(selects.length >= 3);
                        if (selects[0].value == backKey)
                        {
                            selects[1].value = firstSelects[0].value;
                            selects[2].value = firstSelects[1].value;
                        }
                    }
                });
            }
        }


        // Handle step type being changed
        if (!isFirst)
        {
            const selects = Array.from(item.querySelectorAll("select"));
            jsextra.assert(selects.length >= 3);

            selects[0].addEventListener("change", () => {
                const parent = item.parentElement;
                jsextra.assert(parent !== null);
                const first = parent.firstElementChild;
                jsextra.assert(first !== null);
                const firstSelects = Array.from(first.querySelectorAll("select"));
                jsextra.assert(firstSelects.length >= 2);

                // If set to "stop", remove all following list items
                if (selects[0].value == stopKey)
                {
                    jsextra.removeAllFollowingSiblings(item);
                }

                // If set to "back", set values to the first item's
                else if (selects[0].value == backKey)
                {
                    selects[1].value = firstSelects[0].value;
                    selects[2].value = firstSelects[1].value;
                }

                // Show or hide selects based on stept type
                this.updateProgressionItemDisplay(item);

                // If the last item is no longer "stop", add a stop after it
                if ( !item.nextElementSibling && (selects[0].value !== "stop") )
                {
                    parent.append(this.createProgressionItem(false, "stop", { "type": selects[1].value, "note": Number(selects[2].value) }));
                    this.refreshLanguage();
                }
            });
        }
    }


    // Show or hide the select elements of a step based on its type
    private updateProgressionItemDisplay(item: HTMLLIElement): void
    {
        const selects = Array.from(item.querySelectorAll("select"));

        // Don't do anything for the first item (which only has 2 select elements)
        if (selects.length < 3)
        {
            return;
        }

        // Show or hide selects based on step type
        const shouldBeVisible = ( ( (selects[0].value == stopKey) || (selects[0].value == backKey) )
                                  ? "none"
                                  : "" );
        selects[1].style.display = shouldBeVisible;
        selects[2].style.display = shouldBeVisible;
    }


    // Create the div element for the tempo row
    private createTempoRow(): HTMLDivElement
    {
        const row = document.createElement("div");
        row.classList.add(tempoRowClass);
        row.append(this. createTempoLabel()); row;
        return row;
    }


    // Create the label element for the tempo field
    private createTempoLabel(): HTMLLabelElement
    {
        const label = document.createElement("label");
        setTranslationKey(label, "exercise-selection/tempo-label");
        label.append(this.createTempoField());
        return label;
    }


    // Create the input element for the tempo field
    private createTempoField(): HTMLInputElement
    {
        const field = document.createElement("input");
        field.type = "number";
        field.min = "1";
        field.step = "1";
        return field;
    }


    // Build an exercise from the selected parameters
    public getExercise(): Exercise
    {
        // Get fields
        const patternSelector = this.container.querySelector("." + patternSelectionRowClass + " select");
        const playedNumberField = this.container.querySelector("." + repetitionsRowClass + " label:nth-child(1) input");
        const reverseOnRepetitionCheckbox = this.container.querySelector("." + repetitionsRowClass + " label:nth-child(2) input");
        const progressionListItems = Array.from(this.container.querySelectorAll("." + progressionRowClass + " ol li"));
        const tempoField = this.container.querySelector("." + tempoRowClass + " input");

        // Enforce validity
        jsextra.assert(patternSelector instanceof HTMLSelectElement);
        jsextra.assert(patternSelector.value !== null);
        jsextra.assert(playedNumberField instanceof HTMLInputElement);
        jsextra.assert(playedNumberField.value !== null);
        jsextra.assert(reverseOnRepetitionCheckbox instanceof HTMLInputElement);
        jsextra.assert(reverseOnRepetitionCheckbox.value !== null);
        jsextra.assert(tempoField instanceof HTMLInputElement);
        jsextra.assert(tempoField.value !== null);

        // Extract progression (note: ignore last list item, which should be "stop")
        let progression : ProgressionBound[] = [];
        for (const [i, item] of progressionListItems.entries())
        {
            const selectFields = Array.from(item.querySelectorAll("select"));
            const isFirst = (i === 0);
            const nbExpectedFields = isFirst ? 2 : 3;

            jsextra.assert(selectFields.length == nbExpectedFields);

            for (const s of selectFields)
            {
                jsextra.assert(s.value !== null);
            }

            if (!isFirst && (selectFields[0].value == "stop"))
            {
                break;
            }

            const bound = ( isFirst
                            ? { type: selectFields[0].value, note: Number(selectFields[1].value)}
                            : { type: selectFields[1].value, note: Number(selectFields[2].value)});
            jsextra.assert(isProgressionBound(bound));

            progression.push(bound);
        }

        // Assert validity
        jsextra.assert(progression.length > 0);

        // Return exercise
        return {
            musicalPattern: getSelectableMusicalPattern(patternSelector.value as SelectableMusicalPatternKey),
            nbTimesPatternPlayed: Number(playedNumberField.value),
            reverseOnRepetition: reverseOnRepetitionCheckbox.checked,
            progression: progression,
            tempo: Number(tempoField.value),
        };
    }


    // Load an exercise into the selection
    public setExercise(exercise: Exercise): void
    {
        // Get fields
        const patternSelector = this.container.querySelector("." + patternSelectionRowClass + " select");
        const playedNumberField = this.container.querySelector("." + repetitionsRowClass + " label:nth-child(1) input");
        const reverseOnRepetitionCheckbox = this.container.querySelector("." + repetitionsRowClass + " label:nth-child(2) input");
        const progressionList = this.container.querySelector("." + progressionRowClass + " ol");
        const tempoField = this.container.querySelector("." + tempoRowClass + " input");

        // Enforce validity
        jsextra.assert(patternSelector instanceof HTMLSelectElement);
        jsextra.assert(playedNumberField instanceof HTMLInputElement);
        jsextra.assert(reverseOnRepetitionCheckbox instanceof HTMLInputElement);
        jsextra.assert(progressionList instanceof HTMLOListElement);
        jsextra.assert(tempoField instanceof HTMLInputElement);

        // Set fields
        patternSelector.value = exercise.musicalPattern.translationKey;
        playedNumberField.value = exercise.nbTimesPatternPlayed.toString();
        reverseOnRepetitionCheckbox.checked = exercise.reverseOnRepetition;
        reverseOnRepetitionCheckbox.dispatchEvent(new Event("change")); // To update the relevant text
        this.renderProgressionList(progressionList, exercise.progression);
        tempoField.value = exercise.tempo.toString();

        // Refresh language
        this.refreshLanguage();
    }
}
