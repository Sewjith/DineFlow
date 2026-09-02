// Menu photos, resolved on the frontend.
//
// Image upload is a deferred backend feature, so menu items carry no image URL.
// To still show appetising photos, we pick a bundled stock photo by matching
// keywords in the dish name (falling back to its category). The images live in
// `public/menu/<slug>.jpg` so they load offline with no external dependency.
// Callers pair this with an emoji tile as a last-resort fallback.

const KEYWORDS = [
  [/pizza/i, 'pizza', '🍕'],
  [/burger/i, 'burger', '🍔'],
  [/spaghetti|pasta|bolognese|noodle/i, 'pasta', '🍝'],
  [/salmon|fish|seafood|prawn|shrimp/i, 'salmon', '🐟'],
  [/soup|broth/i, 'soup', '🍲'],
  [/garlic bread|bruschetta|bread|ciabatta|toast/i, 'bread', '🍞'],
  [/tiramisu|coffee|cappuccino|latte|espresso|mocha/i, 'coffee', '☕'],
  [/brownie|chocolate|cake|dessert|ice ?cream|pudding|pastry/i, 'dessert', '🍰'],
  [/orange juice|juice|smoothie/i, 'juice', '🧃'],
  [/water|sparkling/i, 'water', '💧'],
  [/wine|beer|cocktail|soda|cola|tea|lemonade|drink/i, 'drink', '🥤'],
  [/salad/i, 'salad', '🥗'],
  [/chicken|wings/i, 'chicken', '🍗'],
  [/steak|beef|ribs/i, 'steak', '🥩'],
  [/taco|burrito|nacho/i, 'tacos', '🌮'],
  [/sushi|ramen/i, 'sushi', '🍣'],
  [/fries|chips/i, 'fries', '🍟'],
  [/sandwich|wrap|panini/i, 'sandwich', '🥪'],
];

const CATEGORIES = {
  Starters: ['appetizer', '🥟'],
  Mains: ['dish', '🍽️'],
  Desserts: ['dessert', '🍰'],
  Drinks: ['drink', '🥤'],
};

function match(item) {
  const name = (item?.name || '').toLowerCase();
  for (const [re, slug, emoji] of KEYWORDS) {
    if (re.test(name)) return [slug, emoji];
  }
  return CATEGORIES[item?.categoryName] || ['default', '🍽️'];
}

export function imageFor(item) {
  return `/menu/${match(item)[0]}.jpg`;
}

export function emojiFor(item) {
  return match(item)[1];
}
