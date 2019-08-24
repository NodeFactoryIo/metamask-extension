const version = 37

/*

stores read notifications (for payment requests)
*/

const clone = require('clone')

module.exports = {
  version,

  migrate: async function (originalVersionedData) {
    const versionedData = clone(originalVersionedData)
    versionedData.meta.version = version
    const state = versionedData.data
    const newState = transformState(state)
    versionedData.data = newState
    return versionedData
  },
}

function transformState (state) {
  const newState = state
  // transform state here
  newState.SplitNetworkController = {};
  newState.SplitNetworkController.readNotifications = [];
  // TODO: Possible to remove when 3box integrates additional features.
  return newState;
}
