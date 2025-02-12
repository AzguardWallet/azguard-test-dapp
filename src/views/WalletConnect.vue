<script setup>
/** Vendor */
import { computed, onBeforeMount, ref, watch } from 'vue';
import { WalletConnectModalSign } from "@walletconnect/modal-sign-html"

/** UI */
import JsonViewer from "@/components/ui/JsonViewer/JsonViewer.vue"
import Tooltip from '@/components/ui/Tooltip.vue'

let web3Modal;

const session = ref()
const accounts = computed(() => [
	...new Set(Object.values(session.value?.namespaces ?? {}).flatMap(x => x.accounts))
])

const sender = ref()
const contract = ref("0x03f5eb79b443df7879b6903082dc0585d235011fdf42c91594c72dce2d64adc3")
const recipient = ref("0x02c2a6d5a406673674d8405ecb48f7cb26322a6b7d7724ee1b47be8c61d0467f")
const amount = ref("100")
const params = ref();
const result = ref();

const loading = ref();
const showSession = ref();

const getChain = (account) => account.substring(0, account.lastIndexOf(":"));

const getAddress = (account) => account.split(":").at(-1);

const buildConnectionParams = () => {
	return {
		requiredNamespaces: {
			aztec: {
				chains: [
					"aztec:41337",
				],
				methods: [
					"register_contract",
					"send_transaction",
					"call",
					"simulate_unconstrained",
				],
				events: [],
			},
		},
		optionalNamespaces: {
			aztec: {
				chains: [
					"aztec:31337",
				],
				methods: [
					"register_contract",
					"send_transaction",
					"call",
					"simulate_unconstrained",
				],
				events: [],
			},
		},
	}
}

const buildExecutionParams = () => {
	return {
		topic: session.value?.topic,
		chainId: getChain(sender.value),
		request: {
			method: "execute",
			params: {
				sessionId: session.value?.topic,
				operations: [
					{
						kind: "register_contract",
						chain: getChain(sender.value),
						address: contract.value,
					},
					{
						kind: "simulate_unconstrained",
						account: sender.value,
						contract: contract.value,
						method: "balance_of_private",
						args: [getAddress(sender.value)],
					},
					{
						kind: "send_transaction",
						account: sender.value,
						actions: [
							{
								kind: "call",
								contract: contract.value,
								method: "transfer",
								args: [recipient.value, amount.value],
							}
						]
					},
				]
			},
		},
	};
}

const selectSender = (account) => {
	sender.value = account;
}

const tryToRestoreSession = async () => {
	try {
		loading.value = true;
		session.value = await web3Modal.getSession();
	}
	catch (error) {
		console.error("Failed to restore session:", error);
	}
	finally {
		loading.value = false;
	}
}

const connect = async () => {
	try {
		loading.value = true;
		session.value = await web3Modal.connect(buildConnectionParams());
	}
	catch (error) {
		console.error("Failed to connect:", error);
	}
	finally {
		loading.value = false;
	}
}

const disconnect = async () => {
	try {
		loading.value = true;
		await web3Modal.disconnect({
			topic: session.value.topic,
			reason: {
				message: "USER_DISCONNECTED",
				code: 5000,
			}
		})
		session.value = undefined;
	}
	catch (error) {
		console.error("Failed to disconnect:", error);
	}
	finally {
		loading.value = false;
	}
}

const execute = async() => {
	try {
		loading.value = true;
		result.value = await web3Modal.request(params.value);
	}
	catch (error) {
		console.error("Failed to execute:", error);
		result.value = error;
	}
	finally {
		loading.value = false;
	}
}

const onSessionDelete = () => {
	session.value = undefined;
}

const onSessionExpire = () => {
	session.value = undefined;
}

onBeforeMount(async () => {
	web3Modal = new WalletConnectModalSign({
		projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
		metadata: {
			name: "Azguard Test App (WC)",
			description: "Simple app showing how to interact with the Azguard Wallet via Wallet Connect",
			url: "https://azguardwallet.io/",
			icons: ["https://somestaffspace.fra1.digitaloceanspaces.com/logo.png"],
		},
	})
	web3Modal.onSessionDelete(onSessionDelete)
	web3Modal.onSessionExpire(onSessionExpire)

	await tryToRestoreSession();
})

watch(
	() => accounts.value,
	() => {
		selectSender(accounts.value.at(0));
	},
);

watch(
	() => [
		session.value,
		sender.value,
		contract.value,
		recipient.value,
		amount.value,
	],
	() => {
		params.value = buildExecutionParams();
	},
);
</script>

