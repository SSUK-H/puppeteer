const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { env } = require("./config");

const pool = new Pool({
  user: env.DB_USER,
  host: env.DB_HOST,
  database: env.DB_DATABASE,
  password: env.DB_PASSWORD,
  port: env.DB_PORT,
});

// 4월 경기
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

// 주루
// const insertData = async (dataArray) => {
//   const query = `
//     INSERT INTO baseball_player (
//       rank, player_name, team_name, G, SBA, SB, CS, "SB%", OOB, PKO
//     )
//     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//   `;
//   let client;

//   try {
//     client = await pool.connect();
//     await client.query("BEGIN");

//     for (let i = 0; i < dataArray.length; i++) {
//       const data = dataArray[i];
//       // SB% 값이 '-'이면 null로 대체
//       const sbPercentage = data["SB%"] === "-" ? null : data["SB%"];

//       await client.query(query, [
//         data.rank,
//         data.player_name,
//         data.team_name,
//         data.G,
//         data.SBA,
//         data.SB,
//         data.CS,
//         sbPercentage,
//         data.OOB,
//         data.PKO,
//       ]);
//     }

//     await client.query("COMMIT");
//     console.log("Data inserted successfully");
//   } catch (err) {
//     if (client) {
//       await client.query("ROLLBACK");
//     }
//     console.error("Error inserting data", err);
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };

// 수비
// const insertData = async (dataArray) => {
//   let client;

//   try {
//     client = await pool.connect();
//     await client.query("BEGIN");

//     for (let i = 0; i < dataArray.length; i++) {
//       const data = dataArray[i];
//       // IP 값 변환 (분수를 소수로)
//       const ip = convertIPToDecimal(data.IP);
//       // CS% 값이 '-'이면 null로 대체
//       const fpct = data.FPCT === "-" ? null : data.FPCT;
//       // CS% 값이 '-'이면 null로 대체
//       const csPercentage = data["CS%"] === "-" ? null : data["CS%"];

//       // 이름과 팀 이름이 일치하는 레코드 확인
//       const existingRecord = await client.query(
//         `
//         SELECT * FROM baseball_player
//         WHERE player_name = $1 AND team_name = $2
//       `,
//         [data.player_name, data.team_name]
//       );

//       if (existingRecord.rows.length > 0) {
//         // 동일한 이름과 팀 이름을 가진 레코드가 있는 경우 업데이트
//         await client.query(
//           `
//           UPDATE baseball_player
//           SET g = $1, gs = $2, ip = $3, e = $4, pko = $5, po = $6, a = $7, dp = $8, fpct = $9,
//               pb = $10, sb = $11, cs = $12, "CS%" = $13
//           WHERE player_name = $14 AND team_name = $15
//         `,
//           [
//             data.G,
//             data.GS,
//             ip,
//             data.E,
//             data.PKO,
//             data.PO,
//             data.A,
//             data.DP,
//             fpct,
//             data.PB,
//             data.SB,
//             data.CS,
//             csPercentage,
//             data.player_name,
//             data.team_name,
//           ]
//         );
//       } else {
//         // 동일한 이름과 팀 이름을 가진 레코드가 없는 경우 삽입
//         await client.query(
//           `
//           INSERT INTO baseball_player (rank, player_name, team_name, pos, g, gs, ip, e, pko, po, a, dp, fpct, pb, sb, cs, "CS%")
//           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
//         `,
//           [
//             data.rank,
//             data.player_name,
//             data.team_name,
//             data.POS,
//             data.G,
//             data.GS,
//             ip,
//             data.E,
//             data.PKO,
//             data.PO,
//             data.A,
//             data.DP,
//             fpct,
//             data.PB,
//             data.SB,
//             data.CS,
//             csPercentage,
//           ]
//         );
//       }
//     }

//     await client.query("COMMIT");
//     console.log("Data inserted successfully");
//   } catch (err) {
//     if (client) {
//       await client.query("ROLLBACK");
//     }
//     console.error("Error inserting data", err);
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };

// 투수
// const insertData = async (dataArray) => {
//   let client;

//   try {
//     client = await pool.connect();
//     await client.query("BEGIN");

//     for (let i = 0; i < dataArray.length; i++) {
//       const data = dataArray[i];
//       // IP 값 변환 (분수를 소수로)
//       const ip = convertIPToDecimal(data.IP);

//       // 이름과 팀 이름이 일치하는 레코드 확인
//       const existingRecord = await client.query(
//         `
//         SELECT * FROM baseball_player
//         WHERE player_name = $1 AND team_name = $2
//       `,
//         [data.player_name, data.team_name]
//       );

