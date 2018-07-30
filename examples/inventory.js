const OpskinsManager = require('../index.js')
const manager = new OpskinsManager({ apikey: process.env.apikey, polling: false })

async function getInventory() {
  try {
  	const inventory = await manager.IUser.GetInventory({ app_id: 1, RECURSIVE: true })

  	console.log(JSON.stringify(inventory))
  } catch(err) {
    console.error(err)
  }
}

getInventory()