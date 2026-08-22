import { setTranslationKey, updateLanguage } from "../i18n/translate";
import { Exercise } from "../model/Exercise";
import { SavedExerciseEntry } from "../model/SavedExercises";
import * as jsextra from "../utils/jsextra";
import { getExerciseDescriptionSpan } from "./exerciseDescription";
import { View } from "./View";

export class SavedExercisesView extends View
{
    private saved: SavedExerciseEntry[] = [];


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

        // Create list heading
        const heading = document.createElement("span");
        setTranslationKey(heading, (this.saved.length === 0) ? "saved-exercises/no" : "saved-exercises/yes");
        this.container.append(heading);

        // Create list
        const list = document.createElement("ul");
        this.container.append(list);

        // Create an item per history entry, in reverse order
        for (const entry of [...this.saved].reverse())
        {
            // Create actual item
            const item = document.createElement("li");
            item.append(this.createExerciseDiv(entry));
            item.append(this.createRenameButton(entry));
            item.append(this.createRemoveButton(entry));
            list.append(item);
        }

        this.refreshLanguage();
    }


    // Create a div element for a saved exercise
    private createExerciseDiv(entry: SavedExerciseEntry): HTMLDivElement
    {
        // Create element
        const div = document.createElement("div");

        // Append sub-div for chosen name (if any)
        if (entry.name !== null)
        {
            const chosenName = document.createElement("div");
            chosenName.innerText = entry.name;
            div.appendChild(chosenName);
        }

        // Append sub-div for exercise description
        const description = document.createElement("div");
        description.appendChild(getExerciseDescriptionSpan(entry.exercise));
        div.appendChild(description);

        // Publish event when clicked
        div.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent<Exercise>("click", {
                detail: entry.exercise,
            }));
        });

        // Return element
        return div;
    }


    // Create a rename button for a saved exercise
    private createRenameButton(entry: SavedExerciseEntry): HTMLButtonElement
    {
        // Create element
        let button = document.createElement("button");
        button.innerText = "✏️";

        // Publish event when clicked
        button.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent<SavedExerciseEntry>("rename", {
                detail: entry,
            }));
        });

        // Return element
        return button;
    }


    // Create a remove button for a saved exercise
    private createRemoveButton(entry: SavedExerciseEntry): HTMLButtonElement
    {
        // Create element
        let button = document.createElement("button");
        button.innerText = "🗑️";

        // Publish event when clicked
        button.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent<SavedExerciseEntry>("remove", {
                detail: entry,
            }));
        });

        // Return element
        return button;
    }


    // Set saved exercises displayed by the view
    public set(saved: SavedExerciseEntry[]): void
    {
        this.saved = saved;
        this.render();
    }
};