//       if (existingRecord.rows.length > 0) {
//         // 동일한 이름과 팀 이름을 가진 레코드가 있는 경우 업데이트
//         await client.query(
//           `
//           UPDATE baseball_player
//           SET era = $1, g = $2, w = $3, l = $4, sv = $5, hld = $6, wpct = $7,
//               ip = $8, h = $9, hr = $10, bb = $11, hbp = $12, so = $13, r = $14,
//               er = $15, whip = $16
//           WHERE player_name = $17 AND team_name = $18
//         `,
//           [
//             data.ERA,
//             data.G,
//             data.W,
//             data.L,
//             data.SV,
//             data.HLD,
//             data.WPCT,
//             ip,
//             data.H,
//             data.HR,
//             data.BB,
//             data.HBP,
//             data.SO,
//             data.R,
//             data.ER,
//             data.WHIP,
//             data.player_name,
//             data.team_name,
//           ]
//         );
//       } else {
//         // 동일한 이름과 팀 이름을 가진 레코드가 없는 경우 삽입
//         await client.query(
//           `
//           INSERT INTO baseball_player (rank, player_name, team_name, era, g, w, l, sv, hld, wpct, ip, h, hr, bb, hbp, so, r, er, whip)
//           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
//         `,
//           [
//             data.rank,
//             data.player_name,
//             data.team_name,
//             data.ERA,
//             data.G,
//             data.W,
//             data.L,
//             data.SV,
//             data.HLD,
//             data.WPCT,
//             ip,
//             data.H,
//             data.HR,
//             data.BB,
//             data.HBP,
//             data.SO,
//             data.R,
//             data.ER,
//             data.WHIP,
//           ]
//         );
//       }
//     }

//     await client.query("COMMIT");
//     console.log("Data inserted successfully");
//   } catch (err) {
//     if (client) {
//       await client.query("ROLLBACK");
//     }
//     console.error("Error inserting data", err);
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };

// 타자
// const insertData = async (dataArray) => {
//   let client;

//   try {
//     client = await pool.connect();
//     await client.query("BEGIN");

//     for (let i = 0; i < dataArray.length; i++) {
//       const data = dataArray[i];

//       // 이름과 팀 이름이 일치하는 레코드 확인
//       const existingRecord = await client.query(
//         `
//         SELECT * FROM baseball_player
//         WHERE player_name = $1 AND team_name = $2
//       `,
//         [data.player_name, data.team_name]
//       );

//       if (existingRecord.rows.length > 0) {
//         // 동일한 이름과 팀 이름을 가진 레코드가 있는 경우 업데이트
//         await client.query(
//           `
//           UPDATE baseball_player
//           SET avg = $1, g = $2, pa = $3, ab = $4, r = $5, h = $6, "2B" = $7, "3B" = $8,
//               hr = $9, tb = $10, rbi = $11, sac = $12, sf = $13
//           WHERE player_name = $14 AND team_name = $15
//         `,
//           [
//             data.AVG,
//             data.G,
//             data.PA,
//             data.AB,
//             data.R,
//             data.H,
//             data["2B"],
//             data["3B"],
//             data.HR,
//             data.TB,
//             data.RBI,
//             data.SAC,
//             data.SF,
//             data.player_name,
//             data.team_name,
//           ]
//         );
//       } else {
//         // 동일한 이름과 팀 이름을 가진 레코드가 없는 경우 삽입
//         await client.query(
//           `
//           INSERT INTO baseball_player (rank, player_name, team_name, avg, g, pa, ab, r, h, "2B", "3B", hr, tb, rbi, sac, sf)
//           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
//         `,
//           [
//             data.rank,
//             data.player_name,
//             data.team_name,
//             data.AVG,
//             data.G,
//             data.PA,
//             data.AB,
//             data.R,
//             data.H,
//             data["2B"],
//             data["3B"],
//             data.HR,
//             data.TB,
//             data.RBI,
//             data.SAC,
//             data.SF,
//           ]
//         );
//       }
//     }

//     await client.query("COMMIT");
//     console.log("Data inserted successfully");
//   } catch (err) {
//     if (client) {
//       await client.query("ROLLBACK");
//     }
//     console.error("Error inserting data", err);
//   } finally {
//     if (client) {
//       client.release();
//     }
//   }
// };

// 416 1/3 분수 처리 함수
const convertIPToDecimal = (ipString) => {
  // IP 값이 '-'인 경우에는 null 반환
  if (ipString === "-") {
    return null;
  }

  // IP 값을 공백을 기준으로 분할
  const parts = ipString.split(" ");

  // 분할된 값의 길이에 따라 처리
  if (parts.length === 1) {
    // 분수가 없는 경우 (예: "402")
    return parseFloat(parts[0]);
  } else if (parts.length === 2) {
    // 분수가 있는 경우 (예: "416 1/3")
    const wholePart = parseInt(parts[0]);
    const fractionalPart = parts[1];

    // 분수를 소수로 변환하여 반환
    const [numerator, denominator] = fractionalPart.split("/");
    const decimalValue =
      wholePart + parseInt(numerator) / parseInt(denominator);
    return decimalValue;
  } else {
    // 유효하지 않은 형식의 IP 값인 경우, 오류 처리
    throw new Error("Invalid format for IP value: " + ipString);
  }
};

// module.exports = { insertData };
