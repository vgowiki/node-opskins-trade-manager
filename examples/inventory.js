const OpskinsManager = require('../index.js')
const manager = new OpskinsManager({ apikey: process.env.apikey, polling: false })

async function getInventory() {
  try {
  	console.time('inventory')
  	const inventory = await manager.IUser.GetInventory({ app_id: 1, RECURSIVE: true })
  	console.timeEnd('inventory')

  	console.log(inventory.length)
  } catch(err) {
    console.error(err)
  }
}

getInventory()