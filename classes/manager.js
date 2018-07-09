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
  constructor({ apikey, secret = null, polling = true, poll_interval = 1000 }) {
  	super()
    this.api = new tradeinterface(apikey)

    if(secret) this.op2fa = new op2fa(secret)

    this.poll_interval = poll_interval
    this.poll_timeout = 0
    this.polling = polling
    this.offers = {}

    if(this.polling) this._poll()

    this.ITrade = new ITrade(this)
  	this.IUser = new IUser(this)
    this.IItem = new IItem(this)
  }

  enablePolling() {
    if(this.polling) return false

    this.polling = true
    this._poll()

    return true
  }

  disablePolling() {
    if(!this.polling) return false

    this.polling = false
    clearTimeout(this.poll_timeout)

    return true
  }

  async _poll() {
    if(!this.polling) return

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

      this.poll_timeout = setTimeout(() => { this._poll() }, this.poll_interval)
    } catch(err) {
      console.error('Polling error:')
      console.error(err)

      this.poll_timeout = setTimeout(() => { this._poll() }, this.poll_interval)
    }
  }
}

module.exports = Manager