import fs from "fs/promises";
import path from "path";
import products1 from "../content/elb2al1.json" assert { type: "json" };
import products2 from "../content/elb2al2.json" assert { type: "json" };
import products3 from "../content/elb2al3.json" assert { type: "json" };
import products4 from "../content/elb2al4.json" assert { type: "json" };
import products5 from "../content/elb2al5.json" assert { type: "json" };

function extractExt(str: string): string {
    const slashIndex = str.lastIndexOf("/");
    return str.substring(slashIndex + 1);
}
async function download() {
    products4.products.forEach(async (product) => {
        const res = await fetch(product.imageUrl);
        // const file = fs.createWriteStream(`contents/images/${product.id}`);
        if (res.ok) {
            const blob = await res.blob();

            const arrayBuffer = await blob.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const f = path.resolve(
                "./content/images44",
                `${product.id}.${extractExt(
                    res.headers.get("Content-Type") as string
                )}`
            );
            await fs.writeFile(f, buffer);
        }
    });
}

download().catch((err) => {
    console.log("🪵 [download.ts:5] ~ token ~ \x1b[0;32merr\x1b[0m = ", err);
});
