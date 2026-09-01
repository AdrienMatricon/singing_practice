import { setTranslationKey } from "../i18n/translate";
import { Exercise } from "../model/Exercise";
import * as jsextra from "../utils/jsextra";
import { getExerciseDescriptionSpan } from "./exerciseDescription";
import { View } from "./View";

export class ExerciseHistoryView extends View
{
    private history: Exercise[] = [];


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
        setTranslationKey(heading, (this.history.length === 0) ? "history/no" : "history/yes");
        this.container.append(heading);

        // Create list
        const list = document.createElement("ul");
        this.container.append(list);

        // Create an item per history entry, in reverse order
        for (const exercise of [...this.history].reverse())
        {
            // Create actual item
            const item = document.createElement("li");
            list.append(item);

            // Add exercise description
            item.append(getExerciseDescriptionSpan(exercise));

            // Publish event when clicked
            item.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent<Exercise>("click", {
                    detail: exercise,
                }));
            });
        }

        this.refreshLanguage();
    }


    // Set history displayed by the view
    public set(history: Exercise[]): void
    {
        this.history = history;
        this.render();
    }
};
