import React, { useState } from 'react';

interface FilterOption {
  label: string;
  value: string;
}

interface MultipleInputFilterProps {
  options: FilterOption[]; // Array of filter options
}

const MultipleInputFilter: React.FC<MultipleInputFilterProps> = ({ options }) => {
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const filteredData = (data: string[]): string[] => {
    let filteredResult = data;
    Object.keys(filters).forEach((filterKey) => {
      const filterValue = filters[filterKey];
      if (filterValue.trim() !== '') {
        filteredResult = filteredResult.filter((item) =>
          item.toLowerCase().includes(filterValue.toLowerCase())
        );
      }
    });
    return filteredResult;
  };

  return (
    <div>
      {options.map((option) => (
        <div key={option.value}>
          <label htmlFor={option.value}>{option.label}</label>
          <input
            type="text"
            id={option.value}
            name={option.value}
            value={filters[option.value] || ''}
            onChange={handleFilterChange}
            placeholder={`Enter ${option.label.toLowerCase()} filter value`}
          />
        </div>
      ))}
      <ul>
        {filteredData([
          // Your data source (e.g., an array of strings) goes here
        ]).map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default MultipleInputFilter;
