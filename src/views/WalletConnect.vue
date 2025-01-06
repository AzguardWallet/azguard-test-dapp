<script setup>
/** Vendor */
import { computed, onMounted, ref, watch } from 'vue';
import { WalletConnectModalSign } from "@walletconnect/modal-sign-html"

/** UI */
import JsonViewer from "@/components/ui/JsonViewer/JsonViewer.vue"
import Tooltip from '@/components/ui/Tooltip.vue'

/** Utils */
import { longHash } from "@/services/utils"

/** Store */
import { clearStorage, getAccounts, getSession, updateAccounts, updateConnectionStatus, updateSession } from "@/stores/wallet.js"

const session = ref()
const accounts = ref([])
const connected = ref()

const selectedAccount = ref()
const sendPayload = ref()
const sendPayloadView = ref()

const viewSession = ref(false)

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID
const metadata = {
    name: "Azguard Test App",
    description: "Azguard Test App description",
    url: "https://azguardwallet.io/",
    icons: ["https://somestaffspace.fra1.digitaloceanspaces.com/logo.png"],
}

const web3Modal = new WalletConnectModalSign({
	projectId,
	metadata,
})
web3Modal.onSessionDelete(() => dropSession())
web3Modal.onSessionExpire(() => dropSession())

const isConnecting = ref(false)
const isSending = ref(false)

async function checkIfSessionExists() {
	let sess =  await web3Modal.getSession()
	if (sess) {
		session.value = sess
		let accs = session.value?.namespaces.aztec.accounts
		accounts.value = accs.map(acc => acc.split(":").pop())
		selectedAccount.value = accounts.value[0]
		connected.value = true

		updateSession(session.value)
		updateAccounts(accounts.value)
		updateConnectionStatus(connected.value)
	}
}

async function connect() {
	await checkIfSessionExists()
	if (session.value) return

	try {
		isConnecting.value = true

		session.value = await web3Modal.connect({
			requiredNamespaces: {
				aztec: {
					chains: ["aztec:31337"],
					methods: ["aztec_execute"],
					events: ["accountsChanged"],
				},
			},
			optionalNamespaces: {
				aztec: {
					chains: ["aztec:41337", "aztec:51337"],
					methods: ["aztec_execute"],
					events: ["accountsChanged"],
				},
			},
		});
		
		let accs = session.value?.namespaces.aztec.accounts
		accounts.value = accs.map(acc => acc.split(":").pop())
		selectedAccount.value = accounts.value[0]
		connected.value = true

		updateSession(session.value)
		updateAccounts(accounts.value)
		updateConnectionStatus(connected.value)
	} catch (err) {
		console.error(err);
	} finally {
		isConnecting.value = false
	}
}

function dropSession() {
	session.value = undefined
	accounts.value = []
	connected.value = false
	clearStorage()
}

async function disconnect() {
	try {
		await web3Modal.disconnect({
			topic: session.value.topic,
			reason: {
				message: "USER_DISCONNECTED",
				code: 5000,
			}
		})
	} catch (err) {
		console.error(err);
	} finally {
		dropSession()
	}
}

async function sendRequest () {
	try {
		isSending.value = true
		await web3Modal.request(JSON.parse(sendPayloadView.value))
	} catch (err) {
		console.error(err);
	} finally {
		isSending.value = false
	}
}

async function sendEvent() {
  
}

const handleCloseSessionView = () => {
	viewSession.value = false
}

const handleSelectAccount = (acc) => {
	selectedAccount.value = acc
}

const addressFrom = computed(() => selectedAccount.value)
const addressTo = ref("0x02c2a6d5a406673674d8405ecb48f7cb26322a6b7d7724ee1b47be8c61d0467f")
const contract = ref("0x03f5eb79b443df7879b6903082dc0585d235011fdf42c91594c72dce2d64adc3")
const amount = ref("100")

const params = computed(() => {
	return [
		{
			kind: "call",
			contract: contract.value,
			method: "transfer",
			args: [addressTo.value, 1],
		},
		{
			kind: "add_capsule",
			capsule: [contract.value],
		},
		{
			kind: "add_contact",
			address: contract.value,
		},
		{
			kind: "authorize_call",
			isPublic: false,
			caller: addressFrom.value,
			contract: contract.value,
			method: "transfer_in_public",
			args: [addressFrom.value, addressTo.value, amount.value, 0],
		},
		{
			kind: "authorize_call",
			isPublic: true,
			caller: addressFrom.value,
			contract: contract.value,
			method: "transfer_in_public",
			args: [addressFrom.value, addressTo.value, amount.value, 0],
		},
		{
			kind: "authorize_intent",
			isPublic: false,
			consumer: contract.value,
			intent: [addressTo.value],
		},
		{
			kind: "authorize_intent",
			isPublic: true,
			consumer: contract.value,
			intent: [addressTo.value],
		},
		{
			kind: "call",
			contract: contract.value,
			method: "transfer_in_public",
			args: [addressFrom.value, addressTo.value, amount.value, 0],
		},
		{
			kind: "call",
			contract: contract.value,
			method: "transfer_in_public",
			args: [addressFrom.value, addressTo.value, amount.value, 0],
		},
	]
})

