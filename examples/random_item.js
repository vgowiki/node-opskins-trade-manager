const OpskinsManager = require('../index.js')
const manager = new OpskinsManager({ apikey: process.env.apikey, secret: process.env.secret })

manager.on('offer_new', offer => {
  console.log('new offer:', offer.id)
})
// manager.on('offer_new_received')
// manager.on('offer_new_sent')

manager.on('offer_update', (offer, old_state) => {
  console.log('offer update:', offer.id, `${old_state} -> ${offer.state}`)
})
// manager.on('offer_update_received')
// manager.on('offer_update_sent')

async function randomItem(tradeurl) {
  try {
  	const inventory = await manager.IUser.GetInventory({ app_id: 1, RECURSIVE: true })

  	const items = inventory[Math.floor(Math.random() * inventory.length)]
  	const params = { items, tradeurl }

  	const offer = await manager.ITrade.SendOffer(params)

  	console.log(offer)
  } catch(err) {
    console.error(err)
  }
}

//randomItem(process.env.tradeurl)