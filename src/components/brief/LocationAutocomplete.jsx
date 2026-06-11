import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { COURT_LOCATIONS, REGIONAL_LOCATIONS } from "@/components/brief/FeeData";

const ALL_LOCATIONS = [
  "Melbourne CBD",
  "Melbourne",
  ...COURT_LOCATIONS.filter(l => l !== "REGIONAL LOCATION"),
  ...REGIONAL_LOCATIONS,
].map(l => l.charAt(0) + l.slice(1).toLowerCase());

export default function LocationAutocomplete({ value, onChange, placeholder }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    if (val.length > 0) {
      const filtered = ALL_LOCATIONS.filter(l =>
        l.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 8);
      setSuggestions(filtered);
      setOpen(filtered.length > 0);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  };

  const handleSelect = (loc) => {
    setQuery(loc);
    onChange(loc);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={query}
        onChange={handleInput}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        placeholder={placeholder || "Type a location..."}
        autoComplete="off"
      />
      {open && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-52 overflow-auto text-sm">
          {suggestions.map((loc) => (
            <li
              key={loc}
              onMouseDown={() => handleSelect(loc)}
              className="px-3 py-2 cursor-pointer hover:bg-slate-100 text-slate-700"
            >
              {loc}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}