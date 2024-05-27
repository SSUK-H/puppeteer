const { Pool } = require("pg");
const { env } = require("./config");

const pool = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  database: env.DB_DATABASE,
  password: env.DB_PASSWORD,
  port: env.DB_PORT,
});

// const insertData = async (data) => {
//   const query = `
//     INSERT INTO baseball_matches (match_date, team1, team2, team1_score, team2_score, location)
//     VALUES ($1, $2, $3, $4, $5, $6)
//   `;
//   let client; // client 변수를 미리 정의합니다.

//   try {
//     client = await pool.connect(); // try 블록 내부에서 초기화합니다.
//     await client.query("BEGIN");
//     await client.query(query, [
//       data.date,
//       data.team1,
//       data.team2,
//       data.team1Score,
//       data.team2Score,
//       data.location,
//     ]);
//     await client.query("COMMIT");
//     console.log("Data inserted successfully");
//   } catch (err) {
//     if (client) {
//       await client.query("ROLLBACK");
//     }
//     console.error("Error inserting data", err);
//   } finally {
//     if (client) {
//       client.release(); // finally 블록에서도 사용할 수 있도록 변경합니다.
//     }
//   }
// };

// const insertData = async (data) => {
//   const query = `
//     INSERT INTO baseball_matches (match_date, team1, team2, team1_score, team2_score, location)
//     VALUES ($1, $2, $3, $4, $5, $6)
//   `;
//   let client; // client 변수를 미리 정의합니다.

//   try {
//     client = await pool.connect(); // try 블록 내부에서 초기화합니다.
//     await client.query("BEGIN");
//     await client.query(query, [
//       data.date,
//       data.team1,
//       data.team2,
//       data.team1Score,
//       data.team2Score,
//       data.location,
//     ]);
//     await client.query("COMMIT");
//     console.log("Data inserted successfully");
//   } catch (err) {
//     if (client) {
//       await client.query("ROLLBACK");
//     }
//     console.error("Error inserting data", err);
//   } finally {
//     if (client) {
//       client.release(); // finally 블록에서도 사용할 수 있도록 변경합니다.
//     }
//   }
// };

module.exports = { insertData };
