import { Scene } from 'phaser';
import { discordSdk } from '../utils/discordSdk.js';
import { subscribeToPlayerUpdates } from '../player-manager.js';
import { gameStates, setCurrentGameState } from '../game-logic.js';

export class Game extends Scene {
    constructor() {
        super('Game');
        this.gameConfig = null;
        this.gameState = null;
        this.participants = [];
    }

    async create() {
        // Get the selected variation from the main menu
        const selectedVariation = this.game.selectedVariation || 'variation1';
        
        // Load the appropriate game configuration
        this.gameConfig = this.getGameVariationConfig(selectedVariation);
        
        // Wait a moment for Discord SDK to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get Discord participants
        await this.getDiscordParticipants();
        
        // Initialize game state
        this.gameState = this.initializeGameState();
        
        // Show current participants regardless of count
        console.log(`Current participants: ${this.participants.length}`);
        
        // For now, allow game to start with any number of participants
        // TODO: Re-enable 3-player minimum for production
        // if (this.participants.length < 3) {
        //     console.log(`Not enough players: ${this.participants.length}/3 required`);
        //     this.showNotEnoughPlayers();
        //     return;
        // }
        
        // Setup the game based on variation
        this.setupGame();
        
        // Start the game loop
        this.startGameLoop();
        
        // Subscribe to player updates
        this.subscribeToPlayerUpdates();
        
        // Force initial UI update after everything is set up
        this.updateUI();
    }

    getGameVariationConfig(variationId) {
        const configs = {
            variation1: {
                name: "Variation 1",
                playerSpeed: 200,
                gameDuration: 300, // 5 minutes
                maxPlayers: 10,
                imposterCount: 1,
                tasksRequired: 5,
                visualStyle: "classic",
                specialRules: []
            },
            variation2: {
                name: "Variation 2",
                playerSpeed: 300,
                gameDuration: 120, // 2 minutes
                maxPlayers: 8,
                imposterCount: 2,
                tasksRequired: 3,
                visualStyle: "fast",
                specialRules: ["speedBoost", "quickTasks"]
            },
            variation3: {
                name: "Variation 3",
                playerSpeed: 150,
                gameDuration: 600, // 10 minutes
                maxPlayers: 12,
                imposterCount: 1,
                tasksRequired: 8,
                visualStyle: "stealth",
                specialRules: ["stealthKills", "limitedVision"]
            },
            variation4: {
                name: "Variation 4",
                playerSpeed: 250,
                gameDuration: 480, // 8 minutes
                maxPlayers: 16,
                imposterCount: 3,
                tasksRequired: 6,
                visualStyle: "team",
                specialRules: ["teamObjectives", "sharedTasks"]
            }
        };

        return configs[variationId] || configs.variation1;
    }

    async getDiscordParticipants() {
        try {
            if (discordSdk && discordSdk.commands) {
                console.log('Attempting to get Discord participants...');
                const result = await discordSdk.commands.getInstanceConnectedParticipants();
                console.log('Raw result from getInstanceConnectedParticipants:', result);
                this.participants = result.participants || [];
                console.log('Discord participants loaded:', this.participants);
                console.log('Participant count:', this.participants.length);
            } else {
                throw new Error('Discord SDK not available');
            }
        } catch (error) {
            console.error('Failed to get Discord participants:', error);
            // No fallback - only show real participants
            this.participants = [];
            console.log('No participants available');
        }
    }

    initializeGameState() {
        return {
            players: [],
            imposters: [],
            gameTime: 0,
            isGameActive: true,
            currentPhase: 'preparation', // preparation, playing, voting, gameOver
            selectedVariation: this.game.selectedVariation
        };
    }

    setupGame() {
        // Create background
        this.createBackground();
        
        // Create UI elements
        this.createUI();
        
        // Setup game mechanics based on variation
        this.setupVariationMechanics();
        
        // Initialize players
        this.initializePlayers();
    }

    createBackground() {
        // Create background based on visual style
        const bg = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "background"
        );
        
