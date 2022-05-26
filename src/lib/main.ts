import { clamp, range } from './animationHelpers';
import { BasicEnemy } from './enemies';
import { Player } from './player';
import type { Projectile } from './weapons';

export type KeyState = Record<string, boolean>;

export type MouseState = Record<number, { x: number; y: number }>;

type RunningState = 'notStarted' | 'running' | 'paused' | 'gameOver' | 'levelUp';

export interface GameState {
	context: CanvasRenderingContext2D;
	screenW: number;
	screenH: number;

	keyState: KeyState;
	mouseState: MouseState;

	state: RunningState;
	score: number;
	nextLevel: number;
}

export type GameStateCallback = (arg0: GameState) => void;

export class Game {
	canvas: HTMLCanvasElement;

	worldState: WorldState;

	gameState: GameState;
	updateGameStateInUI;

	constructor(canvas: HTMLCanvasElement, updateGameStateInUI: GameStateCallback) {
		this.canvas = canvas;
		const context = canvas.getContext('2d');
		if (!context) {
			throw 'Failed to get context';
		}

		canvas.width = innerWidth;
		canvas.height = innerHeight;

		const rect = canvas.getBoundingClientRect();

		canvas.width = rect.width * devicePixelRatio;
		canvas.height = rect.height * devicePixelRatio;

		context.scale(devicePixelRatio, devicePixelRatio);

		canvas.style.width = rect.width + 'px';
		canvas.style.height = rect.height + 'px';

		this.updateGameStateInUI = () => updateGameStateInUI(this.gameState);
		this.gameState = {
			context,
			state: 'notStarted',
			score: 0,
			nextLevel: 100,
			screenW: innerWidth,
			screenH: innerHeight,
			keyState: {},
			mouseState: {}
		};
		this.updateGameStateInUI();

		this.worldState = new WorldState(this.canvas, this.gameState);
		this.render(true);
	}

	start() {
		if (this.gameState.state != 'running') {
			this.gameState.state = 'running';
			this.updateGameStateInUI();
			this.render();
		}
	}

	render(lastFrame = false) {
		const status = this.worldState.updateAndDraw();

		if (this.gameState.keyState['Escape']) {
			this.gameState.state = 'paused';
			this.updateGameStateInUI();
			return;
		}

		if (this.gameState.score >= this.gameState.nextLevel) {
			//this.gameState.state = 'levelUp';
			//this.updateGameStateInUI();
			//return;
		}

		if (status !== 'dead' && !lastFrame) {
			requestAnimationFrame(() => this.render());
		}
	}

	keyDown(e: KeyboardEvent) {
		this.gameState.keyState[e.code] = true;
	}

	keyUp(e: KeyboardEvent) {
		if (this.gameState.keyState[e.code]) {
			delete this.gameState.keyState[e.code];
		}
	}

	mouseDown(e: MouseEvent) {
		this.gameState.mouseState[e.button] = { x: e.clientX, y: e.clientY };
	}

	mouseUp(e: MouseEvent) {
		if (this.gameState.mouseState[e.button]) {
			delete this.gameState.mouseState[e.button];
		}
	}

	mouseMove(e: MouseEvent) {
		Object.keys(this.gameState.mouseState).forEach((key) => {
			if (this.gameState.mouseState[Number(key)]) {
				this.gameState.mouseState[Number(key)] = { x: e.clientX, y: e.clientY };
			}
		});
	}
}

export default Game;

export type TUpdateStatus = 'dead' | 'alive';

export type TCameraPosition = { x: [number, number]; y: [number, number] };

class WorldState {
	player: Player;
	enemies: BasicEnemy[];
	projectiles: Projectile[];
	gameState: GameState;
	width: number;
	height: number;
	cameraPosition: TCameraPosition;

