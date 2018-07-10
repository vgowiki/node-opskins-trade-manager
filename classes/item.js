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
    const res = await (this.manager.replaced_methods ? this.manager.IItem.GetItemsById({ item_id: [this.id] }) : this.manager.api.IItem.GetItemsById({ item_id: [this.id] }))

    if(res.response.items.length) {
      this._setProp(res.response.items[0])
    } else {
      throw new NotFound()
    }

    return this
  }

  toJSON() {
    const object = { ...this }
    delete object.manager
    return object
  }
}

module.exports = Item