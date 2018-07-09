const { expect } = require('chai')

/* Classes */
const OpskinsManager = require('../index.js')
const Item = require('../classes/item.js')
const User = require('../classes/user.js')
const Offer = require('../classes/offer.js')

/* Managers */
const manager1 = new OpskinsManager({
  apikey: process.env.apikey1,
  secret: process.env.secret1
})
const manager2 = new OpskinsManager({
  apikey: process.env.apikey2,
  secret: process.env.secret2
})

/* Variables */
let item = null
let display_name = 'feed4rz' + Math.floor(Math.random() * 100000000)
let remembered_name = ''
let tradeurl = ''
let tradeurl2 = ''
let message = Math.floor(Math.random() * 100000000).toString()
let remoffer = null
let sendoffer = 0

describe('IUser', async() => {
  it('GetInventory', async() => {
    const items = await manager1.IUser.GetInventory({ app_id: 1, RECURSIVE: true })

    for(let i = 0; i < items.length; i++) {
      expect(items[i] instanceof Item).to.equal(true)
    }

    item = items[Math.floor(Math.random() * items.length)]
  })
  it('GetProfile', async() => {
    const profile = await manager1.IUser.GetProfile()

    expect(profile instanceof User).to.equal(true)
    expect(profile.is_our_profile).to.equal(true)

    remembered_name = profile.display_name
  })
  it('UpdateProfile', async() => {
    let profile = await manager1.IUser.UpdateProfile({ display_name })

    expect(profile instanceof User).to.equal(true)
    expect(profile.display_name).to.equal(display_name)
    expect(profile.is_our_profile).to.equal(true)

    await profile.updateProfile({ display_name: remembered_name })

    expect(profile.display_name).to.equal(remembered_name)
  })
})

describe('ITrade', async() => {
  it('GetTradeURL', async() => {
    const res = await manager2.ITrade.GetTradeURL()

    tradeurl = res.short_url

    const res2 = await manager1.ITrade.GetTradeURL()

    tradeurl2 = res2.short_url

    expect(tradeurl.match(/^((https:\/\/trade\.opskins\.com\/t\/([0-9]{1,})\/([a-zA-Z0-9]{8}))|(https:\/\/trade\.opskins\.com\/trade\/userid\/([0-9]{1,})\/token\/([a-zA-Z0-9]{8})))$/)[0]).to.equal(tradeurl)
    expect(tradeurl2.match(/^((https:\/\/trade\.opskins\.com\/t\/([0-9]{1,})\/([a-zA-Z0-9]{8}))|(https:\/\/trade\.opskins\.com\/trade\/userid\/([0-9]{1,})\/token\/([a-zA-Z0-9]{8})))$/)[0]).to.equal(tradeurl2)
  })
  it('SendOffer out', done => {
    sendOffer(done)
  }).timeout(5000)
  it('Offer.cancel', done => {
    cancelOffer(done)
  }).timeout(5000)
  it('SendOffer in', done => {
    sendOfferIn(done)
  }).timeout(5000)
})

async function sendOfferIn(done) {
  const items = item
  const splitted = tradeurl2.replace('https://trade.opskins.com/t/', '').replace('https://trade.opskins.com/trade/userid/', '').replace('token/', '').split('/')
  const uid = splitted[0]
  const token = splitted[1]
  const offer = await manager2.ITrade.SendOffer({ uid, token, items, message, SKIP2FA: true })

  const canceled = await offer.cancel()
  expect(canceled.state).to.equal(6)

  done()
}

async function sendOffer(done) {
  const items = item
  const splitted = tradeurl.replace('https://trade.opskins.com/t/', '').replace('https://trade.opskins.com/trade/userid/', '').replace('token/', '').split('/')
  const uid = splitted[0]
  const token = splitted[1]
  const offer = await manager1.ITrade.SendOffer({ uid, token, items, message })

  manager1.once('offer_new', async(newoffer) => {
    expect(newoffer instanceof Offer).to.equal(true)
    expect(newoffer.id).to.equal(offer.id)
    expect(newoffer.sent_by_you).to.equal(true)
    expect(newoffer.message).to.equal(message)
    expect(newoffer.state).to.equal(2)
    expect(newoffer.sender.user instanceof User).to.equal(true)
    expect(newoffer.sender.items.every(el => { return el instanceof Item })).to.equal(true)
    expect(newoffer.recipient.user instanceof User).to.equal(true)
    expect(newoffer.sender.items.every(el => { return el instanceof Item })).to.equal(true)
    expect(newoffer).to.have.any.keys([
      'id',
      'sender',
      'recipient',
      'state',
      'state_name',
      'time_created',
      'time_updated',
      'time_expires',
      'message',
      'sent_by_you'
    ])

    sendoffer++
    if(sendoffer == 2) done()
  })

  manager2.once('offer_new', newoffer => {
    remoffer = newoffer

    sendoffer++
    if(sendoffer == 2) done()
  })

  expect(offer instanceof Offer).to.equal(true)
  expect(offer.sender.user instanceof User).to.equal(true)
  expect(offer.sender.items.every(el => { return el instanceof Item })).to.equal(true)
  expect(offer.recipient.user instanceof User).to.equal(true)
  expect(offer.sender.items.every(el => { return el instanceof Item })).to.equal(true)
  expect(offer).to.have.any.keys([
    'id',
    'sender',
    'recipient',
    'state',
    'state_name',
    'time_created',
    'time_updated',
    'time_expires',
    'message',
    'sent_by_you'
  ])
  expect(offer.sent_by_you).to.equal(true)
  expect(offer.message).to.equal(message)
  expect(offer.state).to.equal(2)
}


async function cancelOffer(done) {
  manager1.once('offer_update_sent', async(update, old_state) => {
    expect(update instanceof Offer).to.equal(true)
    expect(update.id).to.equal(remoffer.id)
    expect(update.state).to.equal(7)

    try {
      await update.accept()
    } catch(err) {
      expect(err.message).to.equal('you cant accept unactive offer')

      done()
    }
  })

  const cancel = await remoffer.cancel()

  expect(cancel.id).to.equal(remoffer.id)
  expect(cancel.state).to.equal(7)
}