	constructor(canvas: HTMLCanvasElement, gameState: GameState) {
		this.projectiles = [];
		this.enemies = [];
		this.player = new Player({ x: gameState.screenW / 2, y: gameState.screenH / 2 });
		this.gameState = gameState;
		this.width = 1000;
		this.height = 1000;
		this.cameraPosition = this.updateCamera();
		setInterval(() => this.spawnEnemies(), 1000);
	}

	spawnEnemies() {
		if (this.gameState.state !== 'running') return;
		const xPos = range(0, 1, 0, this.width, Math.random());
		const yPos = range(0, 1, 0, this.width, Math.random());
		const newEnemy = new BasicEnemy({ x: xPos, y: yPos, color: 'black', radius: 25 });
		this.enemies.push(newEnemy);
	}

	updateCamera(): TCameraPosition {
		// NOT FINISHED
		const cameraStartX = clamp(this.player.x - this.gameState.screenW, 0, this.width);
		console.log('startX', cameraStartX);
		const cameraEndX = cameraStartX + this.gameState.screenW;
		const cameraStartY = clamp(
			this.player.y - this.gameState.screenH / 2,
			0,
			this.height - this.gameState.screenH / 2
		);
		const cameraEndY = cameraStartY + this.gameState.screenH;

		const camera: TCameraPosition = {
			x: [cameraStartX, cameraEndX],
			y: [cameraStartY, cameraEndY]
		};

		this.cameraPosition = camera;
		return camera;
	}

	updateAndDraw(): TUpdateStatus {
		const ctx = this.gameState.context;
		this.updateCamera();
		this.drawWorld(ctx);
		this.drawScore(ctx);

		console.log(`X: ${this.player.x} Y: ${this.player.y}`);

		this.projectiles = this.projectiles.reduce((arr, proj) => {
			const status = proj.update(this.enemies);
			if (status !== 'dead') {
				arr.push(proj);
				proj.draw(ctx, this.cameraPosition);
			}

			return arr;
		}, [] as Projectile[]);

		this.enemies = this.enemies.reduce((arr, enm) => {
			const status = enm.update(this.player);
			if (status !== 'dead') {
				arr.push(enm);
				enm.draw(ctx, this.cameraPosition);
			} else {
				this.gameState.score += enm.scoreWeight;
			}

			return arr;
		}, [] as BasicEnemy[]);

		if (this.player) {
			const newProjectiles = this.player.update(
				this.gameState.keyState,
				this.gameState.mouseState,
				this.cameraPosition,
				this.width,
				this.height
			);
			if (newProjectiles) {
				this.projectiles.push(...newProjectiles);
			}
			this.player.draw(ctx, this.cameraPosition);
		}

		if (this.player.health <= 0) return 'dead';
		return 'alive';
	}

	drawScore(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		ctx.font = '48px sans-serif';
		ctx.fillText(String(this.gameState.score), this.gameState.screenW / 2, 50);
	}

	drawWorld(ctx: CanvasRenderingContext2D) {
		ctx.clearRect(0, 0, this.gameState.screenW, this.gameState.screenH);
		ctx.fillStyle = '#f52432';
		ctx.fillRect(0, 0, this.gameState.screenW, this.gameState.screenH);

		const getLinesPosition = (start: number, end: number, space: number) => {
			const arr = [];
			const base = Math.floor(start / space) * space - start;
			for (let i = base + space; i <= end - start; i += space) {
				arr.push(i);
			}
			return arr;
		};

		const lineThickness = 1;
		const spread = 150;
		const lineColor = '#cf131f';
		const linesX = getLinesPosition(this.cameraPosition.x[0], this.cameraPosition.x[1], spread);
		const linesY = getLinesPosition(this.cameraPosition.y[0], this.cameraPosition.y[1], spread);

		linesX.forEach((pos) => {
			ctx.fillStyle = lineColor;
			ctx.fillRect(pos - lineThickness, 0, lineThickness, this.gameState.screenH);
		});

		linesY.forEach((pos) => {
			ctx.fillStyle = lineColor;
			ctx.fillRect(0, pos - lineThickness, this.gameState.screenW, lineThickness);
		});
	}
}
