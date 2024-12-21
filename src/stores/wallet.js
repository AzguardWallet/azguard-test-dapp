export function getSession () {
    return JSON.parse(localStorage.getItem('session'))
}

export function getAccounts () {
    return JSON.parse(localStorage.getItem('accounts'))
}

export function getConnectionStatus () {
    return JSON.parse(localStorage.getItem('isConnected'))
}

export function updateSession (session) {
    localStorage.setItem('session', JSON.stringify(session))
}

export function updateAccounts (accounts) {
    localStorage.setItem('accounts', JSON.stringify(accounts))
}

export function updateConnectionStatus (status) {
    localStorage.setItem('isConnected', JSON.stringify(status))
}

export function clearStorage() {
    localStorage.clear()
}
