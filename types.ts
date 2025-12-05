export enum CustomerRole {
  SUPER_VIP = 'Super VIP',
  VIP = 'VIP',
  REGULAR = 'Regular',
  ANNOYING = 'Annoying'
}

export interface Cuisine {
  id: string;
  name: string;
  description: string;
}

export interface Dish {
  id: string;
  cuisineId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface Customer {
  id: string;
  name: string;
  role: CustomerRole;
  balance: number;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
}

export type ViewState = 'LANDING' | 'ADMIN' | 'CLIENT_LOGIN' | 'CLIENT_APP';
