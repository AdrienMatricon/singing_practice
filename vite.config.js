import { defineConfig } from "vite";
import copyDirContent from "./vite-plugins/copyDirContent.js";

export default defineConfig({
    base: "./",
    plugins: [
        copyDirContent({
            src: "node_modules/@audio-samples/piano-velocity3/audio",
            dest: "piano",

            reorganize: relativePath =>
                relativePath.replaceAll("#", "sharp")
        })
    ]
});
