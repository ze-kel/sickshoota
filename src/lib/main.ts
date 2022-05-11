import { range } from './animationHelpers';

type KeyState = Record<string, boolean>;

type MouseState = Record<number, { x: number; y: number }>;

export default class Game {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;

	worldState: WorldState;

	constructor(canvas: HTMLCanvasElement) {
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
	}

	start() {
		this.render();
	}

	render() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.context.fillStyle = '#f52432';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		const status = this.worldState.updateAndDraw(this.keyState, this.mouseState, this.context);
		if (status !== 'dead') {
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

type TUpdateStatus = 'dead' | 'alive';

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

class MovableEntity {
	x: number;
	y: number;
	radius: number;
	color: string;
	drawers: Array<(cc: CanvasRenderingContext2D) => void>;

	constructor(params: { x: number; y: number; radius?: number; color?: string }) {
		this.x = params.x;
		this.y = params.y;
		this.radius = params.radius || 5;
		this.color = params.color || 'white';
		this.drawers = [];
		this.drawers.push(this.drawCircle);
	}

	draw(cc: CanvasRenderingContext2D) {
		this.drawers.forEach((fn) => fn.bind(this)(cc));
	}

	drawCircle(cc: CanvasRenderingContext2D) {
		cc.beginPath();
		cc.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		cc.fillStyle = this.color;
		cc.fill();
	}
}

class Weapon {
	damage: number;
	velocity: number;
	coolDown: number;
	lastShot: Date;
	constructor() {
		this.damage = 25;
		this.velocity = 15;
		this.coolDown = 200;
		this.lastShot = new Date();
	}

	shoot(xOrigin: number, yOrigin: number, angle: number) {
		const now = new Date();
		if (now.getTime() - this.lastShot.getTime() < this.coolDown) {
			return [];
		}

		this.lastShot = now;

		const projectiles = [
			new Projectile({
				x: xOrigin,
				y: yOrigin,
				velocty: { x: Math.cos(angle) * this.velocity, y: Math.sin(angle) * this.velocity },
				damage: this.damage
			})
		];
		return projectiles;
	}
}

class Player extends MovableEntity {
	weapon: Weapon;
	speed: number;
	health: number;
	maxHealth: number;

	constructor(params: { x: number; y: number }) {
		super({ ...params, radius: 25 });

		this.speed = 7;
		this.maxHealth = 100;
		this.health = this.maxHealth;

		this.weapon = new Weapon();
		this.drawers.push(this.drawHp);
	}

	update(keyState: KeyState, mouseState: MouseState) {
		if (keyState['KeyA']) {
			this.x -= this.speed;
		}
		if (keyState['KeyD']) {
			this.x += this.speed;
		}

		if (keyState['KeyS']) {
			this.y += this.speed;
		}
		if (keyState['KeyW']) {
			this.y -= this.speed;
		}

		if (mouseState[0]) {
			return this.shoot(mouseState[0].x, mouseState[0].y);
		}
	}

	shoot(xTarget: number, yTarget: number) {
		const angle = Math.atan2(yTarget - this.y, xTarget - this.x);
		return this.weapon.shoot(this.x, this.y, angle);
	}

	// TODO: GENERALIZE
	drawHp(cc: CanvasRenderingContext2D) {
		const w = 50;
		const h = 3;
		cc.beginPath();
		cc.fillStyle = 'rgba(50, 50, 50, 0.2)';
		cc.fillRect(this.x - w / 2, this.y - this.radius - h / 2 - 7, w, h);

		cc.beginPath();
		cc.fillStyle = 'rgba(242, 242, 242, 0.5)';
		cc.fillRect(
			this.x - w / 2,
			this.y - this.radius - h / 2 - 7,
			w * (this.health / this.maxHealth),
			h
		);
	}
}

class BasicEnemy extends MovableEntity {
	speed: number;
	health: number;
	maxHealth: number;
	damage: number;

	constructor(params: { x: number; y: number; radius?: number; color?: string }) {
		super(params);
		this.speed = 5;
		this.maxHealth = 100;
		this.damage = 10;
		this.health = this.maxHealth;
		this.drawers.push(this.drawHp);
	}

	update(player: Player): TUpdateStatus {
		if (this.health <= 0) return 'dead';

		const angle = Math.atan2(player.y - this.y, player.x - this.x);
		this.x += Math.cos(angle) * this.speed;
		this.y += Math.sin(angle) * this.speed;
		const distance = Math.hypot(this.x - player.x, this.y - player.y);
		const bound = this.radius + player.radius;
		if (distance < bound) {
			player.health -= this.damage;
			return 'dead';
		}

		return 'alive';
	}

	drawHp(cc: CanvasRenderingContext2D) {
		const w = 50;
		const h = 3;
		cc.beginPath();
		cc.fillStyle = 'rgba(50, 50, 50, 0.2)';
		cc.fillRect(this.x - w / 2, this.y - this.radius - h / 2 - 7, w, h);

		cc.beginPath();
		cc.fillStyle = 'rgba(242, 242, 242, 0.5)';
		cc.fillRect(
			this.x - w / 2,
			this.y - this.radius - h / 2 - 7,
			w * (this.health / this.maxHealth),
			h
		);
	}
}

class Projectile extends MovableEntity {
	velocity: { x: number; y: number };
	damage: number;

	constructor(params: {
		x: number;
		y: number;
		velocty: { x: number; y: number };
		radius?: number;
		damage: number;
	}) {
		super(params);
		this.velocity = params.velocty;
		this.damage = params.damage;
	}

	update(enemies: BasicEnemy[]): TUpdateStatus {
		this.x += this.velocity.x;
		this.y += this.velocity.y;

		for (let i = 0; i < enemies.length; i++) {
			const enemy = enemies[i];
			const distance = Math.hypot(this.x - enemy.x, this.y - enemy.y);
			const bound = this.radius + enemy.radius;
			if (distance < bound) {
				enemy.health -= this.damage;
				return 'dead';
			}
		}

		return 'alive';
	}
}
