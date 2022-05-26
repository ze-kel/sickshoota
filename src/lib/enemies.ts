import { MovableEntity } from './generics';
import type { TCameraPosition, TUpdateStatus } from './main';
import type { Player } from './player';

export class BasicEnemy extends MovableEntity {
	speed: number;
	health: number;
	maxHealth: number;
	damage: number;
	scoreWeight: number;

	constructor(params: { x: number; y: number; radius?: number; color?: string }) {
		super(params);
		this.speed = 5;
		this.maxHealth = 100;
		this.damage = 10;
		this.health = this.maxHealth;
		this.scoreWeight = 10;
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
