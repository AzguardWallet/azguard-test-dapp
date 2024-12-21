<script lang="ts" setup>

</script>

<template>
  <Flex justify="center">
    <Flex direction="column" align="center" justify="center" gap="24" :class="$style.wrapper">
      <Text size="14" color="secondary">Will be available soon..</Text>
    </Flex>
  </Flex>
</template>

<style module>
.wrapper {
	max-width: 500px;
	width: 500px;

  justify-items: center;
  justify-content: center;

  height: auto;


	border-radius: 16px;
	background: linear-gradient(rgba(0, 0, 0, 40%), rgba(0, 0, 0, 0%));
	box-shadow: 0 0 0 2px var(--op-5);

	padding: 20px 8px 20px 8px;

	margin: 32px 16px;
}

.section {
  width: 400px;
  max-height: 250px;

  overflow-y: auto;

  align-items: start;
  align-content: start;
  justify-items: start;
  justify-content: start;
}

.section_big {
  width: 400px;
  max-height: 500px;

  overflow-y: auto;

  align-items: start;
  align-content: start;
  justify-items: start;
  justify-content: start;
}

.button {
	width: fit-content;
	height: 26px;

	border-radius: 8px;
	background: var(--op-10);
	cursor: pointer;

	padding: 0 8px;

	transition: all 0.2s ease;

	&:hover {
		background: var(--op-15);
	}

	&:active {
		background: var(--op-20);
	}
}

.wallet {
	position: relative;

	width: 56px;
	height: 56px;

	border-radius: 12px;
	background: var(--op-8);

	& img {
		border-radius: 50%;
		filter: grayscale(1);
		opacity: 0.5;

		transition: all 0.2s ease;
	}

	& svg {
		position: absolute;
		top: -12px;
		right: -12px;
		box-sizing: content-box;

		background: #101010;
		border-radius: 50%;

		padding: 3px;
	}
}

.wallet.connected {
	& img {
		filter: none;
		opacity: 1;
	}
}

.task {
	width: 316px;

	border-radius: 8px;
	background: var(--op-5);
	cursor: pointer;

	padding: 10px 10px 10px 10px;

	transition: all 0.1s ease;

	&:hover {
		background: var(--op-8);
	}

	&.done {
		cursor: auto;
	}
}

.link {
	color: var(--txt-tertiary);
}

.disconnect {
	color: var(--txt-tertiary);
	fill: var(--txt-tertiary);
	cursor: pointer;
}

.disconnect:hover {
	fill: var(--red);
	color: var(--red);
	opacity: 0.8;
}

.description {
	margin-left: 22px;
}

.ready_icon {
	& svg {
		transition: all 0.5s ease;
	}

	& svg:first-child {
		fill: var(--green);

		transform: translateX(16px);

		filter: drop-shadow(0 0px 8px var(--green));
	}

	& svg:last-child {
		fill: var(--green);

		transform: translateX(-16px);

		filter: drop-shadow(0 0px 8px var(--green));
	}
}

.next_btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;

	height: 32px;

	border-radius: 8px;
	background: var(--green);
	cursor: pointer;

	margin: 0 12px;
}

.account {
	cursor: pointer;
}

.account_selected {
	color: var(--green);
}

.input {
	width: 100%;
	height: 20px;

	padding: 0;

	background-color: var(--card-background);

	font-size: 14px;
	font-family: "ClashGrotesk", "sans-serif";
	color: var(--txt-primary);
}

.input_big {
	width: 100%;
	height: 300px;

	padding: 0;

	background-color: var(--card-background);

	font-size: 14px;
	font-family: "ClashGrotesk", "sans-serif";
	color: var(--txt-primary);
}

</style>
