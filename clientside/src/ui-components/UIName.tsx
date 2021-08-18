import { useState } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

export default function UIName(props: any) {
  const [validInput, setValidInput] = useState(true)

  const submit = () => {
    const playerName: string = (document.getElementById('playerName') as HTMLInputElement).value

    const regex: RegExp = new RegExp('w+');
    
    if (regex.test(playerName)) {
      props.submit(playerName)
    } else {
      setValidInput(false)
    }
  }

  return (
    <div className="w3-row-padding">
      <span className="game-ui-title">What's your name son?</span>
      <div className="w3-row w3-padding">
        {validInput ? (
          <TextField id="playerName" variant="outlined" />
        ) : (
          <TextField
            error
            id="playerName"
            helperText="Tell us with a valid name who you are."
            variant="outlined"
          />
        )}
      </div>
      <div className="w3-row w3-padding">
        <Button variant="contained" color="primary" onClick={submit}>
          enroll for battle
        </Button>
      </div>
    </div>
  )
}
