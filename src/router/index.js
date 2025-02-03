/** Vendor */
import { createRouter, createWebHistory } from "vue-router"

/** Views */
import AzguardSDK from "@/views/AzguardSDK.vue"
import WalletConnect from "@/views/WalletConnect.vue"

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "App",
			redirect: { name: "Azguard SDK" }
		},
		{
			path: "/sdk",
			name: "Azguard SDK",
			component: AzguardSDK,
		},
		{
			path: "/wc",
			name: "Wallet Connect",
			component: WalletConnect,
		},
		{
			path: '/:catchAll(.*)*',
			name: "NotFound",
			redirect: { name: "Azguard SDK" }
		}
	],
})

export default router
