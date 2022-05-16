<script lang="ts">
	import { onMount } from 'svelte';
	import Game from '$lib/main';

	let canvas: HTMLCanvasElement;

	let interfaceWindow: any = null;

	const createInterfaceWindow = (obj: any) => {
		interfaceWindow = obj;
	};

	const callAndClose = (fn: any) => {
		fn();
		interfaceWindow = null;
	};

	onMount(() => {
		addEventListener('keydown', keydown);
		addEventListener('keyup', keyup);

		addEventListener('mousedown', mouseDown);
		addEventListener('mouseup', mouseUp);
		addEventListener('mousemove', mouseMove);
	});

	const keydown = (e: KeyboardEvent) => {
		Game.keyDown(e);
	};

	const keyup = (e: KeyboardEvent) => {
		Game.keyUp(e);
	};

	const mouseDown = (e: MouseEvent) => {
		Game.mouseDown(e);
	};

	const mouseUp = (e: MouseEvent) => {
		Game.mouseUp(e);
	};

	const mouseMove = (e: MouseEvent) => {
		Game.mouseMove(e);
	};
</script>

<div class="wrapper">
	{#if interfaceWindow}
		<div class="interfaceOverlay">
			{#if interfaceWindow.type === 'start'}
				<div class="interfaceWindow start">
					<h1 class="title">SICKSHOOTA</h1>
					<button class="button" on:click={() => callAndClose(interfaceWindow.start)}>START</button>
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
