import { Scene } from "phaser";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    // Background setup
    const bg = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "background"
    );
    let scaleX = this.cameras.main.width / bg.width + 0.2;
    let scaleY = this.cameras.main.height / bg.height + 0.2;
    let scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);

    // Logo
    this.add.image(this.game.config.width * 0.5, 150, "logo");

    // Title
    this.add
      .text(this.game.config.width * 0.5, 250, "Choose Your Game Mode", {
        fontFamily: "Arial Black",
        fontSize: 42,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);

    // Game variations configuration
    const gameVariations = [
      {
        id: "variation1",
        name: "Variation 1"
      },
      {
        id: "variation2",
        name: "Variation 2"
      },
      {
        id: "variation3",
        name: "Variation 3"
      },
      {
        id: "variation4",
        name: "Variation 4"
      }
    ];

    // Grid layout configuration
    const gridConfig = {
      columns: 2,
      startY: 350,
      buttonSpacing: 300,
      rowSpacing: 120
    };

    // Create variation buttons in a grid
    gameVariations.forEach((variation, index) => {
      const row = Math.floor(index / gridConfig.columns);
      const col = index % gridConfig.columns;
      
      const x = (this.game.config.width * 0.25) + (col * gridConfig.buttonSpacing);
      const y = gridConfig.startY + (row * gridConfig.rowSpacing);

      // Create button background
      const button = this.add
        .image(x, y, "button")
        .setInteractive({ useHandCursor: true })
        .setScale(1.2);

      // Add hover effect
      button.on("pointerover", () => {
        button.setScale(1.3);
        button.setTint(0xcccccc);
      });

      button.on("pointerout", () => {
        button.setScale(1.2);
        button.clearTint();
      });

      // Add click handler
      button.on("pointerdown", () => {
        this.selectGameVariation(variation.id);
      });

             // Add variation name text
       this.add
         .text(x, y, variation.name, {
           fontSize: "24px",
           fontFamily: "Arial Black",
           color: "#ffffff",
           stroke: "#000000",
           strokeThickness: 4,
           align: "center"
         })
         .setOrigin(0.5);
    });

    // Back button (if needed)
    this.add
      .text(50, 50, "← Back", {
        fontSize: "20px",
        fontFamily: "Arial",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3
      })
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        // Handle back navigation if needed
        console.log("Back button clicked");
      });
  }

  selectGameVariation(variationId) {
    console.log(`Selected game variation: ${variationId}`);
    
    // Store the selected variation in the game's global data
    this.game.selectedVariation = variationId;
    
    // Start the game with the selected variation
    this.scene.start("Game");
  }
}
