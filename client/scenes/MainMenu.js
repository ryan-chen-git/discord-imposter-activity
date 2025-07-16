import { Scene } from "phaser";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
    this.selectedVariation = null;
  }

  create() {
    const bg = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "background"
    );
    let scaleX = this.cameras.main.width / bg.width + 0.2;
    let scaleY = this.cameras.main.height / bg.height + 0.2;
    let scale = Math.max(scaleX, scaleY);
    bg.setScale(scale).setScrollFactor(0);

    this.add.image(this.game.config.width * 0.5, 300, "logo");

    this.add
      .text(this.game.config.width * 0.5, 460, "Main Menu", {
        fontFamily: "Arial Black",
        fontSize: 38,
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 8,
        align: "center",
      })
      .setOrigin(0.5);

    // Variation Button
    // Draw rounded rectangle using Graphics
    this.add.image(this.game.config.width * 0.5, 540, "button");

    const variationButton = this.add
      .text(this.game.config.width / 2, 540, "Variation 1", {
        fontSize: "28px",
        color: "#000000",
        //backgroundColor: "#333333",
        padding: { x: 20, y: 10 },
        border: "2px solid #000000",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    variationButton.on("pointerdown", () => {
      this.selectedVariation = "variation_1";
      console.log(this.selectedVariation);
      //variationButton.setStyle({ backgroundColor: "#5555ff" }); // visual feedback
    });

    // this.input.once("pointerdown", () => {
    //   this.scene.start("Game");
    // });
  }
}
