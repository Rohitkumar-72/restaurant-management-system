import { Search, X } from 'lucide-react';

function SearchBar({ value, onChange }) {
  return (
    <div className="menu-search">
      <Search size={18} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search dishes or categories"
        aria-label="Search menu"
      />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Clear search">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;