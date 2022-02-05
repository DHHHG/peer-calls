import classnames from 'classnames'
import forEach from 'lodash/forEach'
import React from 'react'
import Peer from 'simple-peer'
import { hangUp } from '../actions/CallActions'
import { getDesktopStream } from '../actions/MediaActions'
import { dismissNotification, Notification } from '../actions/NotifyActions'
import { MaximizeParams, MinimizeTogglePayload, removeLocalStream, StreamTypeDesktop } from '../actions/StreamActions'
import * as constants from '../constants'
import { Message } from '../reducers/messages'
import { Nicknames } from '../reducers/nicknames'
import { SettingsState } from '../reducers/settings'
import { StreamsState } from '../reducers/streams'
import { WindowStates } from '../reducers/windowStates'
import { Media } from './Media'
import Notifications from './Notifications'
import Sidebar from './Sidebar'
import Toolbar from './Toolbar'
import Videos from './Videos'

export interface AppProps {
  dialState: constants.DialState
  dismissNotification: typeof dismissNotification
  init: () => void
  nicknames: Nicknames
  notifications: Record<string, Notification>
  messages: Message[]
  messagesCount: number
  peers: Record<string, Peer.Instance>
  play: () => void
  sendText: (message: string) => void
  streams: StreamsState
  getDesktopStream: typeof getDesktopStream
  removeLocalStream: typeof removeLocalStream
  sendFile: (file: File) => void
  windowStates: WindowStates
  maximize: (payload: MaximizeParams) => void
  minimizeToggle: (payload: MinimizeTogglePayload) => void
  hangUp: typeof hangUp
  settings: SettingsState
}

export interface AppState {
  chatVisible: boolean
}

export default class App extends React.PureComponent<AppProps, AppState> {
  state: AppState = {
    chatVisible: false,
  }
  handleShowChat = () => {
    this.setState({
      chatVisible: true,
    })
  }
  handleHideSidebar = () => {
    this.setState({
      chatVisible: false,
    })
  }
  handleToggleSidebar = () => {
    return this.state.chatVisible
      ? this.handleHideSidebar()
      : this.handleShowChat()
  }
  componentDidMount () {
    const { init } = this.props
    init()
  }
  onHangup = () => {
    const { localStreams } = this.props.streams
    forEach(localStreams, s => {
      this.props.removeLocalStream(s!.stream, s!.type)
    })
    this.props.hangUp()
  }
  render () {
    const {
      dismissNotification,
      notifications,
      nicknames,
      messages,
      messagesCount,
      minimizeToggle,
      maximize,
      sendFile,
      sendText,
      settings,
    } = this.props

    const chatVisibleClassName = classnames({
      'chat-visible': this.state.chatVisible,
    })

    const { localStreams } = this.props.streams

    return (
      <div className="app">
        <Toolbar
          chatVisible={this.state.chatVisible}
          dialState={this.props.dialState}
          messagesCount={messagesCount}
          nickname={nicknames[constants.ME]}
          onToggleSidebar={this.handleToggleSidebar}
          onHangup={this.onHangup}
          desktopStream={localStreams[StreamTypeDesktop]}
          onGetDesktopStream={this.props.getDesktopStream}
          onRemoveLocalStream={this.props.removeLocalStream}
        />
        <Notifications
          className={chatVisibleClassName}
          dismiss={dismissNotification}
          notifications={notifications}
        />
        <Sidebar
          messages={messages}
          nicknames={nicknames}
          onClose={this.handleHideSidebar}
          onMinimizeToggle={minimizeToggle}
          play={this.props.play}
          sendText={sendText}
          sendFile={sendFile}
          visible={this.state.chatVisible}
        />
        <Media />
        {this.props.dialState !== constants.DIAL_STATE_HUNG_UP &&
          <Videos
            onMaximize={maximize}
            onMinimizeToggle={minimizeToggle}
            play={this.props.play}
            showMinimizedToolbar={settings.showMinimizedToolbar}
          />
        }
      </div>
    )
  }
}
