export class MovableEntity {
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