watch(
	() => session.value,
	() => {
		if (session.value) {
			sendPayload.value = {
				topic: session.value.topic,
				request: {
					method: "aztec_execute",
					account: selectedAccount.value,
					params: params,
				},
				chainId: "aztec:31337",
			}

			addressFrom.value = selectedAccount.value
		} else {
			sendPayload.value = ""
		}
	},
)

watch(
	() => [selectedAccount.value, addressFrom.value, addressTo.value, contract.value, amount.value],
	() => {
		sendPayload.value = {
			topic: session.value.topic,
			request: {
				method: "aztec_execute",
				account: selectedAccount.value,
				params: params.value,
			},
			chainId: "aztec:31337",
		}
	}
)

watch(
	() => sendPayload.value,
	() => {
		sendPayloadView.value = JSON.stringify(sendPayload.value, null, 2)
	}
)

onMounted(async () => {
	session.value = getSession()
	if (!session.value) {
		checkIfSessionExists()
	} else {
		accounts.value = getAccounts()
		selectedAccount.value = accounts.value[0]
		connected.value = true
	}
})
</script>

<template>
	<Flex justify="center">
		<Flex direction="column" align="center" justify="center" gap="12" :class="$style.wrapper">

			<Flex v-if="connected && session" justify="end" wide :style="{width: '450px'}">
				<JsonViewer v-if="viewSession" @close="handleCloseSessionView" :data="session" :modal="true" />

				<Text @click="viewSession = true" size="13" color="tertiary" :class="$style.session_info">View session info</Text>
			</Flex>

			<Flex v-if="connected" direction="column" gap="16" :class="$style.section_big">
				<Flex direction="column" align="start" gap="6" :class="$style.accounts" :style="{width: '100%'}">
					<Text size="14" color="primary">Select Account</Text>

					<Text
						v-for="acc in accounts"
						@click="handleSelectAccount(acc)"
						size="13"
						color="secondary"
						:class="[$style.account, selectedAccount === acc && $style.account_selected]"
					>
						{{ longHash(acc) }}
					</Text>
				</Flex>

				<Flex direction="column" align="start" gap="4" :style="{width: '100%'}">
					<Text size="14" color="primary">Token</Text>
					<input v-model="contract" :class="$style.input" />
				</Flex>

				<Flex direction="column" align="start" gap="4" :style="{width: '100%'}">
					<Text size="14" color="primary">Recipient</Text>
					<input v-model="addressTo" :class="$style.input" />
				</Flex>

				<Flex direction="column" align="start" gap="4" :style="{width: '100%'}">
					<Text size="14" color="primary">Amount</Text>
					<input v-model="amount" :class="$style.input" />
				</Flex>

				<Flex direction="column" align="start" gap="4" :style="{width: '100%'}" wide>
					<Flex align="center" justify="between" wide>
						<Text size="14" color="primary">Payload to send</Text>
						<Tooltip side="top" position="end">
							<Icon name="info" color="tertiary" />

							<template #content>
								<Flex :style="{width: '250px'}">
									<Text size="13" weight="500" color="primary">
										Changes to fields above are reflected in payload, which can also be edited directly in viewer.
										The final payload will be sent.
									</Text>
								</Flex>
							</template>
						</Tooltip>
						
					</Flex>
					
					<Flex align="start" direction="column" justify="start" gap="12" :class="$style.json_viewer">
						<JsonViewer v-model:data="sendPayload" />
					</Flex>
				</Flex>
			</Flex>

			<Flex direction="column" gap="12" :class="$style.section">
				<Flex
					v-if="!connected"
					@click="connect"
					align="center"
					justify="center"
					:class="[$style.button, $style.green, isConnecting && $style.disabled]"
				>
					<Flex align="center" gap="6">
						<Text size="16" color="black">Connect</Text>
					</Flex>
				</Flex>

				<Flex v-if="connected" align="center" justify="between" gap="24" wide>
					<Flex
						@click="disconnect"
						align="center"
						justify="center"
						:class="[$style.button, $style.gray]"
					>
						<Flex align="center" gap="6">
							<Text size="16" color="black">Disconnect</Text>
						</Flex>
					</Flex>

					<Flex
						@click="sendRequest"
						align="center"
						justify="center"
						:class="[$style.button, $style.green, (isSending || !sendPayloadView) && $style.disabled]"
					>
						<Flex align="center" gap="6">
							<Text size="16" color="black">Send</Text>
						</Flex>
					</Flex>
				</Flex>
			</Flex>
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
