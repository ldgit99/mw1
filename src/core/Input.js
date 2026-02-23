export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.justPressed = new Set();
    this.mouse = {
      x: 0,
      y: 0,
      leftDown: false,
    };

    const isBlockedKey = (code) =>
      code === "Space" ||
      code === "Digit1" ||
      code === "Digit2" ||
      code === "Digit3" ||
      code === "Numpad1" ||
      code === "Numpad2" ||
      code === "Numpad3" ||
      code === "ArrowUp" ||
      code === "ArrowDown" ||
      code === "ArrowLeft" ||
      code === "ArrowRight";

    const onKeyDown = (e) => {
      if (isBlockedKey(e.code)) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (!this.keys.has(e.code)) {
        this.justPressed.add(e.code);
      }
      this.keys.add(e.code);
    };

    const onKeyUp = (e) => {
      if (isBlockedKey(e.code)) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.keys.delete(e.code);
    };

    window.addEventListener("keydown", onKeyDown, { capture: true });
    window.addEventListener("keyup", onKeyUp, { capture: true });

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      this.mouse.x = (e.clientX - rect.left) * scaleX;
      this.mouse.y = (e.clientY - rect.top) * scaleY;
    });

    canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) this.mouse.leftDown = true;
    });

    window.addEventListener("mouseup", (e) => {
      if (e.button === 0) this.mouse.leftDown = false;
    });
  }

  getAxis() {
    const right = this.keys.has("KeyD") || this.keys.has("ArrowRight");
    const left = this.keys.has("KeyA") || this.keys.has("ArrowLeft");
    const down = this.keys.has("KeyS") || this.keys.has("ArrowDown");
    const up = this.keys.has("KeyW") || this.keys.has("ArrowUp");

    const x = (right ? 1 : 0) - (left ? 1 : 0);
    const y = (down ? 1 : 0) - (up ? 1 : 0);

    if (x === 0 && y === 0) {
      return { x: 0, y: 0 };
    }

    const len = Math.hypot(x, y);
    return { x: x / len, y: y / len };
  }

  consumePress(code) {
    if (!this.justPressed.has(code)) return false;
    this.justPressed.delete(code);
    return true;
  }
}
