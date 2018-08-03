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
  constructor({ apikey, secret = null, polling = true, poll_interval = 2000, replace_methods = false }) {
    super()
    this.api = new tradeinterface(apikey)

    if(secret) this.op2fa = new op2fa(secret)

    this.poll_timer = setInterval(() => this._poll(), poll_interval)
    this.poll_timeout = 0
    this.polling = polling
    this.offers = {}

    if(!replace_methods) {
      this.ITrade = new ITrade(this)
      this.IUser = new IUser(this)
      this.IItem = new IItem(this)

      this.replaced_methods = false
    } else {
      Object.assign(this, this.api)

      delete this.api

      this.replaced_methods = true
    }
  }

  enablePolling() {
    this.polling = true

    return true
  }

  disablePolling() {
    this.polling = false

    return true
  }

  async _poll() {
    if(!this.polling) return

    try {
      const res = await (this.replaced_methods ? this.ITrade.GetOffers() : this.api.ITrade.GetOffers())
      const { offers } = res.response

      for(let i = 0; i < offers.length; i++) {
        if(!this.offers[offers[i].id]) {
          this.offers[offers[i].id] = offers[i].state
          
          const keys = Object.keys(this.offers)
          if(keys.length == 101) delete this.offers[keys[0]]

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
    } catch(err) {
      console.error('Polling error:')
      console.error(err)
    }
  }
}

module.exports = Manager