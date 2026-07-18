import { defineConfig } from "vite";
import copy from "rollup-plugin-copy";

export default defineConfig({
    base: "./",
    plugins: [
        copy({
            targets: [
                {
                    src: "node_modules/@audio-samples/piano-velocity3/audio/*.ogg",
                    dest: "dist/piano",
                    rename: (name, extension) =>
                        `${name.replace("#", "sharp")}.${extension}`
                }
            ],
            hook: "writeBundle"
        })
    ]
});
