/**
 * @pyas/connect: the <pyas-connect> element (PyasConnect 2.0).
 * The flow itself is @pyas/connect-core's; its types are re-exported here,
 * with the helper for a callback page on your own OAuth app.
 */
export type * from './components'
export type { ConnectErrorInfo, ConnectedAccount, Provider } from '@pyas/connect-core'
export { postCallbackResult } from '@pyas/connect-core'
export { DEFAULT_STRINGS } from './components/pyas-connect/strings'
export type { PyasConnectStrings } from './components/pyas-connect/strings'
