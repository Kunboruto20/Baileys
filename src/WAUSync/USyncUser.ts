export type ParsedUsername = {
	username: string
	usernameKey?: string
}

const USERNAME_URI_PROTOCOLS = new Set(['http:', 'https:', 'whatsapp:'])

export const normalizeWhatsAppUsername = (username: string) => username.trim().replace(/^@+/, '')

export const parseWhatsAppUsername = (usernameOrUri: string): ParsedUsername => {
	const value = usernameOrUri.trim()
	let username = value
	let usernameKey: string | undefined

	try {
		const uri = new URL(value)
		if (USERNAME_URI_PROTOCOLS.has(uri.protocol)) {
			username =
				uri.searchParams.get('username') ||
				uri.searchParams.get('user') ||
				uri.pathname.split('/').filter(Boolean).at(-1) ||
				value
			usernameKey = uri.searchParams.get('pin') || uri.searchParams.get('key') || undefined
		}
	} catch {
		const [usernamePart, queryString] = value.split('?', 2)
		username = usernamePart || value
		if (queryString) {
			const params = new URLSearchParams(queryString)
			usernameKey = params.get('pin') || params.get('key') || undefined
		}
	}

	return {
		username: normalizeWhatsAppUsername(decodeURIComponent(username)),
		usernameKey: usernameKey ? decodeURIComponent(usernameKey) : undefined
	}
}

export class USyncUser {
	id?: string
	lid?: string
	phone?: string
	username?: string
	usernameKey?: string
	type?: string
	personaId?: string

	withId(id: string) {
		this.id = id
		return this
	}

	withLid(lid: string) {
		this.lid = lid
		return this
	}

	withPhone(phone: string) {
		this.phone = phone
		return this
	}

	withUsername(username: string) {
		this.username = normalizeWhatsAppUsername(username)
		return this
	}

	withUsernameUri(usernameUri: string) {
		const parsed = parseWhatsAppUsername(usernameUri)
		this.username = parsed.username
		this.usernameKey = parsed.usernameKey
		return this
	}

	withUsernameKey(usernameKey: string) {
		this.usernameKey = usernameKey
		return this
	}

	withType(type: string) {
		this.type = type
		return this
	}

	withPersonaId(personaId: string) {
		this.personaId = personaId
		return this
	}
}
