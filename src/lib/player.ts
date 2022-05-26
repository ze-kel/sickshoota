import { clamp } from './animationHelpers';
import { MovableEntity } from './generics';
import type { KeyState, MouseState, TCameraPosition } from './main';
import { Weapon } from './weapons';

export class Player extends MovableEntity {
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

	update(
		keyState: KeyState,
		mouseState: MouseState,
		camera: TCameraPosition,
		width: number,
		height: number
	) {
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

		const minXY = 0 + this.radius / 2;
		const maxX = width - this.radius / 2;
		const maxY = height - this.radius / 2;

		this.x = clamp(this.x, minXY, maxX);
		this.y = clamp(this.y, minXY, maxY);

		if (mouseState[0]) {
			return this.shoot(mouseState[0].x + camera.x[0], mouseState[0].y + camera.y[0]);
		}
	}

	shoot(xTarget: number, yTarget: number) {
		const angle = Math.atan2(yTarget - this.y, xTarget - this.x);
		return this.weapon.shoot(this.x, this.y, angle);
	}

	// TODO: GENERALIZE
	drawHp(cc: CanvasRenderingContext2D, camera: TCameraPosition) {
		const w = 50;
		const h = 3;
		cc.beginPath();
		cc.fillStyle = 'rgba(50, 50, 50, 0.2)';
		const x = this.x - camera.x[0] - w / 2;
		const y = this.y - camera.y[0] - this.radius - h / 2 - 7;

		cc.fillRect(x, y, w, h);

		cc.beginPath();
		cc.fillStyle = 'rgba(242, 242, 242, 0.5)';
		cc.fillRect(x, y, w * (this.health / this.maxHealth), h);
	}
}
