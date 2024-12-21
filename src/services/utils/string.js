export const capitalize = (s) => {
	if (!s) return ''

	return s.charAt(0).toUpperCase() + s.slice(1)
}

export const shortHash = (hash) => {
	if (!hash) return ''

	if (hash.length > 16) return `${hash.slice(0, 4)} ••• ${hash.slice(-4)}`
	return hash

}

export const midHash = (hash) => {
	if (!hash) return ''
	
	if (hash.length > 24)
		return `${hash.slice(0, 4)} ${hash.slice(4, 8)} ••• ${hash.slice(-8,-4)} ${hash.slice(-4)}`
	return hash
}

export const longHash = (hash) => {
	if (!hash) return ''
	
	if (hash.length > 24) {
		return `${hash.slice(0, 4)} ${hash.slice(4, 8)} ${hash.slice(8, 12)} ${hash.slice(12, 16)} ${hash.slice(16, 20)} ••• ${hash.slice(-20,-16)} ${hash.slice(-12,-8)} ${hash.slice(-8,-4)} ${hash.slice(-4)}`
	}

	return hash
}
