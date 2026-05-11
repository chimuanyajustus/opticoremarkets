import React from 'react';

interface TableProps {
  headers: string[];
  data: (string | number | React.ReactNode)[][];
  className?: string;
}

const Table: React.FC<TableProps> = ({ headers, data, className = '' }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            {headers.map((header, index) => (
              <th key={index} className="text-left py-3 px-4 font-medium text-gray-300">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="py-3 px-4 text-gray-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;