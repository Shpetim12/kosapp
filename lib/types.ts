export type UserRole = "renter" | "landlord";
export type ListingStatus = "pending_review" | "active" | "rented" | "expired" | "rejected";
export type PropertyType = "apartment" | "house" | "room" | "studio";
export type FurnishedType = "yes" | "no" | "partial";
export type ContactRequestStatus = "pending" | "approved" | "declined";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string;
  phone_verified: boolean;
  is_verified_landlord: boolean;
  avatar_url: string | null;
  created_at: string;
};

export type Listing = {
  id: string;
  landlord_id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  neighborhood: string;
  property_type: PropertyType;
  bedrooms: number;
  size_m2: number;
  furnished: FurnishedType;
  available_from: string;
  amenities: Record<string, boolean>;
  status: ListingStatus;
  lat: number | null;
  lng: number | null;
  created_at: string;
};

export type ListingPhoto = {
  id: string;
  listing_id: string;
  storage_path: string;
  order_index: number;
};

export type ListingWithPhotos = Listing & {
  listing_photos: ListingPhoto[];
  profiles?: Pick<Profile, "full_name" | "is_verified_landlord"> | null;
};
