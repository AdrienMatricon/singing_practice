import audioBufferToWav from "../lib/wav.js";

// Play the sounds that we want to play
function playSounds(whatToPlay, tempo)
{
    // Determine the length of a beat
    const beat = 60. / tempo;

    // Create a synth and connect it to the main output
    const synth = new Tone.PolySynth().toDestination();

    // Play notes
    let t = 0;
    for (const notes of whatToPlay)
    {
        if (notes.length > 0)
        {
            synth.triggerAttackRelease(notes.map(note => Tone.Frequency(note, "midi")), 1. * beat, t);
        }
        t += 1. * beat;
    }
}


async function getAudioBuffer(whatToPlay, tempo)
{
    const duration = whatToPlay.length * 60 / tempo;
    const audioBuffer = await Tone.Offline(async () => {
        playSounds(whatToPlay, tempo);
    }, duration);
    return audioBuffer;
}


export default async function generateWav(whatToPlay, tempo)
{
    const audioBuffer = await getAudioBuffer(whatToPlay, tempo);
    const blob = audioBufferToWav(audioBuffer);
    return blob;
}
