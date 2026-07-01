"use client";

import NextImage from "next/image";
import Link from "next/link";
import { CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { amenities, cities, coordinatesFor, furnishedOptions, neighborhoodsByCity, propertyTypes } from "@/lib/constants";
import { createBrowserSupabase } from "@/lib/supabase-client";

async function compressImage(file: File): Promise<Blob> {
  const imageUrl = URL.createObjectURL(file);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageUrl;
  });

  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Nuk mund të përpunohet fotografia.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(imageUrl);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Kompresimi dështoi."))), "image/webp", 0.82);
  });
}

export function ListingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [city, setCity] = useState<(typeof cities)[number]>(cities[0]);
  const neighborhoods = useMemo(() => neighborhoodsByCity[city], [city]);
  const [neighborhood, setNeighborhood] = useState(neighborhoodsByCity[cities[0]][0]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function onFilesSelected(selectedFiles: FileList | null) {
    previews.forEach((preview) => URL.revokeObjectURL(preview));
    const nextFiles = Array.from(selectedFiles ?? []).slice(0, 10);
    setFiles(nextFiles);
    setPreviews(nextFiles.map((file) => URL.createObjectURL(file)));
    setProgress(0);
  }

  function removePhoto(index: number) {
    URL.revokeObjectURL(previews[index]);
    setFiles((value) => value.filter((_, itemIndex) => itemIndex !== index));
    setPreviews((value) => value.filter((_, itemIndex) => itemIndex !== index));
  }

  function nextStep() {
    setMessage("");
    setStep((value) => Math.min(3, value + 1));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (files.length < 3 || files.length > 10) {
      setStep(3);
      setMessage("Ngarko minimum 3 dhe maksimum 10 foto.");
      return;
    }

    setLoading(true);
    setProgress(5);
    const form = new FormData(event.currentTarget);
    const supabase = createBrowserSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login?next=/dashboard/new");
      return;
    }

    const contactPhone = String(form.get("contact_phone") ?? "").trim();
    if (!/^\+383[0-9]{8}$/.test(contactPhone)) {
      setLoading(false);
      setProgress(0);
      setStep(2);
      setMessage("Shkruaj numrin në formatin +383XXXXXXXX.");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ phone: contactPhone })
      .eq("id", user.id);

    if (profileError) {
      setLoading(false);
      setProgress(0);
      setStep(2);
      setMessage(profileError.message);
      return;
    }

    const coords = coordinatesFor(city, neighborhood);
    const selectedAmenities = Object.fromEntries(amenities.map((item) => [item.key, form.get(item.key) === "on"]));

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .insert({
        landlord_id: user.id,
        title: String(form.get("title")),
        description: String(form.get("description")),
        price: Number(form.get("price")),
        city,
        neighborhood,
        property_type: String(form.get("property_type")),
        bedrooms: Number(form.get("bedrooms")),
        size_m2: Number(form.get("size_m2")),
        furnished: String(form.get("furnished")),
        available_from: String(form.get("available_from")),
        amenities: selectedAmenities,
        lat: coords.lat,
        lng: coords.lng
      })
      .select("id")
      .single();

    if (listingError || !listing) {
      setLoading(false);
      setProgress(0);
      setMessage(listingError?.message ?? "Shpallja nuk u krijua.");
      return;
    }

    for (const [index, file] of files.entries()) {
      setProgress(Math.round((index / files.length) * 80) + 10);
      const blob = await compressImage(file);
      const storagePath = `${user.id}/${listing.id}/${Date.now()}-${index}.webp`;
      const { error: uploadError } = await supabase.storage.from("listing-photos").upload(storagePath, blob, {
        contentType: "image/webp",
        upsert: false
      });

      if (uploadError) {
        setLoading(false);
        setProgress(0);
        setMessage(uploadError.message);
        return;
      }

      const { error: photoError } = await supabase.from("listing_photos").insert({
        listing_id: listing.id,
        storage_path: storagePath,
        order_index: index
      });

      if (photoError) {
        setLoading(false);
        setProgress(0);
        setMessage(photoError.message);
        return;
      }

      setProgress(Math.round(((index + 1) / files.length) * 90));
    }

    setProgress(100);
    setLoading(false);
    setSuccess(true);
    router.refresh();
  }

  if (success) {
    return (
      <section className="focus-card grid min-h-96 place-items-center p-8 text-center">
        <div>
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand-50 text-brand-700">
            <CheckCircle2 size={42} />
          </div>
          <h2 className="mt-6 text-3xl font-black text-slate-950">Shpallja u dërgua për shqyrtim!</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Admini do ta kontrollojë shpalljen para publikimit.</p>
          <Link href="/dashboard?created=1" className="button-primary mt-6">
            Kthehu te paneli
          </Link>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} className="focus-card space-y-6 p-5 sm:p-7">
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((item) => (
          <div key={item} className={`h-2 rounded-full ${step >= item ? "bg-brand-600" : "bg-slate-200"}`} />
        ))}
      </div>

      <section className={step === 1 ? "grid gap-4 sm:grid-cols-2" : "hidden"}>
        <label className="block space-y-2 sm:col-span-2">
          <span className="label">Titulli</span>
          <input name="title" className="field" />
        </label>
        <label className="block space-y-2 sm:col-span-2">
          <span className="label">Përshkrimi</span>
          <textarea name="description" className="field min-h-32" />
        </label>
        <label className="block space-y-2">
          <span className="label">Tipi i pronës</span>
          <select name="property_type" className="field">
            {propertyTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label className="block space-y-2">
          <span className="label">Çmimi EUR/muaj</span>
          <input name="price" className="field" type="number" min="1" />
        </label>
        <label className="block space-y-2">
          <span className="label">Qyteti</span>
          <select className="field" value={city} onChange={(event) => {
            const nextCity = event.target.value as typeof city;
            setCity(nextCity);
            setNeighborhood(neighborhoodsByCity[nextCity][0]);
          }}>
            {cities.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="block space-y-2">
          <span className="label">Lagjja</span>
          <select className="field" value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)}>
            {neighborhoods.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
        <label className="block space-y-2 sm:col-span-2">
          <span className="label">Në dispozicion nga</span>
          <input name="available_from" className="field" type="date" />
        </label>
      </section>

      <section className={step === 2 ? "space-y-5" : "hidden"}>
        <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
          <label className="block space-y-2">
            <span className="label">Numri për kontakt</span>
            <input
              name="contact_phone"
              className="field"
              placeholder="+38344123456"
              pattern="^\+383[0-9]{8}$"
              required
            />
          </label>
          <p className="mt-2 text-xs font-semibold text-brand-800">
            Ky numër nuk shfaqet publikisht. Shfaqet vetëm pasi ti e aprovon kërkesën e qiramarrësit.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block space-y-2">
            <span className="label">Dhoma gjumi</span>
            <input name="bedrooms" className="field" type="number" min="0" max="10" />
          </label>
          <label className="block space-y-2">
            <span className="label">Sipërfaqja m²</span>
            <input name="size_m2" className="field" type="number" min="1" />
          </label>
          <label className="block space-y-2">
            <span className="label">E mobiluar</span>
            <select name="furnished" className="field">
              {furnishedOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
        </div>
        <fieldset className="space-y-3">
          <legend className="label">Komoditetet</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {amenities.map((item) => (
              <label key={item.key} className="flex min-h-12 items-center gap-2 rounded-2xl border border-slate-200 px-4 text-sm font-semibold">
                <input name={item.key} type="checkbox" className="h-4 w-4 accent-brand-600" />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className={step === 3 ? "space-y-5" : "hidden"}>
        <label className="grid min-h-52 cursor-pointer place-items-center rounded-3xl border-2 border-dashed border-brand-200 bg-brand-50/50 p-6 text-center transition hover:bg-brand-50">
          <input className="sr-only" type="file" accept="image/*" multiple onChange={(event) => onFilesSelected(event.target.files)} />
          <div>
            <ImagePlus className="mx-auto text-brand-700" size={34} />
            <p className="mt-3 font-black text-slate-950">Tërhiq fotot këtu ose kliko për të zgjedhur</p>
            <p className="mt-1 text-sm text-slate-600">Minimum 3 foto, maksimum 10.</p>
          </div>
        </label>
        {previews.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {previews.map((preview, index) => (
              <div key={preview} className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <NextImage src={preview} alt={`Foto ${index + 1}`} fill className="object-cover" unoptimized />
                <button type="button" onClick={() => removePhoto(index)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white text-slate-700 shadow">
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {loading ? (
        <div className="space-y-2">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs font-bold text-slate-600">{progress}% e ngarkuar</p>
        </div>
      ) : null}
      {message ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">{message}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        {step > 1 ? (
          <button type="button" className="button-secondary w-full" onClick={() => setStep((value) => Math.max(1, value - 1))}>
            Kthehu
          </button>
        ) : <span />}
        {step < 3 ? (
          <button type="button" className="button-primary w-full" onClick={nextStep}>
            Tjetër
          </button>
        ) : (
          <button className="button-primary w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            Publiko
          </button>
        )}
      </div>
    </form>
  );
}
