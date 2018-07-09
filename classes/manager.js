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
  constructor({ api_key, tfa_secret, need_polling, polling_interval }) {
  	super()
    this.api = new tradeinterface(api_key)

    if(tfa_secret) this.op2fa = new op2fa(tfa_secret)

    this.poll_interval = (polling_interval) ? polling_interval : 1000
    this.polling = (need_polling) ? need_polling : true
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
          if(!offers[i].sent_by_you) this.emit('offer_new_received', offer)
          if(offers[i].sent_by_you) this.emit('offer_new_sent', offer)

          continue
        }

        if(this.offers[offers[i].id] != offers[i].state) {
          const offer = new Offer(this, offers[i])

          this.emit('offer_update', offer, this.offers[offers[i].id])
          if(!offers[i].sent_by_you) this.emit('offer_update_received', offer, this.offers[offers[i].id])
          if(offers[i].sent_by_you) this.emit('offer_update_sent', offer, this.offers[offers[i].id])

          this.offers[offers[i].id] = offers[i].state
        }
      }

      setTimeout(() => { this._poll() }, this.poll_interval)
    } catch(err) {
      console.error('Polling error:')
      console.error(err)

      setTimeout(() => { this._poll() }, this.poll_interval)
    }
  }
}

module.exports = Manager
