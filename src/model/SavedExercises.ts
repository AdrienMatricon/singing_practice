import * as jsextra from "../utils/jsextra";
import * as storage from "../utils/safeLocalStorage";
import { Exercise, toExercise } from "./Exercise";

export type SavedExerciseEntry = {
    id: string,
    name: string|null,
    exercise: Exercise,
};


const storageKey = "singing-practice.saved";
const oldStorageKey = "saved";


export class SavedExercises extends EventTarget
{
    private saved: SavedExerciseEntry[] = [];


    constructor()
    {
        super();

        // Move old saved exercises if necessary
        const oldSerialized = storage.get(oldStorageKey);
        if (oldSerialized)
        {
            storage.set(storageKey, oldSerialized);
            storage.remove(oldStorageKey);
        }

        const serialized = storage.get(storageKey);
        if (!serialized)
        {
            console.log("No saved exercises to load");
            return;
        }

        const parsed = JSON.parse(serialized);
        if (!Array.isArray(parsed))
        {
            console.error("Cannot load history (not an array):", parsed);
            return;
        }

        const converted = parsed.map(x => ({
            "id": (jsextra.isString(x.id) ? x.id : crypto.randomUUID()),
            "name": ((jsextra.isString(x.name) && x.name !== "") ? x.name : null),
            "exercise": toExercise(x.exercise),
        }));

        if (!converted.every(x => (x.exercise !== null)))
        {
            console.error("Cannot load saved exercises (invalid exercises): ", parsed);
            return;
        }

        this.saved = converted as SavedExerciseEntry[];
    }


    // Create a new entry for the saved exercises
    public push(exercise: Exercise, name: string|null = null): void
    {
        // Push new exercise
        this.saved.push({
            "id": crypto.randomUUID(),
            "name": name,
            "exercise": exercise,
        });

        // Save new history
        storage.set(storageKey, JSON.stringify(this.saved))

        // Dispatch event
        this.dispatchEvent(new CustomEvent<SavedExerciseEntry[]>("change", {
            detail: [...this.saved],
        }));
    }


    // Get all entries
    public getAll(): SavedExerciseEntry[]
    {
        return [...this.saved];
    }


    // Update entry (identified by ID) if it exists
    public update(entry: SavedExerciseEntry): void
    {
        const updated = this.saved.find(s => (s.id === entry.id));
        if (updated != null)
        {
            updated.name = entry.name;
            updated.exercise = entry.exercise;
        }
    }


    // Remove entry (identified by ID) if it exists
    public remove(entry: SavedExerciseEntry): void
    {
        this.saved = this.saved.filter(s => (s.id !== entry.id));
    }
};
