# EG_PRODUCTS

scrap the net for Egypt local products information, like name, price, description, image_url(can be downloaded) etc and store it in `json` files.
 
what use cases could benfit from this? for me was a point of sale application, while creating [Zagy-POS](https://github.com/nagy-nabil/POS) we needed local products information for out clients instead of creating each product by themselves, so yeah i want right stright for puppeteer to save me

 > NOTE: the script depend on connecting to remote browser using ws

website
![website](/public/alb2lWbsite.png)

CLI
![cli](/public/cli.png)

OUTPUT
![output](/public/output.png)

## GETTING STARTED

- make sure you have [node.js](https://nodejs.org/en) installed

- make sure you have [pnpm](https://pnpm.io/) installed

- install dependencies `pnpm install`

- create `.env` file `cp .env.example .env`

- run the script `pnpm start` will create folder called **content** contains all the scrapped data, see [commands](#commands)

## COMMANDS

- only scarp `pnpm start`, create **content** folder

- scrap and download the images `pnpm start --images` or `pnpm start -i`, create **content** and **images** folders

- if you already scrapped the content and need to only download images `pnpm start images` will create **images** folder

## NOTES

- **json** files inside the content folder will follow this schema, all the types are defined in the file [src/types.ts](/src/types.ts)

    ```ts
    export type FileSchameT = {
        title: string;
        products: ItemT[];
    };
    ```
