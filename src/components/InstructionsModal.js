import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import infoIcon from "../images/info icon.png";

export default function InstructionsModal({ onCloseCallback }) {
  const [open, setOpen] = React.useState(true);
  const handleOpen = () => setOpen(true);
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
            A domino is playable if one of its numbers matches that of one of
            the edge dominoes on the board.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Select a domino on the board by hovering over it or by pressing an
            arrow key, and select a domino from your hand by clicking or
            dragging.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {" "}
            The player that is dealt a blank domino automaically plays first.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Pass if no moves are available.
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Play all or the most dominoes to win.
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

// removed this animated border
{
  /* <div class="box-outer">
            <div class="main_box">
              <div class="bar top"></div>
              <div class="bar right delay"></div>
              <div className="modal-text-box"> */
}

{
  /* </div>
            </div>
            <div class="bar bottom delay"></div>
            <div class="bar left"></div>
          </div> */
}
