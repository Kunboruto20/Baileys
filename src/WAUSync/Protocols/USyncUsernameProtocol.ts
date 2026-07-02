import type { USyncQueryProtocol } from '../../Types/USync'
import { assertNodeErrorFree, type BinaryNode } from '../../WABinary'

export type UsernameData = {
	username?: string
	lid?: string
	isDeleted?: boolean
}

export class USyncUsernameProtocol implements USyncQueryProtocol {
	name = 'username'

	getQueryElement(): BinaryNode {
		return {
			tag: 'username',
			attrs: {}
		}
	}

	getUserElement(): null {
		return null
	}

	parser(node: BinaryNode): UsernameData | null {
		if (node.tag === 'username') {
			assertNodeErrorFree(node)
			const username = typeof node.content === 'string' ? node.content : node.attrs.username || node.attrs.val
			return {
				username: username || undefined,
				lid: node.attrs.lid,
				isDeleted: node.attrs['is_username_deleted'] === 'true' || node.attrs.deleted === 'true'
			}
		}

		return null
	}
}
