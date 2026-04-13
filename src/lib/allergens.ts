export interface Allergen {
  id: string;
  nameKey: string;
}

export const ALLERGEN_OPTIONS = [
  { id: "milk", name: "Milk", image: "/allergens/milk.png" },
  { id: "eggs", name: "Eggs", image: "/allergens/eggs.png" },
  { id: "peanut", name: "Peanuts", image: "/allergens/peanuts.png" },
  { id: "treeNuts", name: "Tree nuts", image: "/allergens/treenuts.png" },
  { id: "gluten", name: "Gluten", image: "/allergens/gluten.png" },
  { id: "soy", name: "Soy", image: "/allergens/soy.png" },
  { id: "fish", name: "Fish", image: "/allergens/fish.png" },
  { id: "crustaceans", name: "Crustaceans", image: "/allergens/crustaceans.png" },
  { id: "sesame", name: "Sesame", image: "/allergens/sesame.png" },
  { id: "molluscs", name: "Molluscs", image: "/allergens/molluscs.png" },
  { id: "mustard", name: "Mustard", image: "/allergens/mustard.png" },
  { id: "sulphites", name: "Sulphites", image: "/allergens/sulphites.png" },
  { id: "celery", name: "Celery", image: "/allergens/celery.png" },
  { id: "lupin", name: "Lupin", image: "/allergens/lupin.png" },
];

export const standardAllergens: Allergen[] = [
  { id: 'milk', nameKey: 'milk' },
  { id: 'eggs', nameKey: 'eggs' },
  { id: 'peanut', nameKey: 'peanut' },
  { id: 'treeNuts', nameKey: 'treeNuts' },
  { id: 'gluten', nameKey: 'gluten' },
  { id: 'soy', nameKey: 'soy' },
  { id: 'fish', nameKey: 'fish' },
  { id: 'crustaceans', nameKey: 'crustaceans' },
  { id: 'sesame', nameKey: 'sesame' },
  { id: 'molluscs', nameKey: 'molluscs' },
  { id: 'mustard', nameKey: 'mustard' },
  { id: 'sulphites', nameKey: 'sulphites' },
  { id: 'celery', nameKey: 'celery' },
  { id: 'lupin', nameKey: 'lupin' },
];