import * as storage from "../utils/safeLocalStorage";
import { Exercise, toExercise } from "./Exercise";

const storageKey = "singing-practice.history";
const oldStorageKey = "history";

export class ExerciseHistory extends EventTarget
{
    private history: Exercise[] = [];


    constructor()
    {
        super();

        // Move old history if necessary
        const oldSerialized = storage.get(oldStorageKey);
        if (oldSerialized)
        {
            storage.set(storageKey, oldSerialized);
            storage.remove(oldStorageKey);
        }

        const serialized = storage.get(storageKey);
        if (!serialized)
        {
            console.log("No history to load");
            return;
        }

        const parsed = JSON.parse(serialized);
        if (!Array.isArray(parsed))
        {
            console.error("Cannot load history (not an array):", parsed);
            return;
        }

        const converted = parsed.map(x => toExercise(x));
        if (!converted.every(x => (x !== null)))
        {
            console.error("Cannot load history (invalid exercises): ", parsed);
            return;
        }

        this.history = converted;
    }


    // Create a new entry in the history
    public push(newExercise: Exercise): void
    {
        // Remove exercise if it already was in the history
        this.history = this.history.filter(e => (JSON.stringify(e) !== JSON.stringify(newExercise)));

        // Push new exercise
        this.history.push(newExercise);

        // Enforce maximum history length
        while (this.history.length > 20)
        {
            this.history.shift();
        }

        // Save new history
        storage.set(storageKey, JSON.stringify(this.history))

        // Dispatch event
        this.dispatchEvent(new CustomEvent<Exercise[]>("change", {
            detail: [...this.history],
        }));
    }


    // Get all entries
    public get(): Exercise[]
    {
        return [...this.history];
    }
};
