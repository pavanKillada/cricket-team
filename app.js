const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

let db;
let filePath = path.join(__dirname, "cricketTeam.db");

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: filePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at https://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//getting list of players//

app.get("/players/", async (request, response) => {
  let getAllQuery = `SELECT * FROM cricket_team ORDER BY player_id`;
  let playersArray = await db.all(getAllQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//posting a player into DB//

app.post("/players/", async (request, response) => {
  let playersDetails = request.body;
  let { player_id, player_name, jersey_number, role } = playersDetails;
  let postQuery = `INSERT INTO cricket_team
    values(${player_id},"${player_name}",${jersey_number},"${role}")`;
  await db.run(postQuery);
  response.send("Player Added to Team");
});

//getting single player details//

app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let getSingleQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId}`;
  let player = await db.get(getSingleQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//updating player details//

app.put("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let playerDetails = request.body;
  let { player_name, jersey_number, role } = playerDetails;
  const updateQuery = `UPDATE
    cricket_team
  SET
    player_name = '${player_name}',
    jersey_number = ${jersey_number},
    role = '${role}'
  WHERE
    player_id = ${playerId}`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

//deleting a player//

app.delete("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let deleteQuery = `DELETE FROM cricket_team WHERE player_id = ${playerId};`;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
