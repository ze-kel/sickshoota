import type { BasicEnemy } from "./enemies";
import { MovableEntity } from "./generics";
import type { TUpdateStatus } from "./main";

export class Projectile extends MovableEntity {
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


export class Weapon {
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
