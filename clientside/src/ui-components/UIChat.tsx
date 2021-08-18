import { ReactElement, useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import NetCommunicator from '../game/NetCommunicator'
import './UIChat_style.css'

export default function UIChat(props: any) {
  const [chatData, setChatData] = useState<any[]>([])
  const [members, setMembers] = useState([])
  const [gameRequest, setGameRequest] = useState<any>(null)
  const [messageBox, setMessageBox] = useState<any>(null)

  const netCom: NetCommunicator = props.netCom

  const onChatDataReceived = (data: any) => {
    let tmpChatMessage: any = { from: data.from, content: data.content, time: data.time }
    if (chatData.length === 0) {
      setChatData([tmpChatMessage])
      return 0
    }

    let tmpChatData: any = [...chatData]
    tmpChatData.push(tmpChatMessage)
    setChatData(tmpChatData)
  }

  const onChatMembersReceived = (data: any) => {
    setMembers(data)
  }

  const onGameRequestReceived = (opponentId: number | undefined, data: any) => {
    setGameRequest({ opponentId: opponentId, opponentName: data.opponentName })
  }

  const onGameRequestRejectReceived = (opponentId: number | undefined, data: any) => {
    setMessageBox(data.opponentName + ' does not want to mess with you. Look out for another buddy.')
  }

  const onGameRequestAckReceived = (opponentId: number | undefined, data: any) => {
    opponentId !== undefined ? netCom.doGameInitiation(opponentId) : null
  }

  netCom.onChatDataReceived = onChatDataReceived
  netCom.onPlayersDataReceived = onChatMembersReceived
  netCom.onGameRequestReceived = onGameRequestReceived
  netCom.onGameRequestRejectReceived = onGameRequestRejectReceived
  netCom.onGameRequestAckReceived = onGameRequestAckReceived

  const renderChat = () => {
    let chatMessages: ReactElement[] = chatData.map((element: any, index: number) => {
      return (
        <li key={index}>
          <b>{element.from}: </b> {element.content}
        </li>
      )
    })

    return chatMessages.reverse()
  }

  const doGameRequest = (opponentId: number) => {
    netCom.doGameRequest(props.playerName, opponentId)
  }

  const renderPlayers = () => {
    let players: ReactElement[] = members.map((element: any, index: number) => {
      return (
        <li
          onClick={() => {
            doGameRequest(element.id)
          }}
          key={index}
        >
          {element.name}
        </li>
      )
    })

    return players
  }

  const send = () => {
    const txtMessage: HTMLInputElement = document.getElementById('txtMessage') as HTMLInputElement
    const message: string = txtMessage.value

    if (message !== '') {
      props.netCom.exchangeChatData({ content: message, from: props.playerName, time: '' })
      txtMessage.value = ''
    }
  }

  const accept = () => {
    netCom.doGameRequestAck(props.playerName, gameRequest.opponentId)
    setGameRequest(null)
  }

  const reject = () => {
    netCom.doGameRequestReject(props.playerName, gameRequest.opponentId)
    setGameRequest(null)
  }

  return (
    <div>
      <div className="w3-row">
        <div className="w3-padding-small w3-green">
          <span className="game-ui-title">Available Warriors</span>
        </div>
        <div id="playerList" className="w3-col w3-container">
          <ul>{renderPlayers()}</ul>
        </div>
        <div className="w3-padding-small w3-green">
          <span className="game-ui-title">Chat</span>
        </div>
        <div id="chatList" className="w3-col w3-container">
          <ul>{renderChat()}</ul>
        </div>
      </div>
      <div className="w3-row w3-padding w3-padding-top-24">
        <TextField
          className="txtMessage"
          id="txtMessage"
          label="your message"
          multiline
          minRows={2}
          variant="outlined"
        />
      </div>
      <div className="w3-row w3-padding">
        <Button autoFocus variant="contained" color="primary" onClick={send}>
          Send
        </Button>
      </div>
      {gameRequest !== null && (
        <div className="w3-overlay w3-show">
          <div className="w3-panel 2-card w3-white w3-auto w3-display-middle">
            <div className="w3-row w3-padding">
              {gameRequest.opponentName} wants to mess with you. Accept?
            </div>
            <div className="w3-row w3-padding">
              <div className="w3-container w3-half w3-padding">
                <Button variant="contained" color="primary" onClick={accept}>
                  Accept
                </Button>
              </div>
              <div className="w3-container w3-half w3-padding">
                <Button variant="contained" color="secondary" onClick={reject}>
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {messageBox !== null && (
        <div className="w3-overlay w3-show">
          <div className="w3-panel 2-card w3-white w3-auto w3-display-middle">
            <div className="w3-row w3-padding">
              {messageBox}
            </div>
            <div className="w3-row w3-padding">
              <div className="w3-container">
                <Button variant="contained" color="primary" onClick={() => {setMessageBox(null)}}>
                  Ok
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
