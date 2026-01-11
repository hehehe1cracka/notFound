import React from 'react';

interface CosmicSearchProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const CosmicSearch: React.FC<CosmicSearchProps> = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="relative rounded-lg w-full max-w-sm overflow-hidden before:absolute before:w-12 before:h-12 before:content[''] before:right-0 before:bg-violet-500 before:rounded-full before:blur-lg after:absolute after:-z-10 after:w-20 after:h-20 after:content[''] after:bg-rose-300 after:right-12 after:top-3 after:rounded-full after:blur-lg">
      <input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="relative bg-transparent ring-0 outline-none border border-neutral-500 text-neutral-900 dark:text-neutral-100 placeholder-violet-700 text-sm rounded-lg focus:ring-violet-500 placeholder-opacity-60 focus:border-violet-500 block w-full p-2.5 checked:bg-emerald-500"
        type="text"
      />
    </div>
  );
}

export default CosmicSearch;
