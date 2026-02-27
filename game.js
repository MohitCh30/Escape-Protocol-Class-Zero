function typewriterEffect(scene, textObject, fullText, speed = 40, onComplete) {
    let index = 0;
    let skipped = false;

    const skipHandler = () => {
        skipped = true;
        textObject.text = fullText;
        scene.input.off('pointerdown', skipHandler);
        if (onComplete) onComplete();
    };
    scene.input.on('pointerdown', skipHandler);

    const type = () => {
        if (skipped) return;
        if (index < fullText.length) {
            textObject.text += fullText[index++];
            scene.time.delayedCall(speed, type);
        } else {
            scene.input.off('pointerdown', skipHandler);
            if (onComplete) onComplete();
        }
    };
    type();
}

class IntroScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroScene' });
    }

    preload() {
        for (const key in _CONFIG.imageLoader) {
            this.load.image(key, _CONFIG.imageLoader[key]);
        }
        for (const key in _CONFIG.soundsLoader) {
            this.load.audio(key, [_CONFIG.soundsLoader[key]]);
        }
    }

    create() {
        this.registry.set('moralityScore', 0);
        this.registry.set('choices', []);

        this.children.removeAll();
        const bg = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background');
        bg.setDisplaySize(this.scale.width, this.scale.height);
        this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000, 0.3);

        const title1 = this.add.text(this.scale.width / 2, 180, "ESCAPE PROTOCOL:", {
            font: "bold 52px Arial", fill: "#ff0000", align: "center",
            stroke: "#000000", strokeThickness: 6
        }).setOrigin(0.5).setAlpha(0);

        const title2 = this.add.text(this.scale.width / 2, 240, "CLASS ZERO", {
            font: "bold 52px Arial", fill: "#ffffff", align: "center",
            stroke: "#000000", strokeThickness: 6
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({ targets: title1, alpha: 1, duration: 1000, ease: 'Power2' });
        this.tweens.add({ targets: title2, alpha: 1, duration: 1000, delay: 500, ease: 'Power2' });

        const subtitle = this.add.text(this.scale.width / 2, 320, "", {
            font: "26px Arial", fill: "#ffffff", align: "center",
            backgroundColor: "rgba(0,0,0,0.8)", padding: { x: 25, y: 20 }
        }).setOrigin(0.5);

        const subtitleText = "The AI lockdown has begun.\nYour classmates are trapped.\nEvery choice determines their fate.";
        this.time.delayedCall(1500, () => typewriterEffect(this, subtitle, subtitleText, 50));

        const beginBtn = this.add.text(this.scale.width / 2, 500, "► BEGIN PROTOCOL", {
            font: "bold 36px Arial", fill: "#00ff00", backgroundColor: "rgba(0,0,0,0.9)",
            padding: { x: 40, y: 20 }, stroke: "#00ff00", strokeThickness: 2
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.tweens.add({
            targets: beginBtn, scaleX: 1.1, scaleY: 1.1, duration: 1000,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        beginBtn.on('pointerover', () => beginBtn.setStyle({ fill: '#000000', backgroundColor: 'rgba(0,255,0,0.9)' }));
        beginBtn.on('pointerout', () => beginBtn.setStyle({ fill: '#00ff00', backgroundColor: 'rgba(0,0,0,0.9)' }));
        beginBtn.on('pointerdown', () => {
            try { this.sound.play('click'); } catch (e) { console.log('Audio blocked'); }
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.time.delayedCall(500, () => this.scene.start('PrishaScene'));
        });

        try {
            this.sound.stopAll();
            this.sound.add('background', { loop: true, volume: 0.3 }).play();
            this.sound.add('alarm', { loop: true, volume: 0.1 }).play();
        } catch (e) { console.log('Audio blocked by browser'); }

        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }
}

class ChoiceScene extends Phaser.Scene {
    constructor(key, npcKey, scenario, choices, sectorTint = 0xffffff) {
        super({ key });
        this.npcKey = npcKey;
        this.scenario = scenario;
        this.choices = choices;
        this.sectorTint = sectorTint;
    }

    create() {
        this.choiceMade = false;

        const bg = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background');
        bg.setDisplaySize(this.scale.width, this.scale.height);
        bg.setTint(this.sectorTint);
        this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000, 0.6);

        const npc = this.add.image(200, 400, this.npcKey);
        npc.setDisplaySize(200, 280);
        npc.setTint(0x444444);
        npc.setAlpha(0.9);

        const dangerCircle = this.add.circle(200, 400, 120, 0xff0000, 0.1);
        this.tweens.add({
            targets: dangerCircle, scaleX: 1.3, scaleY: 1.3, alpha: 0.4,
            duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        const emergencyLight = this.add.circle(200, 300, 80, 0xff4444, 0.2);
        this.tweens.add({
            targets: emergencyLight, alpha: 0.6, duration: 800, yoyo: true, repeat: -1
        });

        const scenarioBox = this.add.text(this.scale.width / 2, 150, "", {
            font: "28px Arial", fill: "#ffffff", align: "center", wordWrap: { width: 900 },
            backgroundColor: "rgba(0,0,0,0.95)", padding: { x: 30, y: 25 }, stroke: "#ffffff", strokeThickness: 1
        }).setOrigin(0.5);

        this.time.delayedCall(800, () => {
            typewriterEffect(this, scenarioBox, this.scenario, 30, () => {
                this.time.delayedCall(500, () => this.showChoices());
            });
        });

        const score = this.registry.get('moralityScore');
        this.add.text(1100, 50, `Morality: ${score}`, {
            font: "20px Arial", fill: score >= 0 ? "#00ff00" : "#ff0000",
            backgroundColor: "rgba(0,0,0,0.8)", padding: { x: 15, y: 10 }
        }).setOrigin(0.5);

        this.choiceButtons = [];
    }

    showChoices() {
        this.choices.forEach((choice, index) => {
            const yPos = 400 + (index * 85);
            
            const choiceBtn = this.add.text(this.scale.width / 2, yPos, choice.text, {
                font: "24px Arial", fill: choice.color, backgroundColor: "rgba(0,0,0,0.95)",
                padding: { x: 35, y: 18 }, stroke: choice.color, strokeThickness: 2
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setAlpha(0);

            this.tweens.add({
                targets: choiceBtn, alpha: 1, y: yPos - 10, duration: 600,
                delay: index * 200, ease: 'Back.easeOut'
            });

            choiceBtn.on('pointerover', () => {
                choiceBtn.setStyle({ fill: '#000000', backgroundColor: choice.color, fontSize: '26px' });
                this.tweens.add({ targets: choiceBtn, scaleX: 1.05, scaleY: 1.05, duration: 200 });
            });

            choiceBtn.on('pointerout', () => {
                choiceBtn.setStyle({ fill: choice.color, backgroundColor: 'rgba(0,0,0,0.95)', fontSize: '24px' });
                this.tweens.add({ targets: choiceBtn, scaleX: 1, scaleY: 1, duration: 200 });
            });

            choiceBtn.on('pointerdown', () => {
                if (this.choiceMade) return;
                this.choiceMade = true;
                this.choiceButtons.forEach(btn => btn.disableInteractive());

                try { this.sound.play('click'); } catch (e) { console.log('Audio blocked'); }

                let score = this.registry.get('moralityScore');
                this.registry.set('moralityScore', score + choice.value);
                const currentChoices = this.registry.get('choices') || [];
                this.registry.set('choices', [...currentChoices, { scene: this.scene.key, choice: choice.text, value: choice.value }]);

                const feedbackColor = choice.value > 0 ? 0x00ff00 : choice.value < 0 ? 0xff0000 : 0xffff00;
                this.cameras.main.flash(400, ...this.hexToRgb(feedbackColor), false);
                
                const feedback = this.add.text(this.scale.width / 2, 600, choice.feedback || "Choice made...", {
                    font: "22px Arial", fill: choice.color, backgroundColor: "rgba(0,0,0,0.9)",
                    padding: { x: 20, y: 10 }
                }).setOrigin(0.5);
                
                this.time.delayedCall(1500, () => {
                    this.cameras.main.fadeOut(500, 0, 0, 0);
                    this.time.delayedCall(500, () => this.scene.start(choice.nextScene));
                });
            });

            this.choiceButtons.push(choiceBtn);
        });
    }

    hexToRgb(hex) {
        return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
    }
}

class EndingScene extends Phaser.Scene {
    constructor(key, title, message, color) {
        super({ key });
        this.endingTitle = title;
        this.endingMessage = message;
        this.endingColor = color;
    }

    create() {
        const bg = this.add.image(this.scale.width / 2, this.scale.height / 2, 'background');
        bg.setDisplaySize(this.scale.width, this.scale.height);
        bg.setTint(this.endingColor);
        this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000, 0.75);

        const title = this.add.text(this.scale.width / 2, 150, this.endingTitle, {
            font: "bold 58px Arial", fill: "#ffffff", align: "center",
            stroke: "#000000", strokeThickness: 5
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: title, alpha: 1, scaleX: 1.2, scaleY: 1.2, duration: 1500, ease: 'Power2'
        });

        const score = this.registry.get('moralityScore');
        const scoreColor = score >= 3 ? "#00ff00" : score <= -2 ? "#ff0000" : "#ffff00";
        const scoreText = score >= 3 ? "HEROIC" : score <= -2 ? "RUTHLESS" : "NEUTRAL";

        this.add.text(this.scale.width / 2, 230, `Final Judgment: ${scoreText} (${score})`, {
            font: "32px Arial", fill: scoreColor, align: "center",
            stroke: "#000000", strokeThickness: 2
        }).setOrigin(0.5);

        const messageText = this.add.text(this.scale.width / 2, 380, "", {
            font: "26px Arial", fill: "#ffffff", align: "center", wordWrap: { width: 1000 },
            backgroundColor: "rgba(0,0,0,0.95)", padding: { x: 35, y: 30 },
            stroke: "#ffffff", strokeThickness: 1
        }).setOrigin(0.5);

        this.time.delayedCall(2000, () => {
            typewriterEffect(this, messageText, this.endingMessage, 40, () => {
                this.time.delayedCall(1000, () => this.showRecapAndRestart());
            });
        });

        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }

    showRecapAndRestart() {
        const choices = this.registry.get('choices') || [];
        if (choices.length > 0) {
            const recapLines = choices.map(c => {
                const emoji = c.value > 0 ? '✅' : c.value < 0 ? '❌' : '⚠';
                return `${emoji} ${c.scene.replace('Scene', '')}: ${c.choice}`;
            });
            this.add.text(this.scale.width / 2, 530, recapLines.join('\n'), {
                font: "18px Arial", fill: "#cccccc", align: "center",
                backgroundColor: "rgba(0,0,0,0.8)", padding: { x: 20, y: 12 }
            }).setOrigin(0.5);
        }

        this.time.delayedCall(1500, () => {
            const restartBtn = this.add.text(this.scale.width / 2, choices.length > 0 ? 650 : 600, "► RESTART PROTOCOL", {
                font: "bold 30px Arial", fill: "#00ff00", backgroundColor: "rgba(0,0,0,0.95)",
                padding: { x: 35, y: 18 }, stroke: "#00ff00", strokeThickness: 2
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setAlpha(0);

            this.tweens.add({
                targets: restartBtn, alpha: 1, scaleX: 1.1, scaleY: 1.1,
                duration: 800, ease: 'Back.easeOut'
            });

            this.tweens.add({
                targets: restartBtn, scaleX: 1.15, scaleY: 1.15, duration: 1000,
                yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });

            restartBtn.on('pointerover', () => restartBtn.setStyle({ fill: '#000000', backgroundColor: 'rgba(0,255,0,0.95)' }));
            restartBtn.on('pointerout', () => restartBtn.setStyle({ fill: '#00ff00', backgroundColor: 'rgba(0,0,0,0.95)' }));
            restartBtn.on('pointerdown', () => {
                try { this.sound.play('click'); } catch (e) { console.log('Audio blocked'); }
                this.registry.set('moralityScore', 0);
                this.registry.set('choices', []);
                this.cameras.main.fadeOut(800, 0, 0, 0);
                this.time.delayedCall(800, () => this.scene.start('IntroScene'));
            });
        });
    }
}

class EndingRouter extends Phaser.Scene {
    constructor() {
        super({ key: 'EndingRouter' });
    }

    create() {
        const score = this.registry.get('moralityScore');
        if (score >= 3) {
            this.scene.start('HeroEnding');
        } else if (score <= -2) {
            this.scene.start('OutcastEnding');
        } else {
            this.scene.start('NeutralEnding');
        }
    }
}

const scenes = [
    IntroScene,
    
    new ChoiceScene('PrishaScene', 'npcPrisha', 
        'SECTOR 7 - EMERGENCY LOCKDOWN ACTIVE\n\nPrisha cowers behind overturned desks, tears streaming down her face as security drones sweep the hallway with red scanning beams.\n\n"Please... I can\'t run anymore. My ankle is twisted and they\'ll find me if I move!"',
        [
            { 
                text: '✅ RESCUE - Pull her to safety through the maintenance vent', 
                value: 1, color: '#00ff00', nextScene: 'AdvikScene',
                feedback: 'Prisha grabs your hand with desperate gratitude as you guide her to safety.'
            },
            { 
                text: '⚠ ABANDON - Tell her to stay hidden until the sweep passes', 
                value: 0, color: '#ffff00', nextScene: 'AdvikScene',
                feedback: 'You leave her behind, uncertain if she\'ll survive the next patrol.'
            },
            { 
                text: '❌ SACRIFICE - Create noise to draw drones to her position', 
                value: -1, color: '#ff0000', nextScene: 'AdvikScene',
                feedback: 'Her terrified scream echoes as the drones converge on her location.'
            }
        ],
        0xff6666
    ),

    new ChoiceScene('AdvikScene', 'npcAdvik', 
        'SECTOR 5 - STRUCTURAL COLLAPSE DETECTED\n\nAdvik is pinned under collapsed ceiling panels, his leg bent at an unnatural angle. Emergency lights flicker as you hear mechanical footsteps approaching.\n\n"Help me! I can hear them in the next corridor - please don\'t leave me here to die!"',
        [
            { 
                text: '✅ RESCUE - Use emergency jack to lift the debris', 
                value: 1, color: '#00ff00', nextScene: 'TanyaScene',
                feedback: 'Together you escape as Advik leans on your shoulder, grateful to be alive.'
            },
            { 
                text: '⚠ DELAY - Promise to send help when you reach safety', 
                value: 0, color: '#ffff00', nextScene: 'TanyaScene',
                feedback: 'You rush away, hoping someone else will find him in time.'
            },
            { 
                text: '❌ EXPLOIT - Deliberately trigger collapse alarms near him', 
                value: -1, color: '#ff0000', nextScene: 'TanyaScene',
                feedback: 'The security response teams rush toward the distraction you created.'
            }
        ],
        0x6666ff
    ),

    new ChoiceScene('TanyaScene', 'npcTanya', 
        'SECTOR 3 - EMERGENCY OVERRIDE IN PROGRESS\n\nTanya frantically works at a damaged control terminal, sparks flying as she bypasses security protocols. Her fingers fly across the interface.\n\n"Thirty seconds! I can override the lockdown for everyone, but I need you to cover the entrance!"',
        [
            { 
                text: '✅ PROTECT - Guard the doorway while she completes the hack', 
                value: 1, color: '#00ff00', nextScene: 'ChapsScene',
                feedback: 'The emergency doors unlock with a satisfying beep - escape routes are now open.'
            },
            { 
                text: '⚠ OBSERVE - Wait nearby but don\'t actively help', 
                value: 0, color: '#ffff00', nextScene: 'ChapsScene',
                feedback: 'She completes the hack alone while you remain safely distant.'
            },
            { 
                text: '❌ BETRAY - Alert security to her location for a distraction', 
                value: -1, color: '#ff0000', nextScene: 'ChapsScene',
                feedback: 'Armed drones storm the room as you slip away in the chaos.'
            }
        ],
        0x66ff66
    ),

    new ChoiceScene('ChapsScene', 'npcChaps', 
        'SECTOR 1 - MEDICAL EMERGENCY DETECTED\n\nChaps sits in the corner clutching a bloody arm, eyes wide with shock and terror. The aftermath of violence is evident around him.\n\n"They just... left me here when the shooting started. Everyone ran past like I was already dead. Please... don\'t abandon me too..."',
        [
            { 
                text: '✅ EVACUATE - Help him reach the emergency medical station', 
                value: 1, color: '#00ff00', nextScene: 'EndingRouter',
                feedback: 'You guide him to safety, his wound bandaged and spirits lifted.'
            },
            { 
                text: '⚠ COMFORT - Give him hope but continue your own escape', 
                value: 0, color: '#ffff00', nextScene: 'EndingRouter',
                feedback: 'You offer words of encouragement before leaving him to fend for himself.'
            },
            { 
                text: '❌ BAIT - Use his desperate calls to lure enemies away', 
                value: -1, color: '#ff0000', nextScene: 'EndingRouter',
                feedback: 'His cries for help mask your escape as hostiles investigate the sound.'
            }
        ],
        0xff8844
    ),

    EndingRouter,
    
    new EndingScene('HeroEnding', 'THE HERO\'S PATH', 
        'MISSION OUTCOME: HEROIC INTERVENTION\n\nYou chose compassion over self-preservation at every turn. Four lives hang in the balance, and four lives were saved through your courage and sacrifice. When the emergency protocols finally lifted, survivor testimonies spoke of a guardian angel who chose to be their light in the darkness. The academy may bear scars, but hope was reborn in the hearts you protected. Your legacy will inspire others to choose heroism when darkness falls.', 
        0x004400),
        
    new EndingScene('NeutralEnding', 'THE SURVIVOR\'S BURDEN', 
        'MISSION OUTCOME: PRAGMATIC SURVIVAL\n\nYou walked the razor\'s edge between heroism and survival, saving some while leaving others to their fate. The weight of those choices will follow you long after the emergency lights stop flashing. In the aftermath, you carry both the gratitude of those you saved and the haunting memory of those you didn\'t. You learned that in crisis, neutrality comes with its own heavy price - the knowledge that you could have done more.', 
        0x444400),
        
    new EndingScene('OutcastEnding', 'THE OUTCAST\'S PRICE', 
        'MISSION OUTCOME: RUTHLESS SELF-PRESERVATION\n\nYou chose yourself above all others, using your classmates as shields, distractions, and expendable resources. You survived the protocol, but at a cost that will echo through the empty corridors of your conscience. When the dust settled, you stood alone among the consequences of your choices. In saving yourself at any cost, you discovered that some victories hollow out the soul. The academy may be behind you, but your reflection will forever show the price of absolute selfishness.', 
        0x440000)
];

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    scene: scenes,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

window.addEventListener('DOMContentLoaded', () => {
    if (typeof _CONFIG === 'undefined') {
        console.error("Aicade _CONFIG not found. Is config.js loaded?");
        return;
    }
    config.parent = 'game-container';
    new Phaser.Game(config);
});
