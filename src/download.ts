import fs from "fs/promises";
import path from "path";
import { FileSchameT, ItemT } from "./types.js";

function extractExtFromMimetype(str: string): string {
    const slashIndex = str.lastIndexOf("/");
    return str.substring(slashIndex + 1);
}
/**
 * download and store image in the fs
 * @param link link to download
 * @param imagesFolder path to store in
 */
async function storeImage(link: string, imagesFolder: string, name: string) {
    console.log("gonna download image: ", name);
    const res = await fetch(link);
    // const file = fs.createWriteStream(`contents/images/${product.id}`);
    if (res.ok) {
        const blob = await res.blob();

        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(
            path.join(
                imagesFolder,
                `${name}.${extractExtFromMimetype(
                    res.headers.get("Content-Type") as string
                )}`
            ),
            buffer
        );
    }
}

export async function downloadImages() {
    const contentFolder = path.resolve("content");
    const imagesFolder = path.resolve("images");
    await fs.mkdir(imagesFolder);
    // crawl every json file and download imageUrl
    const files = await fs.readdir(contentFolder, {
        encoding: "utf-8",
        withFileTypes: true,
    });

    await Promise.all(
        files.map(async (file) => {
            if (file.isDirectory()) return;
            const localFolderPath = path.join(
                imagesFolder,
                file.name.split(".")[0]
            );
            await fs.mkdir(localFolderPath);
            const fileData = JSON.parse(
                await fs.readFile(path.join(contentFolder, file.name), {
                    encoding: "utf-8",
                })
            ) as FileSchameT;
            for (const product of fileData.products) {
                await storeImage(product.imageUrl, localFolderPath, product.id);
            }
        })
    );
}
