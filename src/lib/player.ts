import { MovableEntity } from './generics';
import type { KeyState, MouseState } from './main';
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
