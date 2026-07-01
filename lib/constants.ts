export const cities = [
  "Prishtinë",
  "Prizren",
  "Mitrovicë",
  "Pejë",
  "Gjakovë",
  "Ferizaj",
  "Gjilan",
  "Fushë Kosovë"
] as const;

export const neighborhoodsByCity: Record<(typeof cities)[number], string[]> = {
  Prishtinë: ["Dardania", "Ulpiana", "Bregu i Diellit", "Arbëria", "Qendra", "Lakrishtë", "Mati 1", "Kalabria"],
  Prizren: ["Qendra", "Bazhdarhane", "Ortakoll", "Dardania", "Bajram Curri"],
  Mitrovicë: ["Qendra", "Ilirida", "Tavnik", "Bair", "2 Korriku", "Shipol"],
  Pejë: ["Qendra", "Kapeshnicë", "Dardania", "Fidanishte", "Kristal"],
  Gjakovë: ["Qendra", "Dardania", "Blloku i Ri", "Çabrat", "Piskotë"],
  Ferizaj: ["Qendra", "Dardania", "Talinoc", "Varosh", "Sallahane"],
  Gjilan: ["Qendra", "Dardania", "Arbëria", "Kodra e Dëshmorëve", "Zabel"],
  "Fushë Kosovë": ["Qendra", "Dardania", "Pajazit Islami", "Bresje", "Miradi"]
};

export const neighborhoodCoordinates: Record<string, { lat: number; lng: number }> = {
  "Prishtinë:Dardania": { lat: 42.6506, lng: 21.1512 },
  "Prishtinë:Ulpiana": { lat: 42.6517, lng: 21.166 },
  "Prishtinë:Bregu i Diellit": { lat: 42.6554, lng: 21.1785 },
  "Prishtinë:Arbëria": { lat: 42.6693, lng: 21.1489 },
  "Prishtinë:Qendra": { lat: 42.6629, lng: 21.1655 },
  "Prishtinë:Lakrishtë": { lat: 42.6548, lng: 21.151 },
  "Prishtinë:Mati 1": { lat: 42.6422, lng: 21.1801 },
  "Prishtinë:Kalabria": { lat: 42.6429, lng: 21.1533 },
  "Mitrovicë:Qendra": { lat: 42.8914, lng: 20.8658 },
  "Mitrovicë:Ilirida": { lat: 42.8832, lng: 20.8712 },
  "Mitrovicë:Tavnik": { lat: 42.889, lng: 20.8545 },
  "Mitrovicë:Bair": { lat: 42.8973, lng: 20.8736 },
  "Mitrovicë:2 Korriku": { lat: 42.8847, lng: 20.8608 },
  "Mitrovicë:Shipol": { lat: 42.872, lng: 20.8402 }
};

export const propertyTypes = [
  { value: "apartment", label: "Banesë" },
  { value: "house", label: "Shtëpi" },
  { value: "room", label: "Dhomë" },
  { value: "studio", label: "Studio" }
] as const;

export const furnishedOptions = [
  { value: "yes", label: "Po" },
  { value: "no", label: "Jo" },
  { value: "partial", label: "Pjesërisht" }
] as const;

export const amenities = [
  { key: "parking", label: "Parking" },
  { key: "balcony", label: "Ballkon" },
  { key: "elevator", label: "Ashensor" },
  { key: "central_heating", label: "Ngrohje qendrore" },
  { key: "internet_included", label: "Internet i përfshirë" }
] as const;

export const listingStatuses: Record<string, string> = {
  pending_review: "Në pritje të miratimit",
  active: "Aktive",
  rented: "E dhënë me qera",
  expired: "E skaduar",
  rejected: "Refuzuar"
};

export function coordinatesFor(city: string, neighborhood: string) {
  return neighborhoodCoordinates[`${city}:${neighborhood}`] ?? { lat: 42.6026, lng: 20.903 };
}
