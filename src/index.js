import puppeteer from "puppeteer-core";

async function scrap() {
    let browser;
    try {
        // 'brd-
        const auth =
            "brd-customer-hl_c016ff82-zone-scraping_browser:3eo5c1g07tpj";
        browser = puppeteer.connect({
            browserWSEndpoint: `wss://${auth}@brd.superproxy.io:9222`,
        });
    } catch (err) {
        console.log(err);
    } finally {
        browser?.close();
    }
}
