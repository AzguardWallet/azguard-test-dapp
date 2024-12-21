<template>
	<Flex justify="center" align="center" :class="$style.wrapper">
		<Flex align="center" direction="column" gap="8">
			<Flex align="center" gap="4">
				<Icon name="logo" size="12" color="tertiary" />
				<Text size="13" color="tertiary"> Azguard Test App <Text color="support">by </Text>
					<a
						href="https://azguardwallet.io/"
						target="_blank"
						:class="$style.link"
					>
						Azguard Wallet Team
					</a>
					
					<Text color="support">© 2024</Text>
				</Text>
			</Flex>
		</Flex>
	</Flex>
</template>

<style module>
.wrapper {
	height: 50px;

	border-top: 2px solid var(--op-5);
}

.link {
	font-size: 13px;
	color: var(--txt-tertiary);

	&:hover {
		color: var(--txt-secondary);
		text-decoration: underline;
	}
}
</style>
