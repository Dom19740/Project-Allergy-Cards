export interface Allergen {
  id: string;
  nameKey: string;
}

export const ALLERGEN_OPTIONS = [
  { id: "gluten", name: "Gluten", image: "/allergens/gluten.png" },
  { id: "crustaceans", name: "Crustaceans", image: "/allergens/crustaceans.png" },
  { id: "molluscs", name: "Molluscs", image: "/allergens/molluscs.png" },
  { id: "eggs", name: "Eggs", image: "/allergens/eggs.png" },
  { id: "fish", name: "Fish", image: "/allergens/fish.png" },
  { id: "peanut", name: "Peanuts", image: "/allergens/peanuts.png" },
  { id: "soy", name: "Soy", image: "/allergens/soy.png" },
  { id: "milk", name: "Milk", image: "/allergens/milk.png" },
  { id: "treeNuts", name: "Tree nuts", image: "/allergens/treeNuts.png" },
  { id: "celery", name: "Celery", image: "/allergens/celery.png" },
  { id: "mustard", name: "Mustard", image: "/allergens/mustard.png" },
  { id: "sesame", name: "Sesame", image: "/allergens/sesame.png" },
  { id: "sulphites", name: "Sulphites", image: "/allergens/sulphites.png" },
  { id: "lupin", name: "Lupin", image: "/allergens/lupin.png" },
];

export const standardAllergens: Allergen[] = [
  { id: 'gluten', nameKey: 'gluten' },
  { id: 'crustaceans', nameKey: 'crustaceans' },
  { id: 'molluscs', nameKey: 'molluscs' },
  { id: 'eggs', nameKey: 'eggs' },
  { id: 'fish', nameKey: 'fish' },
  { id: 'peanut', nameKey: 'peanut' },
  { id: 'soy', nameKey: 'soy' },
  { id: 'milk', nameKey: 'milk' },
  { id: 'treeNuts', nameKey: 'treeNuts' },
  { id: 'celery', nameKey: 'celery' },
  { id: 'mustard', nameKey: 'mustard' },
  { id: 'sesame', nameKey: 'sesame' },
  { id: 'sulphites', nameKey: 'sulphites' },
  { id: 'lupin', nameKey: 'lupin' },
];