import { InventoryItem } from "../../../types/Common.ts";
import { v4 } from "uuid";
import { toISO8601Date } from "../../../utils/toISO8601Date.ts";

const fakeCategories = ["Electronics", "Clothing", "Books", "Toys", "Furniture"];
const fakeElectronics = ["Phone", "Laptop", "Tablet", "Smartwatch", "Headphones"];
const fakeClothing = ["Shirt", "Pants", "Dress", "Shoes", "Hat"];
const fakeBooks = ["Fiction", "Non-Fiction", "Mystery", "Thriller", "Romance"];
const fakeToys = ["Action Figure", "Doll", "Board Game", "Puzzle", "Remote Control Car"];
const fakeFurniture = ["Chair", "Table", "Desk", "Bed", "Sofa"];
const fakeItems = [fakeElectronics, fakeClothing, fakeBooks, fakeToys, fakeFurniture];

export const createFakeItem = (): InventoryItem => {
  /** Get a random category */
  const category = fakeCategories[Math.floor(Math.random() * fakeCategories.length)];
  const items = fakeItems[fakeCategories.indexOf(category)];
  return {
    id: v4(),
    name: `Fake ${items[Math.floor(Math.random() * items.length)]}`,
    category: category,
    price: Math.floor(Math.random() * 1000),
    created_dt: toISO8601Date(),
    last_updated_dt: toISO8601Date(),
  };
};
