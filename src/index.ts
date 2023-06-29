import puppeteer from "puppeteer-core";
import fs from "fs/promises";

async function wait(ms: number) {
    await new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
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
        await contentFn(page);
    } catch (err) {
        console.log(err);
    } finally {
        await browser?.close();
    }
}

const web: ContentFn = async (page) => {
    await page.goto("https://traversymedia.com");

    // * to target specific content start by getting all the html for the page
    // const content = await page.content();
    // await fs.writeFile("content/traversymedia.html", content);

    // if you want to target specific tag like h3 or whatever you can use page.evaluate()
    // note this function will run in the page context so you can access things like document and so on
    const title = await page.evaluate(() => {
        return document.title;
    });
    console.log("🪵 [index.js:23] ~ token ~ \x1b[0;32mtitle\x1b[0m = ", title);
    const links = await page.evaluate(() =>
        Array.from(document.querySelectorAll("a"), (e) => e.href)
    );
    console.log("🪵 [index.js:30] ~ token ~ \x1b[0;32mlinks\x1b[0m = ", links);
};

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
    await page.goto(
        "https://alb2al.com/product-category/%d8%a3%d8%b3%d8%a7%d8%b3%d9%8a%d8%a7%d8%aa-%d8%a7%d9%84%d8%b7%d8%a8%d8%ae/",
        {
            timeout: 0,
        }
    );
    console.log("after goto");
    // if you want to target specific tag like h3 or whatever you can use page.evaluate()
    // note this function will run in the page context so you can access things like document and so on
    const pageTitle = await page.evaluate(() => {
        return document.title;
    });

    // while there's load more button click it then get the data
    let buttonExists = true;
    while (buttonExists) {
        // Check if the button exists
        buttonExists = await page.evaluate(() => {
            const button = document.querySelector(
                '.tbay-pagination-load-more a[data-loadmore="true"]'
            ) as HTMLAnchorElement;
            if (button) {
                button.click();
                return true; // Button exists, continue the loop
            }
            return false; // Button doesn't exist, exit the loop
        });
        console.log("clicked i will wait");
        await wait(1000); // Wait for 1 second before checking again
    }

    console.log("formatting data");
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
        "content/elb2al5.json",
        JSON.stringify({
            title: pageTitle,
            products: productsContent,
        })
    );
};

const elb2alLinks = [
    "https://alb2al.com/product-category/%d8%ad%d9%84%d9%88%d9%8a%d8%a7%d8%aa-%d9%88%d9%85%d8%b3%d9%84%d9%8a%d8%a7%d8%aa/",
    "https://alb2al.com/product-category/%d9%85%d8%b4%d8%b1%d9%88%d8%a8%d8%a7%d8%aa/",
    "https://alb2al.com/product-category/%d8%ac%d8%a8%d9%86-%d9%88%d8%a3%d9%84%d8%a8%d8%a7%d9%86-%d9%88%d9%85%d8%ae%d9%84%d9%84%d8%a7%d8%aa/",
    "https://alb2al.com/product-category/%d9%85%d8%b9%d9%84%d8%a8%d8%a7%d8%aa/",
    "https://alb2al.com/product-category/%d8%a3%d8%b3%d8%a7%d8%b3%d9%8a%d8%a7%d8%aa-%d8%a7%d9%84%d8%b7%d8%a8%d8%ae/",
];
scrap(elb2alScrap).catch((err) => console.log(err));
