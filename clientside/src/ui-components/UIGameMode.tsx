import { useState } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { GameMode } from '../main'
import './UIGameMode_style.css'

export default function UIGameMode(props: any) {
  const [selection, setSelection] = useState(GameMode.singleplayer)
  const [validInput, setValidInput] = useState(true)

  const submit = () => {
    if (selection === GameMode.multiplayer) {
      const host: string = (document.getElementById('host') as HTMLInputElement).value

      if (host !== '') {
        props.submit(GameMode.multiplayer, host)
      } else {
        setValidInput(false)
      }
    } else {
      props.submit(GameMode.singleplayer, null)
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelection(parseInt((event.target as HTMLInputElement).value))
  }

  return (
    <div className="w3-row">
      <span className="game-ui-title">Choose the game-mode:</span>
      <div className="w3-row w3-padding">
        <RadioGroup name="gamemode" value={selection} onChange={handleChange}>
          <FormControlLabel
            value={GameMode.singleplayer}
            control={<Radio />}
            label="Lonewolf-mode (Singleplayer)"
          />
          <FormControlLabel
            value={GameMode.multiplayer}
            control={<Radio />}
            label="Party-mode (Multiplayer)"
          />
        </RadioGroup>
      </div>
      {selection === GameMode.multiplayer && (
        <div className="w3-row w3-padding">
          <div className="w3-row w3-padding"><span className="game-ui-title">Define your battlefield:</span></div>
          {validInput ? (
            <TextField
            className="txtHost"
              id="host"
              variant="outlined"
              defaultValue="wss://commander.kektus.de:8080"
            />
          ) : (
            <TextField
            className="txtHost"
              error
              id="host"
              label=""
              helperText="Please enter a valid host-adress."
              variant="outlined"
            />
          )}
        </div>
      )}
      <div className="w3-row w3-padding">
        <Button variant="contained" color="primary" onClick={submit}>
          enroll for battle
        </Button>
      </div>
    </div>
  )
}
