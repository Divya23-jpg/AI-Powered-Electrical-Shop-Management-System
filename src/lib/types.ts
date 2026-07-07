export type Product = {
  id: string;
  category: string;
  name: string;
  tag: "HOT" | "NEW" | "SALE" | "" | string;
  price: number;
  discount: number;
  discountedPrice: number;
  stock: number;
  images: string[];
  description: string;
  instagramLink: string;
  active: boolean;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export type CustomerDetails = {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  pincode: string;
  notes?: string;
};

export type Order = {
  orderId: string;
  createdAt: string;
  customer: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  total: number;
};