export type ItemT = {
    id: string;
    title: string;
    price: string;
    imageUrl: string;
};

export type FileSchameT = {
    title: string;
    products: ItemT[];
};
