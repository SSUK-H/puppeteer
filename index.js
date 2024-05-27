const puppeteer = require("puppeteer");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const csvWriter = createCsvWriter({
  path: "baseball_runner.csv",
  header: [
    { id: "rank", title: "순위" },
    { id: "player_name", title: "선수명" },
    { id: "team_name", title: "팀명" },
    { id: "G", title: "G" },
    { id: "SBA", title: "SBA" },
    { id: "SB", title: "SB" },
    { id: "CS", title: "CS" },
    { id: "SB%", title: "SB%" },
    { id: "OOB", title: "OOB" },
    { id: "PKO", title: "PKO" },
  ],
});

const crawler = async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(
      "https://www.koreabaseball.com/Record/Player/Runner/Basic.aspx"
    );

    const collectData = async () => {
      await page.waitForSelector(".tData01 tbody tr", { timeout: 10000 });

      const data = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll(".tData01 tbody tr"));

        return rows.map((row) => {
          const cells = Array.from(row.querySelectorAll("td"));

          return {
            rank: cells[0].innerText,
            player_name: cells[1].innerText,
            team_name: cells[2].innerText,
            G: cells[3].innerText,
            SBA: cells[4].innerText,
            SB: cells[5].innerText,
            CS: cells[6].innerText,
            "SB%": cells[7].innerText,
            OOB: cells[8].innerText,
            PKO: cells[9].innerText,
          };
        });
      });

      return data;
    };

    let results = [];
    let last = 5;

    for (let i = 1; i <= last; i++) {
      console.log("페이지", i, ":");
      await page.waitForSelector(
        `.paging #cphContents_cphContents_cphContents_ucPager_btnNo${i}`
      );
      await page.click(
        `.paging #cphContents_cphContents_cphContents_ucPager_btnNo${i}`
      );

      await new Promise((resolve) => setTimeout(resolve, 3000));

      const pageData = await collectData();
      results = results.concat(pageData);
      console.table(results);

      const hasNextButton = await page.$(
        ".paging #cphContents_cphContents_cphContents_ucPager_btnNext"
      );

      await new Promise((resolve) => setTimeout(resolve, 3000));

      if (hasNextButton) {
        // 마지막 페이지까지 도달하면
        if (i === 5) {
          await page.click(
            ".paging #cphContents_cphContents_cphContents_ucPager_btnNext"
          );
          console.log("다음 페이지로 이동합니다.");
          i = 0;

          await new Promise((resolve) => setTimeout(resolve, 3000));
        } else {
          console.log("마지막 페이지입니다. 다음 페이지로 이동할 수 없습니다.");
        }
      } else {
        // last = 3;
      }
    }

    if (results.length > 0) {
      const flattenedResults = results.flat();
      await csvWriter.writeRecords(flattenedResults);
      console.log("CSV 파일이 성공적으로 저장되었습니다.");
    }

    await browser.close();
  } catch (e) {
    console.error(e);
    throw e;
  }
};

crawler();
