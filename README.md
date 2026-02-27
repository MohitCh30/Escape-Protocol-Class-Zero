# 🎮 **Escape Protocol: Class Zero**

### A narrative-driven moral choice game built for Aicade.io's Internship Task

![Cover Image](assets/Cover%20image.webp)

## 🚀 **Play the Game**

https://play.aicade.io/rPhTtVYf1BTHhDjo

## 📖 **Project Background**

This game was originally created as part of the Aicade Game Developer Internship Task.

The assignment required us to:

Start with an AI-generated base game.

Manually rewrite at least 70% of the code.

Enhance both gameplay mechanics and visual presentation.

I didn't want to just submit to complete the task. My goal was to build a branching, choice-driven experience with:

Player morality systems.

Narrative choices leading to multiple endings.

Polished transitions, visuals, and audio.

## ✨ **Features & Enhancements**

70%+ of AI code rewritten (major refactor & new mechanics).

Morality system affecting story flow.

Three different endings based on player choices.

Scene transitions and smoother flow.

Audio integration for immersion.

## 🛠️ **Tech Stack**

- **Phaser 3.80.1** — Game framework for rendering, input, audio, and scene management
- **Aicade.io Platform** — Hosting, asset delivery, and config (`_CONFIG`) conventions
- **JavaScript ES6+** — All game logic in a single `game.js` file (no bundlers, no modules)

## 🎲 **Game Design**

The morality system is at the heart of Escape Protocol: Class Zero:

- **4 NPCs** (Prisha, Advik, Tanya, Chaps), each in a different sector of the locked-down academy
- **3 choices** per NPC: Rescue (✅ +1), Neutral (⚠ 0), or Sacrifice (❌ −1)
- **3 endings** based on total morality score:
  - **Hero's Path** — Score ≥ 3: All classmates saved
  - **Survivor's Burden** — Score −1 to 2: Mixed outcomes
  - **Outcast's Price** — Score ≤ −2: Pure self-preservation

## ⚙️ **How It Works**

- `config.js` defines `const _CONFIG` — an Aicade.io convention that feeds asset URLs (images, audio) to the game at runtime. External URLs must not be changed.
- `game.js` contains all scene logic in a single file: `IntroScene`, four `ChoiceScene` instances, `EndingRouter`, and three `EndingScene` instances.
- Morality state is managed via Phaser's built-in registry (`this.registry`), avoiding global variable pollution.

## 🛠️ **Struggles & Learning Journey**

This wasn't an easy ride:

Persistent black screen & scroll bugs blocked progress for hours.

Debugging at scale was harder than expected on Aicade's platform.

I almost gave up, even messaged the organizers about it. But instead of quitting, I iterated, rebuilt, and pushed through.

This repo represents that growth and persistence more than just the final game.

## 👤**Author's Note**

This project is not yet at the level I originally envisioned. I had hoped to build a far more immersive, interactive experience — with deeper mechanics, branching dialogue, and a more polished narrative.

That said, Escape Protocol: Class Zero reflects both my best effort within the constraints and my growth as a developer during the process. It represents persistence through setbacks and the determination to deliver something playable, even when I was close to giving up.

I see this not as a finished product, but as a starting point for future learning and improvement in game development.

## 📄 **License**

This project is licensed under the [MIT License](LICENSE).
