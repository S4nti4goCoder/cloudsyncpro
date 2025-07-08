import { forwardRef } from "react";

const Checkbox = forwardRef(
  ({ label, error, className = "", id, ...props }, ref) => {
    // Generar un ID único si no se proporciona uno
    const checkboxId =
      id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="space-y-1">
        <div className="flex items-center">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={`
            h-4 w-4 text-[#082563] bg-white border-gray-300 rounded 
            focus:ring-[#082563] focus:ring-2 focus:ring-offset-0
            checked:bg-[#082563] checked:border-[#082563]
            hover:border-[#082563] transition-colors duration-200
            ${error ? "border-red-500" : ""}
            ${className}
          `}
            style={{
              accentColor: "#082563",
            }}
            {...props}
          />
          {label && (
            <label
              htmlFor={checkboxId}
              className="ml-3 text-sm text-gray-600 cursor-pointer select-none"
            >
              {label}
            </label>
          )}
        </div>

        {error && <p className="text-sm text-red-500 ml-1">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
