export interface Allergen {
  id: string;
  nameKey: string;
}

export const ALLERGEN_OPTIONS = [
  { id: "milk", name: "Milk", image: "/allergens/milk.png" },
  { id: "eggs", name: "Eggs", image: "/allergens/eggs.png" },
  { id: "peanut", name: "Peanut", image: "/allergens/peanuts.png" },
  { id: "treeNuts", name: "Tree nuts", image: "/allergens/treeNuts.png" },
  { id: "fish", name: "Fish", image: "/allergens/fish.png" },
  { id: "shellfish", name: "Shellfish", image: "/allergens/shellfish.png" },
  { id: "wheat", name: "Wheat", image: "/allergens/wheat.png" },
  { id: "soy", name: "Soy", image: "/allergens/soy.png" },
  { id: "sesame", name: "Sesame", image: "/allergens/sesame.png" },
];

export const standardAllergens: Allergen[] = [
  {
    id: 'eggs',
    nameKey: 'eggs',
  },
  {
    id: 'fish',
    nameKey: 'fish',
  },
  {
    id: 'milk',
    nameKey: 'milk',
  },
  {
    id: 'peanut',
    nameKey: 'peanut',
  },
  {
    id: 'sesame',
    nameKey: 'sesame',
  },
  {
    id: 'shellfish',
    nameKey: 'shellfish',
  },
  {
    id: 'soy',
    nameKey: 'soy',
  },
  {
    id: 'treeNuts',
    nameKey: 'treeNuts',
  },
  {
    id: 'wheat',
    nameKey: 'wheat',
  },
];