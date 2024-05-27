// const parse = require("csv-parse/lib/sync");
// const stringify = require("csv-stringify/lib/sync");
// const fs = require("fs");
const puppeteer = require("puppeteer");
const { insertData } = require("./db");

// const csv = fs.readFileSync("csv/data.csv");
// const records = parse(csv.toString("utf-8")); // 문자열로 바꿔줘야함

const crawler = async () => {
  try {
    let results = [];

    // 브라우저 열기
    // headless가 false인 경우: 개발 모드에서 눈으로 확인해야할 때 브라우저를 띄움
    // headless: process.env.NODE_ENV === "production" 배포 환경일 경우 안보임
    const browser = await puppeteer.launch({ headless: false });

    /**
     * 한 페이지일 때
     */
    const page = await browser.newPage(); // 페이지 열기
    // await page.setDefaultNavigationTimeout(0);
    await page.goto("https://www.koreabaseball.com/Schedule/Schedule.aspx#"); // 페이지 이동

    // 셀렉트 박스에서 4월 선택
    await page.select("select#ddlMonth", "04");

    await page.waitForSelector("#tblScheduleList", { timeout: 10000 }); // 대기

    // 데이터 크롤링
    const result = await page.evaluate(() => {
      const rows = document.querySelectorAll("#tblScheduleList tbody tr");

      const data = Array.from(rows).map((row) => {
        const dateElement = row.querySelector(".day");
        const matchElement = row.querySelector(".play");
        const locationElement = row.querySelector("td:nth-last-child(2)");

        /**
         * 경기 날짜
         * 04.02(화) - 04.03(수) 사이 날짜가 없음
         * 04.02(화) 해당 되는 경기 첫 tr만 날짜가 있음
         * 04.02(화) - 04.03(수) 사이 null 값인 경우 이전 날짜로 대체 함
         */
        let date = null;
        if (dateElement) {
          const dateString = dateElement.textContent.trim();
          // '04.02(화)' 형식의 문자열이 아닌 경우에만 처리
          if (dateString !== null && dateString !== "") {
            // '04.02(화)' 형식의 문자열을 'YYYY-MM-DD' 형식으로 파싱하여 추출
            const parts = dateString.split(/[.()]/);
            const month = parts[0].padStart(2, "0");
            const day = parts[1].padStart(2, "0");
            const year = new Date().getFullYear();
            date = `${year}-${month}-${day}`;
            previousDate = date; // 이전 날짜 업데이트
          }
        }

        /**
         * 경기 팀명과 스코어
         */
        let team1 = null;
        let team2 = null;
        let team1Score = null;
        let team2Score = null;
        if (matchElement) {
          const teamElements = matchElement.querySelectorAll("span");
          if (teamElements.length >= 4) {
            team1 = teamElements[0].textContent.trim();
            team2 = teamElements[4].textContent.trim();
            team1Score = teamElements[1].textContent.trim();
            team2Score = teamElements[3].textContent.trim();
          } else if (teamElements.length === 3) {
            team1 = teamElements[0].textContent.trim();
            team2 = teamElements[2].textContent.trim();
          }
        }

        /**
         * 경기 장소
         */
        const location = locationElement
          ? locationElement.textContent.trim()
          : null;

        return {
          date: previousDate,
          team1,
          team2,
          team1Score,
          team2Score,
          location,
        };
      });

      return data;
    });

    if (result) {
      console.log(result);

      for (const data of result) {
        // await insertData(data);
      }
    }

    /**
     * 여러 페이지일 때
     */
    // await Promise.all(
    //   // 파일에 있는 주소들 한번에 처리
    //   records.map(async (r, i) => {
    //     try {
    //       const page = await browser.newPage(); // 페이지 열기
    //       await page.goto(r[1]); // 페이지 이동
    //       // const 태그핸들러 = await page.$(선택자); // 페이지에서 태그 찾기
    //       // 이전에 밖에서 선택자를 불러왔음
    //       // 바로 evaluate에서 선택자를 불러옴
    //       const text = await page.evaluate(() => {
    //         const score = document.querySelector(
    //           ".score.score_left .star_score"
    //         );
    //         const score2 = document.querySelector(
    //           ".score.score_left .star_score"
    //         );

    //         if (score) {
    //           return {
    //             score: score.textContent,
    //             score2: score.textContent,
    //           };
    //         }
    //       });

    //       result[i] = [r[0], r[1], text.trim()];

    //       await page.waitFor(3000);
    //       await page.close();
    //     } catch (e) {
    //       console.error(e);
    //     }
    //   })
    // );

    await browser.close(); // 브라우저 닫기
    // const str = stringify(result); // 문자로 합치기
    // fs.writeFileSync("csv/result.csv", str); // csv 파일에 저장
  } catch (e) {
    console.error(e);
    throw e;
  }
};

crawler();
