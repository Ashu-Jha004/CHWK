export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export interface BusinessContext {
  name: string;
  category: string;
  services?: string[];
  hours?: string;
  address?: string;
  phone?: string;
  priceRange?: string;
  description?: string;
  website?: string;
  whatsapp?: string;
  staff?: string[]; // List of staff names/roles
  products?: string[]; // List of products/menu items
}
