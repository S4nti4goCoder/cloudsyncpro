import { forwardRef } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

const Input = forwardRef(
  (
    {
      type = "text",
      placeholder,
      error,
      icon: Icon,
      showPasswordToggle = false,
      showPassword = false,
      onTogglePassword,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className="space-y-1">
        <div className="relative">
          {Icon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Icon size={18} />
            </div>
          )}

          <input
            ref={ref}
            type={
              showPasswordToggle ? (showPassword ? "text" : "password") : type
            }
            placeholder={placeholder}
            className={`
            w-full h-12 ${Icon ? "pl-12" : "pl-4"} ${
              showPasswordToggle ? "pr-12" : "pr-4"
            }
            border border-gray-200 rounded-lg bg-white
            focus:outline-none focus:ring-2 focus:ring-[#082563] focus:border-[#082563]
            placeholder:text-gray-400 text-gray-700 text-sm
            transition-all duration-200
            ${
              error
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : ""
            }
            ${className}
          `}
            {...props}
          />

          {showPasswordToggle && (
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {error && <p className="text-sm text-red-500 mt-1 ml-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
