import type { BinaryNode } from '../../WABinary'
import { parseWhatsAppUsername, USyncContactProtocol, USyncQuery, USyncUser } from '../../WAUSync'
import { USyncUsernameProtocol } from '../../WAUSync/Protocols'

describe('USync username support', () => {
	it('parses plain usernames and username URIs', () => {
		expect(parseWhatsAppUsername('@Baileys123')).toEqual({ username: 'Baileys123', usernameKey: undefined })
		expect(parseWhatsAppUsername('https://wa.me/@Baileys123?pin=1234')).toEqual({
			username: 'Baileys123',
			usernameKey: '1234'
		})
		expect(parseWhatsAppUsername('whatsapp://send?username=@Baileys123&key=5678')).toEqual({
			username: 'Baileys123',
			usernameKey: '5678'
		})
	})

	it('builds contact query user nodes with username and username key', () => {
		const user = new USyncUser().withUsernameUri('https://wa.me/@Baileys123?pin=1234').withLid('123@lid')
		const protocol = new USyncContactProtocol()

		expect(protocol.getUserElement(user)).toEqual({
			tag: 'contact',
			attrs: {
				username: 'Baileys123',
				pin: '1234',
				lid: '123@lid'
			}
		})
	})

	it('keeps username protocol query-only and parses username metadata', () => {
		const protocol = new USyncUsernameProtocol()

		expect(protocol.getUserElement()).toBeNull()

		expect(protocol.parser({ tag: 'username', attrs: { lid: '123@lid' }, content: 'Baileys123' })).toEqual({
			username: 'Baileys123',
			lid: '123@lid',
			isDeleted: false
		})
	})

	it('parses usync username query results', () => {
		const query = new USyncQuery().withContactProtocol().withUsernameProtocol()
		const result: BinaryNode = {
			tag: 'iq',
			attrs: { type: 'result' },
			content: [
				{
					tag: 'usync',
					attrs: {},
					content: [
						{
							tag: 'list',
							attrs: {},
							content: [
								{
									tag: 'user',
									attrs: { jid: '123@lid' },
									content: [
										{ tag: 'contact', attrs: { type: 'in' } },
										{ tag: 'username', attrs: { lid: '123@lid' }, content: 'Baileys123' }
									]
								}
							]
						}
					]
				}
			]
		}

		expect(query.parseUSyncQueryResult(result)).toEqual({
			list: [
				{
					id: '123@lid',
					contact: true,
					username: {
						username: 'Baileys123',
						lid: '123@lid',
						isDeleted: false
					}
				}
			],
			sideList: []
		})
	})
})
