import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

export default function AddressAutocomplete({ label, name, value, onChange, required }) {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounceRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        setQuery(value || '');
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInput = (e) => {
        const val = e.target.value;
        setQuery(val);
        onChange({ target: { name, value: val } });

        clearTimeout(debounceRef.current);
        if (val.length < 3) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            const res = await base44.functions.invoke('addressAutocomplete', { input: val });
            setSuggestions(res.data?.suggestions || []);
            setShowDropdown(true);
            setLoading(false);
        }, 300);
    };

    const handleSelect = (suggestion) => {
        setQuery(suggestion.description);
        onChange({ target: { name, value: suggestion.description } });
        setSuggestions([]);
        setShowDropdown(false);
    };

    return (
        <div className="space-y-1" ref={containerRef}>
            <label className="block text-sm font-medium text-gray-700">
                {label}{required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInput}
                    onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                    placeholder="Start typing an address..."
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
                />
                {loading && (
                    <div className="absolute right-3 top-2.5 text-gray-400 text-xs">Searching...</div>
                )}
                {showDropdown && suggestions.length > 0 && (
                    <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                        {suggestions.map((s) => (
                            <li
                                key={s.place_id}
                                onMouseDown={() => handleSelect(s)}
                                className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
                            >
                                {s.description}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}