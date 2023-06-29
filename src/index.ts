import puppeteer from "puppeteer-core";
import fs from "fs/promises";

type ContentFn = (page: puppeteer.Page) => Promise<void>;

async function scrap(contentFn: ContentFn) {
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
        contentFn(page);
    } catch (err) {
        console.log(err);
    } finally {
        await browser?.close();
    }
}

const elb2alScrap: ContentFn = async (page) => {
    // Enable request interception
    await page.setRequestInterception(true);

    // Filter out CSS requests
    page.on("request", (request) => {
        if (request.resourceType() === "stylesheet") {
            request.abort();
        } else {
            request.continue();
        }
    });

    console.log("before goto");
    await page.goto("https://alb2al.com/product-category", {
        timeout: 0,
    });
    console.log("after goto");
    // if you want to target specific tag like h3 or whatever you can use page.evaluate()
    // note this function will run in the page context so you can access things like document and so on
    const pageTitle = await page.evaluate(() => {
        return document.title;
    });

    const productsContent = await page.evaluate(() =>
        Array.from(document.querySelectorAll("div .product-content"), (e) => ({
            id: e
                .querySelector("a.add_to_cart_button")
                .getAttribute("data-product_sku"),
            title: e.querySelector(".block-inner h3.name a").textContent.trim(),
            price: e.querySelector(".caption .price bdi").textContent.trim(),
            imageUrl: e.querySelector("figure.image img").getAttribute("src"),
        }))
    );
    await fs.writeFile(
        "content/elb2al.json",
        JSON.stringify({
            title: pageTitle,
            products: productsContent,
        })
    );
};

scrap(elb2alScrap).catch((err) => console.log(err));
