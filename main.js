// A game NPC voiced live by klattsch.
//
// With a bundler you would `npm install klattsch` and import from 'klattsch'
// instead; same API.

import { compileString } from 'https://esm.sh/klattsch@0.7.0';

// esm.sh bundles the worklet's internal imports into one module
const WORKLET_URL = 'https://esm.sh/klattsch@0.7.0/formant-worklet.js';

// The innkeeper's voice: base pitch 105 Hz, 190 ms per phoneme, a little
// breath. Every line gets this prefix.
const VOICE = 'b105 r190 h0.08';

const LINES = [
  'HH AH L OW . T R AE V AH L ER',                       // hello, traveler
  'W EH L K AH M . T UW . DH IY . IH N',                 // welcome to the inn
  'W IY . HH AE V . W AH N . R UW M . IH T S . HH AO N T IH D', // we have one room, it's haunted
  'N OW . R IY F AH N D Z+30',                           // no refunds (rising suspicion)
  'bG2 G UH D . bC3 N AY T . r400 bE3 T R AE V AH L ER', // sung goodnight
];

let ctx, node;
async function ensureAudio() {
  if (ctx) return;
  ctx = new AudioContext();
  await ctx.audioWorklet.addModule(WORKLET_URL);
  node = new AudioWorkletNode(ctx, 'formant-processor');
  node.connect(ctx.destination);
}

const npc = document.getElementById('npc');
const mouth = document.getElementById('mouth');
const bubble = document.getElementById('bubble');
const bubbleText = document.getElementById('bubble-text');
const hint = document.getElementById('hint');

let speakingUntil = 0;
async function say(phonemeString) {
  await ensureAudio();
  await ctx.resume();                       // browsers suspend until a gesture

  const { schedule, totalMs, warnings } = compileString(phonemeString);
  if (warnings.length) console.warn('klattsch:', warnings.join(', '));

  node.port.postMessage({ type: 'reset' }); // cut off any previous line
  node.port.postMessage({ type: 'schedule', schedule });

  bubbleText.textContent = phonemeString;
  bubble.hidden = false;
  hint.hidden = true;
  speakingUntil = performance.now() + totalMs;
  animateMouth();
}

// Cosmetic: flap the mouth while the line plays.
let mouthRaf = 0;
function animateMouth() {
  cancelAnimationFrame(mouthRaf);
  const tick = () => {
    if (performance.now() >= speakingUntil) {
      mouth.style.height = '';
      bubble.hidden = true;
      return;
    }
    mouth.style.height = `${4 + Math.random() * 14}px`;
    mouthRaf = requestAnimationFrame(tick);
  };
  tick();
}

let nextLine = 0;
npc.addEventListener('click', () => {
  say(`${VOICE} ${LINES[nextLine++ % LINES.length]}`);
});

document.getElementById('custom').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = document.getElementById('phonemes').value.trim();
  if (text) say(`${VOICE} ${text}`);
});
