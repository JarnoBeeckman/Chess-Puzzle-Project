import { getPositions, getFromLocalStorage } from "./storage.js";
import { vars } from "./vars.js";
import { handleMove } from "./puzzleLogic.js";

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

vars.faultList = getFromLocalStorage(vars.storageKey);

// eslint-disable-next-line no-undef
vars.board = Chessboard("board", {
  draggable: !isTouchDevice,
  position: "start",
  onDrop: handleMove,
});
// eslint-disable-next-line no-undef
vars.chess = new Chess();

// Initial fetch of positions
await getPositions();
