# opskins-trade-manager
NodeJS trade manager for trade.opskins.com API

# Contents
- [Installation](#install)
- [Usage](#usage)
- [Manager](#manager)


# Install
Clone this repo and include **index.js** or install via npm:
```
npm install opskins-trade-manager
```


# Usage
Requiring a module returns [API](#api) class:
```JS
const Manager = require('opskins-trade-manager')

const manager = new Manager({
  apikey: "APIKEY", // opskins apikey
  secret: "SECRET" // opskins 2fa secret key
})

// Get random item from inventory and send an offer to tradeurl
async function sendOffer(tradeurl) {
  const inventory = await manager.IUser.GetInventory({ app_id: 1, RECURSIVE: true }) // returns array[Item class]
  
  const items = inventory[Math.floor(Math.random() * inventory.length)]
  const message = 'Hello from opskins-trade-manager!'
  
  const offer = await manager.ITrade.SendOffer({ tradeurl, items, message }) // returns Offer class
  
  return offer
}

sendOffer(TRADEURL) // trade.opskins.com/settings
```


# Manager
API constructor can accept several parameters, some of which are required:
- **apikey** (required) - opskins apikey, can be retrieved from [Account Settings](https://opskins.com/?loc=store_account)
- **secret** (optional, null by default) - opskins 2fa secret, can be retrieved either by exporting your secret keys from auth app that you use (Google authenticator, Authy, etc) or in a process of creating new 2fa secret in [Opskins settings](https://opskins.com/?loc=store_account)
- **polling** (optional, true by default) - automatic offer polling. Uses ITrade.GetOffers() method to retrieve info about last 100 offers and then [emits](#events) them
- **polling_interval** (optional, 1000 ms by default) - how often the polling function is called
- **replace_methods** (optional, false by default) - if true, replaces custom ITrade, IUser and IItem method collections of [Manager](#manager) class to low level implementations of [Trade opskins HTTP API](https://github.com/opskins/trade-opskins-api). Read more in [low level methods](#low-level-methods)

## Method collections
todo
