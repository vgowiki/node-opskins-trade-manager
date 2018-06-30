/* Errors */
const NotFound = require('../errors/notfound.js')
const AccessDenied = require('../errors/accessdenied.js')

/* Classes */
const Item = require('./item.js')

class User {
	constructor(manager, raw) {
		this.manager = manager

		this.is_our_profile = false

		this._setProp(raw)
	}

	_setProp(raw) {
		Object.assign(this, raw)
	}

	async getNameAndAvatar() {
		if(this.uid) {
			const res = await this.manager.api.ITrade.GetUserInventory({ app_id: 1, uid: this.uid })

			this.avatar = res.response.user_data.avatar
			this.display_name = res.response.user_data.display_name
		} else if(this.steam_id) {
			const res = await this.manager.api.ITrade.GetUserInventoryFromSteamId({ app_id: 1, steam_id: this.steam_id })

			this.avatar = res.response.user_data.avatar
			this.display_name = res.response.user_data.display_name
		} else {
			throw NotFound()
		}

		return this
	}

	async getInventory(params = {}) {
		if(this.uid) {
			params.uid = this.uid

			const res = await this.manager.api.ITrade.GetUserInventory(params)

			for(let i = 0; i < res.response.items.length; i++) {
	  		res.response.items[i] = new Item(this.manager, res.response.items[i])
	  	}

			this.avatar = res.response.user_data.avatar
			this.display_name = res.response.user_data.display_name
			this.items = res.response.items

			return res.response.items
		} else if(this.steam_id) {
			params.steam_id = this.steam_id

			const res = await this.manager.api.ITrade.GetUserInventoryFromSteamId(params)

			for(let i = 0; i < res.response.items.length; i++) {
	  		res.response.items[i] = new Item(this.manager, res.response.items[i])
	  	}

			this.avatar = res.response.user_data.avatar
			this.display_name = res.response.user_data.display_name
			this.items = res.response.items

			return res.response.items
		} else {
			throw NotFound()
		}
	}

	async getProfile(params = {}) {
		if(!this.is_our_profile) throw new AccessDenied('you cant get profile that is not yours')

		const res = await this.manager.api.IUser.GetProfile(params)

		this._setProp(res.response.user)

		return res.response.user
	}

	async updateProfile(params = {}) {
		if(!this.is_our_profile) throw new AccessDenied('you cant update profile that is not yours')

		const res = await this.manager.api.IUser.UpdateProfile(params)

		this._setProp(res.response.user)

		return res.response.user
	}
}

module.exports = User