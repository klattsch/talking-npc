# talking npc

A web game character voiced live in the browser by
[klattsch](https://github.com/tgies/klattsch), a primitive parallel-formant
speech synthesizer.

**[Play it here.](https://klattsch.github.io/talking-npc/)**

Three static files, served as-is. There are no audio files; every line is
synthesized in an AudioWorklet when you click. The whole integration is in
[main.js](main.js) and is about ten lines:

```js
import { compileString } from 'https://esm.sh/klattsch@0.7.0';

const ctx = new AudioContext();
await ctx.audioWorklet.addModule('https://esm.sh/klattsch@0.7.0/formant-worklet.js');
const node = new AudioWorkletNode(ctx, 'formant-processor');
node.connect(ctx.destination);

const { schedule } = compileString('b105 r190 HH AH L OW . T R AE V AH L ER');
node.port.postMessage({ type: 'schedule', schedule });
```

In a bundled project (Phaser, PixiJS, anything with Vite/webpack), `npm install
klattsch` and import from `'klattsch'` instead; the API is the same. See the
[klattsch README](https://github.com/tgies/klattsch) for that, polyphony, and
the full directive syntax.

If your game is not a web game, you want baked WAVs instead:
[klattsch/dialog-bake](https://github.com/klattsch/dialog-bake) (any engine) or
[klattsch/godot](https://github.com/klattsch/godot) (Godot addon).

## Run locally

Any static file server:

```bash
python3 -m http.server 8000
```

(Not `file://`; module scripts and worklets need HTTP.)

## License

MIT. If klattsch ends up in your game, a credit is appreciated:

> Speech synthesis by klattsch (https://klatts.ch)
