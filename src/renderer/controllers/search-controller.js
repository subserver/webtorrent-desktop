const { dispatch } = require('../lib/dispatcher')
const { ipcRenderer } = require('electron')

// Controls the Search screen
module.exports = class SearchController {
  constructor (state, config) {
    this.state = state
    this.config = config
  }

  // Goes to the Preferences screen
  show () {
    const state = this.state
    state.location.go({
      url: 'search',
      setup (cb) {
        // initialize preferences
        state.window.title = 'Search'
        ipcRenderer.send('setAllowNav', false)
        cb()
      },
      destroy: () => {
        ipcRenderer.send('setAllowNav', true)
      }
    })
  }
}
