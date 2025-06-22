
import React from 'react';
import { cn } from '@/lib/utils';

const colors = [
  '#000000', '#4b5563', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef'
];

const ColorPicker = ({ color, onChange }) => {
  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: color }}></div>
        <input 
          type="text" 
          value={color} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-1 border rounded-md"
          placeholder="#000000"
        />
      </div>
      <div className="grid grid-cols-12 gap-1 mt-2">
        {colors.map(c => (
          <button
            key={c}
            type="button"
            className={cn(
              "w-full h-6 rounded-md transition-transform hover:scale-110",
              c === color && 'ring-2 ring-offset-2 ring-primary'
            )}
            style={{ backgroundColor: c }}
            onClick={() => onChange(c)}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
