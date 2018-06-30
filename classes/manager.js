const tradeinterface = require('opskins-trade-interface')
const EventEmitter = require('events')
const op2fa = require('opskins-2fa')

/* Errors */
const Type = require('../errors/type.js')
const Missing = require('../errors/missing.js')
const Invalid = require('../errors/invalid.js')

/* Classes */
const Offer = require('./offer.js')
const ITrade = require('./ITrade.js')
const IItem = require('./IItem.js')
const IUser = require('./IUser.js')

class Manager extends EventEmitter {
  constructor(apikey, twofactor_secret = null, polling = true, poll_interval = 1000) {
  	super()
    this.api = new tradeinterface(apikey)

    if(twofactor_secret) this.op2fa = new op2fa(twofactor_secret)

    this.poll_interval = poll_interval
    this.polling = polling
    this.offers = {}

    if(this.polling) this._poll()

    this.ITrade = new ITrade(this)
  	this.IUser = new IUser(this)
    this.IItem = new IItem(this)
  }

  async _poll() {
    try {
      const res = await this.api.ITrade.GetOffers()
      const { offers } = res.response

      for(let i = 0; i < offers.length; i++) {
        if(!this.offers[offers[i].id]) {
          this.offers[offers[i].id] = offers[i].state

          const offer = new Offer(this, offers[i])

          this.emit('offer_new', offer)
          if(offers[i].type == 'received') this.emit('offer_new_received', offer)
          if(offers[i].type == 'sent') this.emit('offer_new_sent', offer)

          continue
        }

        if(this.offers[offers[i].id] != offers[i].state) {
          const offer = new Offer(this, offers[i])

          this.emit('offer_update', offer, this.offers[offers[i].id])
          if(offers[i].type == 'received') this.emit('offer_update_received', offer, this.offers[offers[i].id])
          if(offers[i].type == 'sent') this.emit('offer_update_sent', offer, this.offers[offers[i].id])

          this.offers[offers[i].id] = offers[i].state
        }
      }

      setTimeout(() => { this._poll() }, this.poll_interval)
    } catch(err) {
      console.error('Polling error:', err)

      setTimeout(() => { this._poll() }, this.poll_interval)
    }
  }
}

module.exports = Manager