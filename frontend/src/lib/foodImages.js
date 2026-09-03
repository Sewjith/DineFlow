// Menu photos, resolved on the frontend.
//
// If an item has a photo uploaded by an admin, we serve it from the menu-service
// (`/api/menu-items/<id>/image`). Otherwise we fall back to a bundled stock photo,
// picked by matching keywords in the dish name (then its category). The stock images
// live in `public/menu/<slug>.jpg` so they load offline with no external dependency.
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

/** URL of the admin-uploaded photo, or null if the item has none. */
export function uploadedImageUrl(item) {
  if (!item?.hasImage) return null;
  const version = item.imageVersion ? `?v=${item.imageVersion}` : '';
  return `/api/menu-items/${item.id}/image${version}`;
}

export function imageFor(item) {
  return uploadedImageUrl(item) || `/menu/${match(item)[0]}.jpg`;
}

export function emojiFor(item) {
  return match(item)[1];
}
