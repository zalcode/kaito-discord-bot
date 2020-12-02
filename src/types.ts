export type Tracker = {
  index: number;
  counter: number;
};

export type Material = {
  name: string;
  amount: number;
};

export type Recipe = {
  id: number;
  name: string;
  cookTime: number;
  price: number;
  margin: number;
  materials: Material[];
};

export type CookAction = {
  id: number;
  count: number;
};

export type KitchenStatus = {
  number: number;
  canCook: boolean;
  canTake: boolean;
  remainingTime: number;
};
