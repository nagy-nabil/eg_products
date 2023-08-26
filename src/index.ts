import puppeteer from "puppeteer-core";
import fs from "fs/promises";
import path from "path";
import { env } from "./config.js";
import { ItemT } from "./types.js";
import { downloadImages } from "./download.js";

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
        browser = await puppeteer.connect({
            browserWSEndpoint: env.WSENDPOINT,
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

const alb2alScrap: ContentFn = async (page) => {
    const folderPath = path.resolve("content");
    await fs.mkdir(folderPath);
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

    // create links to scrap first
    const starterLink = "https://alb2al.com/";

    console.log("constructing scraping starter links...");

    await page.goto(starterLink, {
        timeout: 0,
    });

    const links: string[] = await page.evaluate(() =>
        Array.from(
            document.querySelectorAll("div .item-cat"),
            (e) =>
                (e.querySelector("a.cat-name") as HTMLAnchorElement)?.href || ""
        )
    );

    console.log("found links: ");
    console.dir(links);
    console.log("constructed links, now scraping...");

    for (const link of links) {
        await page.goto(link, { timeout: 0 });
        console.log("scrap: ", link);
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
            console.log("clicked load more i will wait");
            await wait(1000); // Wait for 1 second before checking again
        }

        console.log("formatting data for ", link);
        const productsContent: ItemT[] = await page.evaluate(() =>
            Array.from(
                document.querySelectorAll("div .product-content"),
                (e) => {
                    return {
                        id:
                            e
                                .querySelector("a.add_to_cart_button")
                                ?.getAttribute("data-product_sku") || "",
                        title:
                            (
                                e.querySelector(
                                    ".block-inner h3.name a"
                                ) as HTMLAnchorElement
                            ).textContent?.trim() || "",
                        price:
                            e
                                .querySelector(".caption .price bdi")
                                ?.textContent?.trim()
                                .split(" ")[0] || "",
                        imageUrl:
                            e
                                .querySelector("figure.image img")
                                ?.getAttribute("src") || "",
                    };
                }
            )
        );
        await fs.writeFile(
            path.join(folderPath, `${pageTitle}.json`),
            JSON.stringify({
                title: pageTitle,
                products: productsContent,
            })
        );
    }
};

async function main() {
    const command = process.argv[2];
    const option = process.argv[3];

    if (command === "images") {
        await downloadImages();
    } else {
        await scrap(alb2alScrap);
        if (
            command === "-i" ||
            command === "--images" ||
            option === "-i" ||
            option === "--images"
        ) {
            await downloadImages();
        }
    }
}

await main();
