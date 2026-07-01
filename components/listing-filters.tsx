"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { cities, furnishedOptions, neighborhoodsByCity, propertyTypes } from "@/lib/constants";

type ListingFilterValues = {
  city?: string;
  neighborhood?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  furnished?: string;
  propertyType?: string;
  sort?: string;
};

function PillSelect({
  name,
  value,
  options
}: {
  name: string;
  value?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <label key={option.value} className="cursor-pointer">
          <input className="peer sr-only" type="radio" name={name} value={option.value} defaultChecked={value === option.value} />
          <span className="inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition peer-checked:border-brand-600 peer-checked:bg-brand-50 peer-checked:text-brand-700">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}

function FilterFields({ values, onDone }: { values: ListingFilterValues; onDone?: () => void }) {
  const initialCity = cities.includes(values.city as any) ? (values.city as (typeof cities)[number]) : "";
  const [city, setCity] = useState<(typeof cities)[number] | "">(initialCity);
  const neighborhoodOptions = useMemo(
    () => (city ? neighborhoodsByCity[city] : Object.values(neighborhoodsByCity).flat()),
    [city]
  );

  return (
    <>
      <label className="block space-y-2">
        <span className="label">Qyteti</span>
        <select
          name="city"
          className="field"
          value={city}
          onChange={(event) => setCity(event.target.value as (typeof cities)[number] | "")}
        >
          <option value="">Të gjitha</option>
          {cities.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="block space-y-2">
        <span className="label">Lagjja</span>
        <select name="neighborhood" className="field" defaultValue={values.neighborhood ?? ""}>
          <option value="">Të gjitha</option>
          {neighborhoodOptions.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-2">
          <span className="label">Çmimi min.</span>
          <input name="minPrice" className="field" type="number" min="0" defaultValue={values.minPrice ?? ""} />
        </label>
        <label className="block space-y-2">
          <span className="label">Çmimi max.</span>
          <input name="maxPrice" className="field" type="number" min="0" defaultValue={values.maxPrice ?? ""} />
        </label>
      </div>
      <div className="space-y-2">
        <span className="label">Dhoma</span>
        <PillSelect
          name="bedrooms"
          value={values.bedrooms}
          options={[
            { value: "", label: "Të gjitha" },
            { value: "1", label: "1" },
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4", label: "4+" }
          ]}
        />
      </div>
      <div className="space-y-2">
        <span className="label">Tipi</span>
        <PillSelect
          name="propertyType"
          value={values.propertyType}
          options={[{ value: "", label: "Të gjitha" }, ...propertyTypes.map((item) => ({ value: item.value, label: item.label }))]}
        />
      </div>
      <label className="flex min-h-12 items-center justify-between rounded-2xl border border-slate-200 bg-white px-4">
        <span className="text-sm font-bold text-slate-700">E mobiluar</span>
        <select name="furnished" className="bg-transparent text-sm font-bold text-slate-700 outline-none" defaultValue={values.furnished ?? ""}>
          <option value="">Të gjitha</option>
          {furnishedOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </label>
      <label className="block space-y-2">
        <span className="label">Rendit</span>
        <select name="sort" className="field" defaultValue={values.sort ?? "newest"}>
          <option value="newest">Më të rejat</option>
          <option value="price_asc">Çmimi ulët-lartë</option>
          <option value="price_desc">Çmimi lartë-ulët</option>
        </select>
      </label>
      <button className="button-primary w-full" onClick={onDone}>
        Apliko filtrat
      </button>
      <Link href="/listings" className="button-secondary w-full">
        Pastro filtrat
      </Link>
    </>
  );
}

export function ListingFilters({ values }: { values: ListingFilterValues }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="button-secondary sticky top-20 z-20 mb-4 w-full bg-white lg:hidden" onClick={() => setOpen(true)}>
        <SlidersHorizontal size={16} />
        Filtro shpalljet
      </button>

      <form className="hidden gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:grid">
        <div>
          <h2 className="text-lg font-black text-slate-950">Filtrat</h2>
          <p className="text-sm text-slate-500">Gjej banesën që të përshtatet.</p>
        </div>
        <FilterFields values={values} />
      </form>

      {open ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden">
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">Filtrat</h2>
                <p className="text-sm text-slate-500">Përshtat kërkimin</p>
              </div>
              <button
                type="button"
                className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200"
                onClick={() => setOpen(false)}
                aria-label="Mbyll filtrat"
              >
                <X size={18} />
              </button>
            </div>
            <form className="grid gap-4">
              <FilterFields values={values} onDone={() => setOpen(false)} />
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
