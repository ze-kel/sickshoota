import { range } from './animationHelpers';
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
		const ctx = this.gameState.context;
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		ctx.fillStyle = '#f52432';
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		ctx.fillStyle = 'white';
		ctx.textAlign = 'center';
		ctx.font = '48px sans-serif';
		ctx.fillText(String(this.gameState.score), this.canvas.width / 2, 50);

		const status = this.worldState.updateAndDraw();

		if (this.gameState.keyState['Escape']) {
			this.gameState.state = 'paused';
			this.updateGameStateInUI();
			return;
		}

		if (this.gameState.score >= this.gameState.nextLevel) {
			this.gameState.state = 'levelUp';
			this.updateGameStateInUI();
			return;
		}

		if (status !== 'dead' && !lastFrame) {
			requestAnimationFrame(() => this.render());
		}
	}

	keyDown(e: KeyboardEvent) {
		console.log(e.code);
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

class WorldState {
	player: Player;
	enemies: BasicEnemy[];
	projectiles: Projectile[];
	gameState: GameState;

	constructor(canvas: HTMLCanvasElement, gameState: GameState) {
		this.projectiles = [];
		this.enemies = [];
		this.player = new Player({ x: canvas.width / 2, y: canvas.height / 2 });
		this.gameState = gameState;
		setInterval(() => this.spawnEnemies(), 1000);
	}

	spawnEnemies() {
		if (this.gameState.state !== 'running') return;
		const random = Math.random();
		const xPos = range(0, 1, 0, this.gameState.screenW, random);
		const newEnemy = new BasicEnemy({ x: xPos, y: 0, color: 'black', radius: 25 });
		this.enemies.push(newEnemy);
	}

	updateAndDraw(): TUpdateStatus {
		const ctx = this.gameState.context;

		this.projectiles = this.projectiles.reduce((arr, proj) => {
			const status = proj.update(this.enemies);
			if (status !== 'dead') {
				arr.push(proj);
				proj.draw(ctx);
			}

			return arr;
		}, [] as Projectile[]);

		this.enemies = this.enemies.reduce((arr, enm) => {
			const status = enm.update(this.player);
			if (status !== 'dead') {
				arr.push(enm);
				enm.draw(ctx);
			} else {
				this.gameState.score += enm.scoreWeight;
			}

			return arr;
		}, [] as BasicEnemy[]);

		if (this.player) {
			const newProjectiles = this.player.update(this.gameState.keyState, this.gameState.mouseState);
			if (newProjectiles) {
				this.projectiles.push(...newProjectiles);
			}
			this.player.draw(ctx);
		}

		if (this.player.health <= 0) return 'dead';
		return 'alive';
	}
}
