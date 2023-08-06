const sha3_256 = require("js-sha3").sha3_256;
const crypto = require("crypto");
const readline = require("readline");

const showMenu = (gameElements) => {
  console.log("Menu:");
  gameElements.forEach((move, index) => {
    console.log(`${index + 1} - ${move}`);
  });
  console.log("0 - Exit");
  console.log("? - Help");
};

const determineWinner = (userMove, computerMove, gameElements) => {
  const userIndex = gameElements.indexOf(userMove);
  const computerIndex = gameElements.indexOf(computerMove);
  const n = gameElements.length;
  const distance = (computerIndex - userIndex + n) % n;
  if (distance === 0) return "Draw";
  return distance <= n / 2 ? "Win" : "Lose";
};

const showHelpPage = (gameElements) => {
  const table = [[`PC\\User >`, ...gameElements]];

  for (const userMove of gameElements) {
    const row = [userMove];
    for (const computerMove of gameElements) {
      row.push(determineWinner(userMove, computerMove, gameElements));
    }
    table.push(row);
  }

  return table;
};

const printTable = (table) => {
  const colWidth = table.reduce((max, row) => {
    return Math.max(max, ...row.map((cell) => cell.length));
  }, 0);

  const divider = "-".repeat((colWidth + 2) * (table[0].length + 1));

  console.log(divider);
  table.forEach((row) => {
    console.log(`| ${row.map((cell) => cell.padEnd(colWidth)).join(" | ")} |`);
    console.log(divider);
  });
};

const calculateHMAC = (key, move) => {
  const hmac = crypto.createHmac("sha256", key);
  hmac.update(move);
  return hmac.digest("hex");
};

const playGame = (gameElements) => {
  const key = crypto.randomBytes(32).toString("hex");
  const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  showMenu(gameElements);

  const onLineHandler = (userMoveIndex) => {
    if (userMoveIndex === "?") {
      console.table(printTable(showHelpPage(gameElements)));
      readlineInterface.question("Enter your move: ", onLineHandler);
    } else {
      const index = parseInt(userMoveIndex, 10);
      if (index === 0) {
        console.log("Exit");
        readlineInterface.close();
        return;
      }

      if (isNaN(index) || index < 1 || index > gameElements.length) {
        console.log("Wrong move");
      } else {
        const userMove = gameElements[index - 1];
        const computerMove =
          gameElements[Math.floor(Math.random() * gameElements.length)];

        console.log(`Computer's move: ${computerMove}`);
        console.log(`Your move: ${userMove}`);
        console.log(`HMAC key: ${key}`);
        console.log(`HMAC: ${calculateHMAC(key, userMove)}`);

        const winner = determineWinner(userMove, computerMove, gameElements);
        console.log(winner);
      }

      readlineInterface.question("Enter your move: ", onLineHandler);
    }
  };

  readlineInterface.question("Enter your move: ", onLineHandler);
};

const gameElements = process.argv.slice(2);

const hasDuplicates = gameElements.some(
  (val, i) => gameElements.indexOf(val) !== i
);

if (gameElements.length < 3 || gameElements.length % 2 === 0) {
  console.log(
    "Incorrect number of moves, it should be more than 3 or there are odd numbers of gameElements"
  );
}
else if (hasDuplicates) {
  console.log("The game contains repeating strings");
} else {
  playGame(gameElements);
}
