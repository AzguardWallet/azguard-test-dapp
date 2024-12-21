/** Vendor */
import { createRouter, createWebHistory } from "vue-router"

/** Views */
import WalletConnect from "@/views/WalletConnect.vue"
import AzguardSDK from "@/views/AzguardSDK.vue"

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "App",
			component: WalletConnect,
		},
		{
			path: "/wc",
			name: "Wallet Connect",
			component: WalletConnect,
		},
		{
			path: "/sdk",
			name: "Azguard SDK",
			component: AzguardSDK,
		},
		{
			path: '/:catchAll(.*)*',
			name: "NotFound",
			redirect: { name: "App" }
		}
	],
})

export default router
