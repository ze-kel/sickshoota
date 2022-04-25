<script lang="ts">
	import { onMount } from 'svelte';
	import Game from '$lib/main';

	let canvas: HTMLCanvasElement;

	let game: Game;

	onMount(() => {
		game = new Game(canvas);
		game.start();

		addEventListener('keydown', keydown);
		addEventListener('keyup', keyup);

		addEventListener('mousedown', mouseDown);
		addEventListener('mouseup', mouseUp);
		addEventListener('mousemove', mouseMove);
	});

	const keydown = (e: KeyboardEvent) => {
		game.keyDown(e);
	};

	const keyup = (e: KeyboardEvent) => {
		game.keyUp(e);
	};

	const mouseDown = (e: MouseEvent) => {
		game.mouseDown(e);
	};

	const mouseUp = (e: MouseEvent) => {
		game.mouseUp(e);
	};

	const mouseMove = (e: MouseEvent) => {
		game.mouseMove(e);
	};
</script>

<div class="wrapper">
	<canvas class="canvas" bind:this={canvas} />
</div>

<style>
	.wrapper {
		height: 100%;
		width: 100%;
		overflow: hidden;
	}
</style>
