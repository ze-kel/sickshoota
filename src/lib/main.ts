import { range } from './animationHelpers';
import { BasicEnemy } from './enemies';
import { Player } from './player';
import type { Projectile } from './weapons';

export type KeyState = Record<string, boolean>;

export type MouseState = Record<number, { x: number; y: number }>;

const Game = {
	canvas: HTMLCanvasElement,
	context: CanvasRenderingContext2D;

	worldState: WorldState;
	createInterfaceWindow: any;

	constructor(canvas: HTMLCanvasElement, createInterfaceWindow: any) {
		this.canvas = canvas;
		const context = canvas.getContext('2d');
		if (!context) {
			throw 'Failed to get context';
		}
		this.context = context;
		this.keyState = {};
		this.mouseState = {};

		canvas.width = innerWidth;
		canvas.height = innerHeight;

		this.worldState = new WorldState(this.canvas);
		this.createInterfaceWindow = createInterfaceWindow;
		this.render(true);
		createInterfaceWindow({ type: 'start', start: () => this.start() });
	}

	start() {
		this.render();
	}

	render(lastFrame = false) {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.context.fillStyle = '#f52432';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		const status = this.worldState.updateAndDraw(this.keyState, this.mouseState, this.context);
		if (status !== 'dead' && !lastFrame) {
			requestAnimationFrame(() => this.render());
		}
	}

	keyState: KeyState;

	mouseState: MouseState;

	keyDown(e: KeyboardEvent) {
		this.keyState[e.code] = true;
	}

	keyUp(e: KeyboardEvent) {
		if (this.keyState[e.code]) {
			delete this.keyState[e.code];
		}
	}

	mouseDown(e: MouseEvent) {
		this.mouseState[e.button] = { x: e.clientX, y: e.clientY };
	}

	mouseUp(e: MouseEvent) {
		if (this.mouseState[e.button]) {
			delete this.mouseState[e.button];
		}
	}

	mouseMove(e: MouseEvent) {
		Object.keys(this.mouseState).forEach((key) => {
			if (this.mouseState[Number(key)]) {
				this.mouseState[Number(key)] = { x: e.clientX, y: e.clientY };
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

	constructor(canvas: HTMLCanvasElement) {
		this.projectiles = [];
		this.enemies = [];
		this.player = new Player({ x: canvas.width / 2, y: canvas.height / 2 });
		this.spawnEnemies(canvas.width);
	}

	spawnEnemies(width: number) {
		setInterval(() => {
			const random = Math.random();
			// TODO: DYNAMIC WIDTH
			const xPos = range(0, 1, 0, width, random);
			const newEnemy = new BasicEnemy({ x: xPos, y: 0, color: 'black', radius: 25 });
			this.enemies.push(newEnemy);
		}, 1000);
	}

	updateAndDraw(
		keyState: KeyState,
		mouseState: MouseState,
		context: CanvasRenderingContext2D
	): TUpdateStatus {
		this.projectiles = this.projectiles.reduce((arr, proj) => {
			const status = proj.update(this.enemies);
			if (status !== 'dead') {
				arr.push(proj);
				proj.draw(context);
			}

			return arr;
		}, [] as Projectile[]);

		this.enemies = this.enemies.reduce((arr, enm) => {
			const status = enm.update(this.player);
			if (status !== 'dead') {
				arr.push(enm);
				enm.draw(context);
			}

			return arr;
		}, [] as BasicEnemy[]);

		if (this.player) {
			const newProjectiles = this.player.update(keyState, mouseState);
			if (newProjectiles) {
				this.projectiles.push(...newProjectiles);
			}
			this.player.draw(context);
		}

		if (this.player.health <= 0) return 'dead';
		return 'alive';
}
}