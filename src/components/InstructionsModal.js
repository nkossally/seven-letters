import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import infoIcon from "../images/info icon.png";

export default function InstructionsModal({ onCloseCallback }) {
  const [open, setOpen] = React.useState(true);
  const handleOpen = () => {
    console.log("pizza")
    setOpen(true);
  }
  const handleClose = () => {
    setOpen(false);
    if (onCloseCallback) {
      onCloseCallback();
    }
  };

  const buttonStyle = {
    position: "absolute",
    top: 5,
    right: 5,
    "text-transform": "capitalize",
    color: "#00e0ff",
  };

  const buttonInModalStyle = {
    width: "1px",
    "text-transform": "lowercase",
    minHeight: 10,
    minWidth: 40,
    "font-size": 16,
    "font-family": "Roboto, Helvetica, Arial, sans-serif",
    "font-weight": 400,
    "line-height": "1.5",
    "letter-spacing": "0.00938em",
    "margin-bottom": "2px",
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    height: "430px",
    width: "430px",
    "text-align": "center",
    border: "2px solid #00e0ff",
    outline: "none",
    boxShadow: 24,
    p: 4,
    "overflow-y":"scroll",
  };

  return (
    <div>
      <Button sx={buttonStyle} onClick={handleOpen}>
        <img src={infoIcon} className="info-icon" />
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-description" sx={{ mt: -1 }}>
            Different letters in the game will have various point values and
            this will depend on how rare the letter is and how difficult it may
            be to lay that letter.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Extra Point Values -
            When looking at the board, players will see that
            some squares offer multipliers. Should a tile be placed on these
            squares, the value of the tile will be multiplied by 2x or 3x. Some
            squares will also multiply the total value of the word and not just
            the single point value of one tile.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Double Letter Scores - The light blue cells in the board are
            isolated and when these are used, they will double the value of the
            tile placed on that square.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Triple Letter Score - The dark blue cell in the board will be worth
            triple the amount, so any tile placed here will earn more points.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Double Word Score - When a cell is light red in colour, it is a
            double word cell. When a word is placed on these squares, the entire
            value of the word will be doubled.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Triple Word Score - The dark red square will triple the word score.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            One Single Use - When using the extra point squares on the board,
            they can only be used one time. If a player places a word here, it
            cannot be used as a multiplier by placing another word on the same
            square.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Human player plays first.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Every player is dealt seven tiles when the game starts.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            You can pass.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            When the game begins, the player will
            place their word on the star in the centre of the board. The
            star is a double square and will offer a double word score. All
            players following will build their words off of this word, extending
            the game to other squares on the board.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Replacing Scrabble Tiles -
            Once tiles are played on the board, players will be dealt new tiles to
            replace those. Players will always have seven tiles during the game.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            The Fifty Point Bonus - 
            
            When players use all seven tiles to create
            a word on the board, players will receive a 50
            point bonus, in addition to the value of the word.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            The End of a Scrabble Game -
            Once all tiles are gone from the bag and a single player has placed
            all of their tiles, the game will end and the player with the
            highest score wins.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Accepted Scrabble Words
          </Typography>

          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Click{" "}
            <Button
              sx={buttonInModalStyle}
              onClick={handleClose}
              variant="text"
              size="small"
            >
              here
            </Button>{" "}
            or anywhere outside of this box to start or continue playing.
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
