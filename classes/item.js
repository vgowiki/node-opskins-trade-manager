/* Errors */
const NotFound = require('../errors/notfound.js')

class Item {
  constructor(manager, raw) {
    this.manager = manager

    this._setProp(raw)
  }

  _setProp(raw) {
    Object.assign(this, raw)
  }

  async get() {
    const res = await this.manager.api.IItem.GetItemsById({ item_id: [this.id] })

    if(res.response.items.length) {
      this._setProp(res.response.items[0])
    } else {
      throw new NotFound()
    }

    return this
  }
}

module.exports = Item