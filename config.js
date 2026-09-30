const _CONFIG = {
  "title": "Escape Protocol: Class Zero",
  "description": "<p>A narrative survival game under AI lockdown. Choose between saving, ignoring, or sacrificing classmates. Every decision shapes your morality and the final outcome.</p>",
  "instructions": "Click one of the choices in each scene. No movement required. Your moral decisions affect the dramatic ending you receive.",
  "deviceOrientation": "landscape",
  // Served from this repo (byte-identical copies of the original Aicade uploads).
  "imageLoader": {
    "background": "assets/Background.webp",
    "npcPrisha": "assets/npcPrisha.png",
    "npcAdvik": "assets/npcAdvik.png",
    "npcTanya": "assets/npcTanya.png",
    "npcChaps": "assets/npcChaps.png"
  },
  // Aicade's shared audio library, still hosted on Aicade's S3. The game plays
  // on silently if any of these disappear. The original alarm track
  // (GameAssets/sfx/alarm_2.mp3) has already been removed from the bucket; add
  // an "alarm" entry here to bring it back.
  "soundsLoader": {
    "click": "https://aicade-ui-assets.s3.amazonaws.com/GameAssets/sfx/upgrade_1.mp3",
    "music": "https://aicade-user-store.s3.amazonaws.com/GameAssets/music/Background_b2190e5e-f385-40a3-8ecf-12ea8408a1fd.mp3?t=1748190123976"
  },
  "libLoader": {},
  "deviceOrientationSizes": {
    "landscape": {
      "height": 720,
      "width": 1280
    },
    "portrait": {
      "height": 1280,
      "width": 720
    }
  },
  "phaserUrl": "lib/phaser-3.80.1.min.js",
  "phaserVersion": "3.80.1"
};
