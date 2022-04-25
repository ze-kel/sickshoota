type KeyState = Record<string, boolean>;

type MouseState = Record<number, { x: number; y: number }>;

export default class Game {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	player: Player | undefined;

	projectiles: Projectile[];

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		const context = canvas.getContext('2d');
		if (!context) {
			throw 'Failed to get context';
		}
		this.context = context;
		this.projectiles = [];
		this.keyState = {};
		this.mouseState = {};

		canvas.width = innerWidth;
		canvas.height = innerHeight;
	}

	start() {
		this.player = new Player({ x: this.canvas.width / 2, y: this.canvas.height / 2 });
		this.render();
	}

	render() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.context.fillStyle = '#f52432';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		if (this.player) {
			const newProjectiles = this.player.update(this.keyState, this.mouseState);
			if (newProjectiles) {
				this.projectiles.push(...newProjectiles);
			}
			this.player.draw(this.context);
		}

		this.projectiles.forEach((proj) => {
			proj.update();
			proj.draw(this.context);
		});

		requestAnimationFrame(() => this.render());
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

class MovableEntity {
	x: number;
	y: number;
	radius: number;
	color: string;
	constructor(params: { x: number; y: number; radius?: number; color?: string }) {
		this.x = params.x;
		this.y = params.y;
		this.radius = params.radius || 5;
		this.color = params.color || 'white';
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function

	draw(cc: CanvasRenderingContext2D) {
		cc.beginPath();
		cc.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		cc.fillStyle = this.color;
		cc.fill();
	}
}

class Weapon {
	damage: number;
	velocity: number;
	constructor() {
		this.damage = 25;
		this.velocity = 15;
	}

	shoot(xOrigin: number, yOrigin: number, angle: number) {
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

	constructor(params: { x: number; y: number }) {
		super({ ...params, radius: 25 });

		this.speed = 7;

		this.weapon = new Weapon();
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

	update() {
		this.x += this.velocity.x;
		this.y += this.velocity.y;
	}
}
