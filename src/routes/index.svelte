<script lang="ts">
	import { onMount } from 'svelte';
	import Game from '$lib/main';
	import type { GameState } from '$lib/main';

	let canvas: HTMLCanvasElement;

	let game: Game;

	let gameState: GameState;

	const updateGameState = (state: GameState) => {
		gameState = state;
	};

	onMount(() => {
		game = new Game(canvas, updateGameState);
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
	{#if gameState}
		<div class="interfaceOverlay">
			{#if gameState.state === 'notStarted'}
				<div class="interfaceWindow start">
					<h1 class="title">SICKSHOOTA</h1>
					<button class="button" on:click={() => game.start()}>START</button>
				</div>
			{/if}
			{#if gameState.state === 'paused'}
				<div class="interfaceWindow start">
					<h1 class="title">PAUSED</h1>
					<button class="button" on:click={() => game.start()}>RESUME</button>
				</div>
			{/if}
			{#if gameState.state === 'levelUp'}
				<div class="interfaceWindow start">
					<h1 class="title">LEVELUP</h1>
					<button class="button" on:click={() => game.start()}>RESUME</button>
				</div>
			{/if}
		</div>
	{/if}

	<canvas class="canvas" bind:this={canvas} />
</div>

<style>
	.wrapper {
		height: 100%;
		width: 100%;
		overflow: hidden;
		font-family: sans-serif;
		color: white;
	}

	.interfaceOverlay {
		width: 100%;
		height: 100%;
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		padding: 10%;
		box-sizing: border-box;
	}

	.button {
		font-size: 25px;
		background: none;
		border: none;
		color: white;
		font-family: inherit;
		text-decoration: underline;
		cursor: pointer;
		padding: 0;
	}
</style>
