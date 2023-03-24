const express = require("express");

const path = require("path");

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,

      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);

    process.exit(1);
  }
};

initializeDBAndServer();

//API 1Returns a list of all the players in the player table

const convertDbObject = (objectItem) => {
  return {
    playerId: objectItem.player_id,

    playerName: objectItem.player_name,

    matchId: objectItem.match_id,

    match: objectItem.match,

    year: objectItem.year,
  };
};

app.get("/players/", async (request, response) => {
  const playersQuery = `SELECT * FROM player_details;`;

  const playerResult = await db.all(playersQuery);

  //response.send(playerResult);

  response.send(playerResult.map((eachPlayer) => convertDbObject(eachPlayer)));
});

//API 2 Returns a specific player based on the player ID

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const playersQuery1 = `SELECT player_id as playerId,player_name as playerName FROM player_details where player_id =${playerId};`;

  const playerResult1 = await db.get(playersQuery1);

  response.send(playerResult1);

  //response.send(playerResult1.map((eachPlayer) => convertDbObject(eachPlayer)));
});

//API 3 Updates the details of a specific player based on the player ID

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const playerUpDetails = request.body;

  const { playerName } = playerUpDetails;

  const updatePlayerQuery = `

    UPDATE

      player_details

    SET

      player_name='${playerName}'

    WHERE

      player_id = ${playerId};`;

  await db.run(updatePlayerQuery);

  response.send("Player Details Updated");
});

//API 4 Returns the match details of a specific match

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;

  const matchQuery = `SELECT match_id as matchId ,match,year FROM match_details where match_id =${matchId};`;

  const matchResult = await db.get(matchQuery);

  response.send(matchResult);

  //response.send(matchResult.map((eachPlayer) => convertDbObject(eachPlayer)));
});

//API 5 Returns a list of all the matches of a player

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;

  //const playerListQuery = `SELECT match_id as matchId,match,year FROM  player_match_score NATURAL JOIN match_details    where player_id =${playerId};`;

  const playerListQuery = `SELECT * FROM  player_match_score NATURAL JOIN match_details    where player_id =${playerId};`;

  const listResult = await db.get(playerListQuery);

  response.send(listResult);
});

module.exports = app;
