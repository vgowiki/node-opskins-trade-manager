/* Classes */
const Item = require('./item.js')

class IItem {
	constructor(manager) {
		this.manager = manager

		this.IItem = this.manager.api.IItem
	}

	async GetItemsById(params = {}) {
		const res = await this.IItem.GetItemsById(params)

		for(let i = 0; i < res.response.items.length; i++) {
			res.response.items[i] = new Item(this.manager, res.response.items[i])
		}

		const { items, unknown_items } = res.response

		return { items, unknown_items }
	}

	async GetItems(params) {
		const res = await this.IItem.GetItems(params)

		return res.response.items
	}
}

module.exports = IItem