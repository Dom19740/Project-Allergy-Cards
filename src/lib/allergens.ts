export interface Allergen {
  id: string;
  nameKey: string;
}

export const ALLERGEN_OPTIONS = [
  { id: "milk", name: "Milk", image: "/allergens/milk.png" },
  { id: "eggs", name: "Eggs", image: "/allergens/eggs.png" },
  { id: "peanut", name: "Peanut", image: "/allergens/peanuts.png" },
  { id: "treeNuts", name: "Tree nuts (almonds, cashews, walnuts...)", image: "/allergens/treeNuts.png" },
  { id: "fish", name: "Fish", image: "/allergens/fish.png" },
  { id: "crustaceans", name: "Crustaceans (shrimp, crab, lobster)", image: "/allergens/crustaceans.png" },
  { id: "gluten", name: "Gluten (wheat, barley, rye, oats)", image: "/allergens/gluten.png" },
  { id: "soy", name: "Soy", image: "/allergens/soy.png" },
  { id: "sesame", name: "Sesame", image: "/allergens/sesame.png" },
  { id: "molluscs", name: "Molluscs (squid, clams, oysters)", image: "/allergens/molluscs.png" },
  { id: "celery", name: "Celery", image: "/allergens/celery.png" },
  { id: "mustard", name: "Mustard", image: "/allergens/mustard.png" },
  { id: "sulphites", name: "Sulphites (preservatives in wine, dried fruit, vinegar)", image: "/allergens/sulphites.png" },
  { id: "lupin", name: "Lupin (flour and seeds)", image: "/allergens/lupin.png" },
];

export const standardAllergens: Allergen[] = [
  { id: 'milk', nameKey: 'milk' },
  { id: 'eggs', nameKey: 'eggs' },
  { id: 'peanut', nameKey: 'peanut' },
  { id: 'treeNuts', nameKey: 'treeNuts' },
  { id: 'fish', nameKey: 'fish' },
  { id: 'crustaceans', nameKey: 'crustaceans' },
  { id: 'gluten', nameKey: 'gluten' },
  { id: 'soy', nameKey: 'soy' },
  { id: 'sesame', nameKey: 'sesame' },
  { id: 'molluscs', nameKey: 'molluscs' },
  { id: 'celery', nameKey: 'celery' },
  { id: 'mustard', nameKey: 'mustard' },
  { id: 'sulphites', nameKey: 'sulphites' },
  { id: 'lupin', nameKey: 'lupin' },
];