        let scaleX = this.cameras.main.width / bg.width + 0.2;
        let scaleY = this.cameras.main.height / bg.height + 0.2;
        let scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);

        // Apply visual style effects
        this.applyVisualStyle();
    }

    applyVisualStyle() {
        switch(this.gameConfig.visualStyle) {
            case 'fast':
                // Add speed lines or motion blur effect
                this.addSpeedEffects();
                break;
            case 'stealth':
                // Add darker overlay for stealth mode
                this.addStealthOverlay();
                break;
            case 'team':
                // Add team color indicators
                this.addTeamIndicators();
                break;
            default:
                // Classic style - no special effects
                break;
        }
    }

    createUI() {
        // Game title
        this.add.text(20, 20, this.gameConfig.name, {
            fontSize: '24px',
            fontFamily: 'Arial Black',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });

        // Timer
        this.timerText = this.add.text(this.cameras.main.width - 20, 20, '', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(1, 0);

        // Player count
        this.playerCountText = this.add.text(20, 60, '', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });

        // Back to menu button
        const backButton = this.add.text(20, this.cameras.main.height - 40, '← Back to Menu', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setInteractive({ useHandCursor: true });

        backButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }

    setupVariationMechanics() {
        // Apply special rules based on variation
        this.gameConfig.specialRules.forEach(rule => {
            this.applySpecialRule(rule);
        });
    }

    applySpecialRule(rule) {
        switch(rule) {
            case 'speedBoost':
                // Increase movement speed for all players
                this.gameConfig.playerSpeed *= 1.5;
                break;
            case 'quickTasks':
                // Reduce task completion time
                this.taskCompletionTime = 0.5; // 50% faster
                break;
            case 'stealthKills':
                // Imposters can kill without being seen
                this.stealthKillEnabled = true;
                break;
            case 'limitedVision':
                // Reduce player vision range
                this.visionRange = 0.7; // 70% of normal
                break;
            case 'teamObjectives':
                // Enable team-based objectives
                this.teamObjectivesEnabled = true;
                break;
            case 'sharedTasks':
                // Tasks can be completed by multiple players
                this.sharedTasksEnabled = true;
                break;
        }
    }

    initializePlayers() {
        // Create player sprites based on Discord participants
        const playerCount = Math.min(this.participants.length, this.gameConfig.maxPlayers);
        
        for (let i = 0; i < playerCount; i++) {
            const participant = this.participants[i];
            const player = this.createPlayer(i, participant);
            this.gameState.players.push(player);
        }

        // Assign imposters
        this.assignImposters();
    }

    createPlayer(index, participant) {
        const x = 100 + (index * 80);
        const y = 200;
        
        // Create player sprite (placeholder circle for now)
        const player = this.add.circle(x, y, 20, 0x00ff00);
        
        // Add player label using Discord username
        const username = participant.user?.username || `Player ${index + 1}`;
        const nameText = this.add.text(x, y + 30, username, {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Add status text (will be updated when imposter is assigned)
        const statusText = this.add.text(x, y + 45, 'Innocent', {
            fontSize: '10px',
            fontFamily: 'Arial',
            color: '#00ff00',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);

        return {
            sprite: player,
            nameText: nameText,
            statusText: statusText,
            id: participant.user?.id || index.toString(),
            discordId: participant.user?.id,
            username: username,
            isImposter: false,
            tasksCompleted: 0,
            position: { x, y }
        };
    }

    assignImposters() {
        const imposterCount = this.gameConfig.imposterCount;
        const players = this.gameState.players;
        
        // Clear any existing imposters
        this.gameState.imposters = [];
        players.forEach(player => {
            player.isImposter = false;
            player.sprite.setFillStyle(0x00ff00); // Reset to green
            if (player.statusText) {
                player.statusText.setText('Innocent');
                player.statusText.setColor('#00ff00');
            }
        });
        
        // Randomly select imposters
        const availablePlayers = [...players];
        
        for (let i = 0; i < imposterCount && availablePlayers.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * availablePlayers.length);
            const selectedPlayer = availablePlayers.splice(randomIndex, 1)[0];
            
            selectedPlayer.isImposter = true;
            selectedPlayer.sprite.setFillStyle(0xff0000); // Red for imposter
            if (selectedPlayer.statusText) {
                selectedPlayer.statusText.setText('IMPOSTER!');
                selectedPlayer.statusText.setColor('#ff0000');
            }
            this.gameState.imposters.push(selectedPlayer);
            
            console.log(`Selected imposter: ${selectedPlayer.username}`);
        }
        
        // Show imposter selection message
        this.showImposterSelection();
    }



    startGameLoop() {
        // Start the game timer
        this.time.addEvent({
            delay: 1000, // 1 second
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // Update UI
        this.updateUI();
    }

    updateTimer() {
        this.gameState.gameTime++;
        const remainingTime = this.gameConfig.gameDuration - this.gameState.gameTime;
        
        if (remainingTime <= 0) {
            this.endGame();
        }
    }

    updateUI() {
        // Update timer display
        const remainingTime = this.gameConfig.gameDuration - this.gameState.gameTime;
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        this.timerText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);

        // Update player count
        const playerCount = this.participants.length;
        const imposterCount = this.gameState.imposters.length;
        console.log(`Updating UI - Players: ${playerCount}, Imposters: ${imposterCount}`);
        this.playerCountText.setText(`Players: ${playerCount} | Imposters: ${imposterCount}`);
    }

    subscribeToPlayerUpdates() {
        // Subscribe to Discord participant updates
        if (discordSdk && discordSdk.subscribe) {
            discordSdk.subscribe("ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE", ({ participants }) => {
                console.log("Updated participants:", participants);
                this.participants = participants;
                
                // TODO: Re-enable player count restrictions for production
                // if (participants.length >= 3) {
                //     // Update game state if enough players
                //     setCurrentGameState(gameStates.inProgress);
                //     this.updateUI();
                // } else if (this.gameState.isGameActive) {
                //     // End game if not enough players
                //     setCurrentGameState(gameStates.endScreen);
                //     this.endGame();
                // }
                
                // For development: always update UI regardless of player count
                this.updateUI();
            });
        } else {
            console.log('Discord SDK subscribe not available, using mock mode');
        }
    }

    endGame() {
        this.gameState.isGameActive = false;
        
        // Show game over screen
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Game Over!', {
            fontSize: '48px',
            fontFamily: 'Arial Black',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Add restart button
        const restartButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 60, 'Play Again', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        restartButton.on('pointerdown', () => {
            this.scene.restart();
        });
    }

    // Visual style helper methods
    addSpeedEffects() {
        // Add motion blur or speed lines effect
        console.log('Speed effects applied');
    }

    addStealthOverlay() {
        // Add darker overlay for stealth mode
        const overlay = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.3
        );
    }

    addTeamIndicators() {
        // Add team color indicators
        console.log('Team indicators applied');
    }

    showImposterSelection() {
        console.log('Showing imposter selection...');
        
        // Create overlay for imposter selection
        const overlay = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        );

        // Show imposter selection message
        const selectionText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50, 'Selecting Imposter...', {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Show the selected imposter
        const imposter = this.gameState.imposters[0];
        let imposterText = null;
        if (imposter) {
            imposterText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, `${imposter.username} is the Imposter!`, {
                fontSize: '24px',
                fontFamily: 'Arial Black',
                color: '#ff0000',
                stroke: '#000000',
                strokeThickness: 3,
                align: 'center'
            }).setOrigin(0.5);
            
            console.log(`Imposter selected: ${imposter.username}`);
        } else {
            console.log('No imposter found in gameState.imposters');
        }

        // Remove overlay after 3 seconds
        this.time.delayedCall(3000, () => {
            console.log('Removing imposter selection overlay');
            overlay.destroy();
            selectionText.destroy();
            if (imposterText) {
                imposterText.destroy();
            }
        });
    }

    showNotEnoughPlayers() {
        // Create background
        const bg = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            "background"
        );
        
        let scaleX = this.cameras.main.width / bg.width + 0.2;
        let scaleY = this.cameras.main.height / bg.height + 0.2;
        let scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);

        // Show error message
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50, 'Not Enough Players', {
            fontSize: '36px',
            fontFamily: 'Arial Black',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'Minimum 3 players required', {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5);

        // Back to menu button
        const backButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 80, '← Back to Menu', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backButton.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}