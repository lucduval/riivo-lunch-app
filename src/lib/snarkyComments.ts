import type { CartItem } from './CartContext';

type CommentContext = {
  step: 'MENU' | 'REVIEW' | 'EXTRAS' | 'CONFIRM' | 'SUCCESS';
  items: CartItem[];
  total: number;
  lastAddedItem?: CartItem;
  specialNote?: string;
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Comment pools ───

const menuEmptyComments = [
  "Just browsing? Bold strategy for someone who's hungry.",
  "Take your time. The kitchen's not going anywhere. Probably.",
  "The menu won't bite. Unlike some of these prices.",
  "Staring at a menu burns approximately zero calories.",
];

const itemAddedGeneric = [
  "Solid pick. Or at least that's what I'm programmed to say.",
  "Okay, noted. No judgement. Well, a little judgement.",
  "Good choice. Statistically, most people survive that dish.",
  "Added. Your taste is... unique. Let's go with that.",
  "The chef just felt a disturbance in the force.",
  "Another one bites the budget.",
];

const itemAddedExpensive = (name: string) => [
  `R${name}? That's a bit expensive. Not sure how Nic will feel about that.`,
  `${name}? Nic's accountant just got a notification.`,
  `Bold move ordering the ${name}. Nic's treating, right? ...Right?`,
  `The ${name}. I see you're not paying the bill. Classic.`,
  `${name} — also known as "pushing Nic's lunch budget to the absolute limit."`,
];

const itemAddedRepeat = (name: string, qty: number) => [
  `Are you really ordering ${name} again? That's ${qty} now.`,
  `${qty}x ${name}. Someone's got a type.`,
  `Another ${name}? You know there are other items on the menu, right?`,
  `${name}. Again. I'm sensing a pattern here.`,
  `${qty} of the ${name}. At this point just ask the chef to make a bucket.`,
];

const itemAddedPizza = [
  "Pizza. The answer to every question nobody asked.",
  "Ah, pizza. The emotionally safe choice.",
  "Pizza ordered. Innovation at its finest.",
];

const itemAddedPasta = [
  "Carbs on carbs. Living your best life.",
  "Pasta — because making decisions is hard and pasta is easy.",
  "The Italian grandmother inside me approves. The nutritionist does not.",
];

const reviewComments = (items: CartItem[], total: number) => {
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const comments: string[] = [];

  if (total > 200) {
    comments.push(
      "This order costs more than my electricity bill. And I'm an AI.",
      `R${total.toFixed(0)}? Are you feeding the whole office or just emotionally eating?`,
      "Nic's going to need a moment when he sees this receipt.",
      `R${total.toFixed(0)}. That's not a lunch order, that's a lifestyle.`,
    );
  } else if (total > 120) {
    comments.push(
      "The budget is sweating. I can feel it from here.",
      "That's a healthy total. And by healthy I mean the opposite of your wallet.",
      "Nic will understand. Probably. Maybe. Don't quote me.",
    );
  } else if (total < 50) {
    comments.push(
      "That's it? You eat like a bird. A financially responsible bird.",
      "Minimalist lunch. Nic would be proud. Boring, but proud.",
      "Light order. Saving room for the vending machine later?",
    );
  }

  if (itemCount >= 5) {
    comments.push(
      `${itemCount} items. Planning to share, or is this a personal challenge?`,
      "That's not a lunch order, that's a declaration of intent.",
    );
  }

  if (itemCount === 1) {
    comments.push(
      "Just the one? Brave. Efficient. Slightly concerning.",
      "One item. You're either very decisive or very broke.",
    );
  }

  const allCarbs = items.every(i =>
    ['Pasta', 'Baked Pasta', 'Pizza', 'Panini'].includes(i.category || '')
  );
  if (allCarbs && items.length > 1) {
    comments.push(
      "All carbs. Zero regrets. Maximum food coma.",
      "Not a single vegetable in sight. Respect.",
    );
  }

  return comments.length > 0 ? comments : [
    "Looks reasonable. Suspiciously reasonable.",
    "I've reviewed your order. I have opinions but I'll keep them to myself. Mostly.",
  ];
};

const extrasNoDrinks = [
  "No drink? Bold. Dry food, dry personality. Oliver's disappointed.",
  "You're skipping a drink? Oliver didn't stock the bar for nothing.",
  "Water from the tap it is, then. Oliver will remember this.",
  "No drink. Just vibes and dehydration. The sober island of the office.",
  "Skipping Oliver's menu? He's already drafting a passive-aggressive email.",
];

const extrasWithDrinks = [
  "Alcohol at lunch? On a weekday? In this economy? ...Respect.",
  "Oliver approves. Your afternoon calendar does not.",
  "A drink with lunch. Productivity was overrated anyway.",
  "Bold. Boozy. Beautiful. Oliver's beaming with pride.",
  "One drink at lunch never hurt anyone. That's what they all say.",
];

const extrasNoteComments = [
  "Special requests? The kitchen loves those. (They don't.)",
  "Writing a novel in the notes section, are we?",
];

const confirmComments = (total: number) => [
  "Last chance to back out. No pressure.",
  "Point of no return. The kitchen is watching.",
  `R${total.toFixed(0)} about to leave your lunch budget. Any last words?`,
  "Confirm and it's real. Like taxes, but with pasta.",
  "This is it. The moment of truth. The chef awaits your decision.",
  `Final total: R${total.toFixed(0)}. Nic's generosity has limits, but today isn't that day. Maybe.`,
];

const successComments = [
  "Order placed. May the kitchen gods be in your favour.",
  "Done. Now the hardest part: waiting.",
  "Order received. Time moves slower when you're hungry. Science fact. Probably.",
  "And now we wait. I'll be here. Not like I have anywhere else to be.",
  "Transmitted. Your lunch is now in the hands of fate and a very busy chef.",
  "Order in. ETA: soon-ish. Don't shoot the messenger. I'm just an AI.",
];

// ─── Main generator ───

export function getSnarkyComment(ctx: CommentContext): string {
  const { step, items, total, lastAddedItem, specialNote } = ctx;

  switch (step) {
    case 'MENU': {
      if (!lastAddedItem) return pick(menuEmptyComments);

      const cartItem = items.find(i => i.id === lastAddedItem.id);
      const qty = cartItem?.quantity || 1;

      // Repeat order
      if (qty > 1) {
        return pick(itemAddedRepeat(lastAddedItem.name, qty));
      }

      // Expensive item (> R100)
      if (lastAddedItem.price > 100) {
        return pick(itemAddedExpensive(lastAddedItem.name));
      }

      // Category-specific
      if (lastAddedItem.category === 'Pizza') return pick(itemAddedPizza);
      if (['Pasta', 'Baked Pasta'].includes(lastAddedItem.category || '')) return pick(itemAddedPasta);

      return pick(itemAddedGeneric);
    }

    case 'REVIEW':
      return pick(reviewComments(items, total));

    case 'EXTRAS': {
      const hasDrinks = items.some(i => i.category === 'Drinks');
      if (specialNote && specialNote.length > 20) return pick(extrasNoteComments);
      return pick(hasDrinks ? extrasWithDrinks : extrasNoDrinks);
    }

    case 'CONFIRM':
      return pick(confirmComments(total));

    case 'SUCCESS':
      return pick(successComments);

    default:
      return '';
  }
}
