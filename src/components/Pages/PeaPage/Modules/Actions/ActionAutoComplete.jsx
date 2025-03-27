import React, { useState, useRef, useEffect } from "react";

export default function ActionAutoComplete({ onSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();

  const handleChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    try {
      const response = await fetch(`/api/search_stock?query=${value}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setIsOpen(true);
      } else {
        console.error("Erreur réponse backend", response.status);
      }
    } catch (error) {
      console.error("Erreur fetch côté React:", error);
    }
  };

  const handleSelect = (item) => {
    onSelect(item);
    setQuery(item.name);
    setSuggestions([]);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        placeholder="Nom de l'action"
        value={query}
        onChange={handleChange}
        className="w-full p-3 border rounded-3xl bg-gray-50"
      />
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white border rounded shadow-md z-10 max-h-60 overflow-y-auto">
          {suggestions.map((item) => (
            <li
              key={item.symbol}
              onClick={() => handleSelect(item)}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {item.name} ({item.symbol})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
