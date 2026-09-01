import { setTranslationKey, TranslationKey } from "../i18n/translate";
import * as jsextra from "../utils/jsextra";
import { View } from "./View";

export class OutputView extends View
{
    private fileUrl: string|null = null;
    private fileName: string|null = null;


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

        // Create buttons row
        this.container.append(this.createButtonsRow());

        // Create player if relevant
        if (this.fileUrl !== null)
        {
            this.container.append(this.createAudioPlayer());
        }

        this.refreshLanguage();
    }


    // Create the div element for the buttons
    private createButtonsRow(): HTMLDivElement
    {
        // Create element
        const div = document.createElement("div");

        // Add buttons
        div.append(this.createSaveButton());
        div.append(this.createGenerateButton());
        if ( (this.fileUrl !== null) && (this.fileName !== null) )
        {
            div.append(this.createDownloadLink());
        }

        // Return element
        return div
    }


    // Create a button element to save an exercise
    private createSaveButton(): HTMLButtonElement
    {
        // Create element
        const button = document.createElement("button");
        setTranslationKey(button, "output/save");

        // Publish event when clicked
        button.addEventListener("click", () => {
            this.dispatchEvent(new Event("save"));
        });

        // Return element
        return button;
    }


    // Create a button element to generate an audio file
    private createGenerateButton(): HTMLButtonElement
    {
        // Create element
        const button = document.createElement("button");
        setTranslationKey(button, "output/generate");

        // Publish event when clicked
        button.addEventListener("click", () => {
            this.reset();
            this.dispatchEvent(new Event("generate"));
        });

        // Return element
        return button;
    }


    // Create a link alement to download the audio file
    private createDownloadLink(): HTMLAnchorElement
    {
        jsextra.assert(this.fileUrl !== null);
        jsextra.assert(this.fileName !== null);

        // Create element
        const a = document.createElement("a");
        a.href = this.fileUrl;
        a.download = this.fileName;

        // Add button
        a.append(this.createDownloadButton());

        // Return element
        return a;
    }


    // Create a link element to download the audio file
    private createDownloadButton(): HTMLButtonElement
    {
        // Create element
        const button = document.createElement("button");
        setTranslationKey(button, "output/download");

        // Return element
        return button;
    }


    // Create an audio element to play the audio file
    private createAudioPlayer(): HTMLAudioElement
    {
        jsextra.assert(this.fileUrl !== null);

        // Create element
        const audio = document.createElement("audio");
        audio.controls = true;
        audio.loop = true;
        audio.src = this.fileUrl;

        // Return element
        return audio;
    }


    // Reset the view to its original state
    public reset(): void
    {
        this.fileUrl = null;
        this.fileName = null;
        this.render();
    }


    // Set the URL and name of the audio file so that it can be used in the view
    public setAudioFile(fileUrl: string, fileName: string): void
    {
        this.fileUrl = fileUrl;
        this.fileName = fileName;
        this.render();
    }
};
