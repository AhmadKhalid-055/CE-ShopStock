import React, { useState, useRef, useEffect } from 'react';

/**
 * SearchableInput - A custom input with dropdown that filters options
 * as the user types. Matches anywhere in the string (not just prefix).
 * 
 * Props:
 *   options: string[]         - Array of option strings to show
 *   value: string             - Current value
 *   onChange: (val) => void   - Called when value changes
 *   placeholder: string       - Input placeholder
 *   disabled: boolean         - Disable the input
 *   className: string         - Extra class for the input
 */
const SearchableInput = ({ options = [], value, onChange, placeholder, disabled, className = '' }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const containerRef = useRef(null);

  // Sync query with external value changes
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = query.trim()
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const handleSelect = (opt) => {
    setQuery(opt);
    onChange(opt);
    setOpen(false);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    setOpen(true);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        className={`searchable-input ${className}`}
        value={query}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      {open && !disabled && filtered.length > 0 && (
        <ul className="searchable-dropdown-list">
          {filtered.map((opt, i) => (
            <li
              key={i}
              className="searchable-dropdown-item"
              onMouseDown={() => handleSelect(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchableInput;
