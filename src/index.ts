import puppeteer from "puppeteer-core";
import fs from "fs/promises";

async function scrap() {
    let browser;
    try {
        //  launch/connect a browser, create some pages, and then manipulate them with Puppeteer's API.
        const auth =
            "brd-customer-hl_c016ff82-zone-scraping_browser:3eo5c1g07tpj";
        browser = await puppeteer.connect({
            browserWSEndpoint: `wss://${auth}@brd.superproxy.io:9222`,
        });
        // open new page, then goto into this page(think of it as opning new tab)
        const page = await browser.newPage();
        await page.goto("https://traversymedia.com");

        // * to target specific content start by getting all the html for the page
        // const content = await page.content();
        // await fs.writeFile("content/traversymedia.html", content);

        // if you want to target specific tag like h3 or whatever you can use page.evaluate()
        // note this function will run in the page context so you can access things like document and so on
        const title = await page.evaluate(() => {
            return document.title;
        });
        console.log(
            "🪵 [index.js:23] ~ token ~ \x1b[0;32mtitle\x1b[0m = ",
            title
        );
        const links = await page.evaluate(() =>
            Array.from(document.querySelectorAll("a"), (e) => e.href)
        );
        console.log(
            "🪵 [index.js:30] ~ token ~ \x1b[0;32mlinks\x1b[0m = ",
            links
        );
    } catch (err) {
        console.log(err);
    } finally {
        await browser?.close();
    }
}

scrap().catch((err) => console.log(err));
