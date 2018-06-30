/* Errors */
const NotFound = require('../errors/notfound.js')
const Missing = require('../errors/missing.js')
const AccessDenied = require('../errors/accessdenied.js')

/* Classes */
const Item = require('./item.js')
const User = require('./user.js')

class Offer {
  constructor(manager, raw) {
    this.manager = manager

    this._setProp(raw)
  }

  _setProp(raw) {
  	Object.assign(this, raw)

    const sender_items = []
    for(let i = 0; i < this.sender.items.length; i++) {
      sender_items.push(new Item(this.manager, this.sender.items[i]))
    }

    const sender = {
    	uid: this.sender.uid,
    	steam_id: this.sender.steam_id,
    	display_name: this.sender.display_name,
    	avatar: this.sender.avatar,
    	is_our_profile: this.sent_by_you ? true : false
    }
    this.sender = { 
    	user: new User(this.manager, sender), 
    	items: sender_items 
    }

    const recipient_items = []
    for(let i = 0; i < this.recipient.items.length; i++) {
      recipient_items.push(new Item(this.manager, this.recipient.items[i]))
    }

    const recipient = {
    	uid: this.recipient.uid,
    	steam_id: this.recipient.steam_id,
    	display_name: this.recipient.display_name,
    	avatar: this.recipient.avatar,
    	is_our_profile: this.sent_by_you ? false : true
    }
    this.recipient = {
    	user: new User(this.manager, recipient),
    	items: recipient_items
    }
  }

  async get() {
    const res = await this.manager.api.ITrade.GetOffer({ offer_id: this.id })

    this._setProp(res.response.offer)

    return this
  }

  async accept(params = {}) {
  	if(this.state != 2) throw new AccessDenied('you cant accept unactive offer')
    if(!params.twofactor_code && !this.manager.op2fa) throw Missing('twofactor_code')
    if(!params.twofactor_code) params.twofactor_code = this.manager.op2fa.code()
    params.offer_id = this.id

    const res = await this.manager.api.ITrade.AcceptOffer(params)

    this._setProp(res.response.offer)

    const new_items = []
    for(let i = 0; i < res.response.new_items.length; i++) {
      new_items.push(new Item(this.manager, res.response.new_items[i]))
    }

    return new_items
  }

  async cancel() {
  	if(this.state != 2) throw new AccessDenied('you cant cancel unactive offer')
  		
    const res = await this.manager.api.ITrade.CancelOffer({ offer_id: this.id })

    this._setProp(res.response.offer)

    return this
  }

  /* In development
  async send(params = {}) {
  	if(this.state == 2 || this.state == 9) throw AccessDenied('you cant re-send unprocessed offer')
  	const res = await this._apit.ITrade.SendOfferToSteamId({ steam_id, items })
  }
  */
}

module.exports = Offer