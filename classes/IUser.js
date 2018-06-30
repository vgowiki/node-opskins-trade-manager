/* Classes */
const Item = require('./item.js')
const User = require('./user.js')

class IUser {
	constructor(manager) {
		this.manager = manager

		this.IUser = this.manager.api.IUser
	}

	async GetInventory(params = {}) {
		const res = await this.IUser.GetInventory(params)

		for(let i = 0; i < res.response.items.length; i++) {
			res.response.items[i] = new Item(this.manager, res.response.items[i])
		}

		return res.response.items
	}

	async GetProfile(params = {}) {
		const res = await this.IUser.GetProfile(params)

		res.response.user.uid = res.response.user.id
		res.response.user.is_our_profile = true

		return new User(this.manager, res.response.user)
	}

	async UpdateProfile(params = {}) {
		const res = await this.IUser.UpdateProfile(params)

		res.response.user.uid = res.response.user.id
		res.response.user.is_our_profile = true

		return new User(this.manager, res.response.user)
	}
}

module.exports = IUser