<template>
	<Flex justify="center">
		<Flex direction="column" align="center" justify="center" gap="12" :class="$style.wrapper">
			<template v-if="!session">
				<Flex direction="column" gap="12" :class="$style.section">
					<Flex
						@click="connect"
						align="center"
						justify="center"
						:class="[$style.button, $style.green, loading && $style.disabled]"
					>
						<Flex align="center" gap="6">
							<Text size="16" color="black">Connect</Text>
						</Flex>
					</Flex>
				</Flex>
			</template>
			<template v-else>
				<Flex justify="end" wide :style="{width: '450px'}">
					<JsonViewer v-if="showSession" @close="showSession = false" :data="session" :modal="true" />
					<Text @click="showSession = true" size="13" color="tertiary" :class="$style.session_info">View session info</Text>
				</Flex>
				<Flex direction="column" gap="16" :class="$style.section_big">
					<Flex direction="column" align="start" gap="6" :class="$style.accounts" :style="{width: '100%'}">
						<Text size="14" color="primary">Select Account</Text>

						<Text
							v-for="account in accounts"
							@click="selectSender(account)"
							size="13"
							color="secondary"
							:class="[$style.account, account === sender && $style.account_selected]"
						>
							{{ getAddress(account).substring(0, 14) }} ••• {{ getAddress(account).substring(58) }}
						</Text>
					</Flex>

					<Flex direction="column" align="start" gap="4" :style="{width: '100%'}">
						<Text size="14" color="primary">Token</Text>
						<input v-model="contract" :class="$style.input" />
					</Flex>

					<Flex direction="column" align="start" gap="4" :style="{width: '100%'}">
						<Text size="14" color="primary">Recipient</Text>
						<input v-model="recipient" :class="$style.input" />
					</Flex>

					<Flex direction="column" align="start" gap="4" :style="{width: '100%'}">
						<Text size="14" color="primary">Amount</Text>
						<input v-model="amount" :class="$style.input" />
					</Flex>

					<Flex direction="column" align="start" gap="4" :style="{width: '100%'}" wide>
						<Flex align="center" justify="between" wide>
							<Text size="14" color="primary">Params to send</Text>
							<Tooltip side="top" position="end">
								<Icon name="info" color="tertiary" />

								<template #content>
									<Flex :style="{width: '250px'}">
										<Text size="13" weight="500" color="primary">
											You can specify any parameters you want by editing the input below.
										</Text>
									</Flex>
								</template>
							</Tooltip>
							
						</Flex>
						
						<Flex align="start" direction="column" justify="start" gap="12" :class="$style.json_viewer">
							<JsonViewer v-model:data="params" />
						</Flex>
					</Flex>
				</Flex>
				<Flex direction="column" gap="12" :class="$style.section">
					<Flex align="center" justify="between" gap="24" wide>
						<Flex
							@click="disconnect"
							align="center"
							justify="center"
							:class="[$style.button, $style.gray, loading && $style.disabled]"
						>
							<Flex align="center" gap="6">
								<Text size="16" color="black">Disconnect</Text>
							</Flex>
						</Flex>

						<Flex
							@click="execute"
							align="center"
							justify="center"
							:class="[$style.button, $style.green, loading && $style.disabled]"
						>
							<Flex align="center" gap="6">
								<Text size="16" color="black">Send</Text>
							</Flex>
						</Flex>
					</Flex>
				</Flex>
				<Flex v-if="result" direction="column" gap="12" :class="$style.section">
					<Flex direction="column" align="start" gap="4" >
						<Text size="14" color="secondary">Response</Text>
						<Text size="14" color="secondary">
							<pre>{{ JSON.stringify(result, undefined, 4) }}</pre>
						</Text>
					</Flex>
				</Flex>
			</template>
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

.session_info {
	text-wrap: nowrap;
	cursor: pointer;

	&:hover {
		color: var(--txt-secondary);
	}
}

.section {
	width: 450px;
	max-height: 250px;

	overflow-y: auto;

	align-items: start;
	align-content: start;
	justify-items: start;
	justify-content: start;
}

.section_big {
	width: 450px;
	/* max-height: 500px; */

	overflow-y: auto;

	align-items: start;
	align-content: start;
	justify-items: start;
	justify-content: start;
}

.json_viewer {
	width: 450px;
	max-width: 450px;
	height: 250px;
	max-height: 250px;

	box-shadow: 0 0 0 1px var(--gray-5);
	border-radius: 8px;
}

.account {
	width: 100%;
	max-width: 100%;
	cursor: pointer;
}

.account_selected {
	color: var(--green);
}

.input {
	width: 100%;
	height: 30px;

	border: solid 1px var(--txt-support);
	/* box-shadow: 0 0 0 1px var(--txt-support); */
	border-radius: 4px;

	padding: 0 4px;

	background-color: var(--tooltip-background);
	/* background-color: var(--card-background); */

	font-size: 14px;
	font-family: "ClashGrotesk", "sans-serif";
	color: var(--txt-secondary);

	&:focus {
		color: var(--txt-primary);
	}
}

.input_big {
	width: 100%;
	height: 300px;

	padding: 0;

	/* background-color: var(--card-background); */
	background-color: var(--tooltip-background);

	font-size: 14px;
	font-family: "ClashGrotesk", "sans-serif";
	color: var(--txt-primary);
}

.button {
	width: 100%;
	height: 32px;

	border-radius: 8px;
	opacity: 0.8;
	cursor: pointer;

	transition: transform 0.1s ease;

	&:hover {
		box-shadow: 0 0 0 2px var(--op-5);
		opacity: 1;
	}

	&:active {
		transform: scale(0.99);
	}
}

.green {
	background: var(--green);
}

.gray {
	background: var(--op-30);
}

.disabled {
	opacity: 0.4;
	cursor: auto;
	pointer-events: none;

	&:hover {
		opacity: 0.4;
	}
}
</style>
