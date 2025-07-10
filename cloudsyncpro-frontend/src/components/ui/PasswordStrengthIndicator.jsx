const PasswordStrengthIndicator = ({ password, validation, isLoading }) => {
  // Mostrar el componente incluso con un solo carácter
  if (!password) return null;

  const getStrengthColor = (level) => {
    const colors = {
      muy_debil: "bg-red-500",
      debil: "bg-orange-500",
      moderada: "bg-yellow-500",
      fuerte: "bg-green-500",
      muy_fuerte: "bg-green-600",
    };
    return colors[level] || "bg-gray-300";
  };

  const getStrengthText = (level) => {
    const texts = {
      muy_debil: "Muy débil",
      debil: "Débil",
      moderada: "Moderada",
      fuerte: "Fuerte",
      muy_fuerte: "Muy fuerte",
    };
    return texts[level];
  };

  // Mostrar "Débil" por defecto para contraseñas muy cortas
  const strengthText = getStrengthText(validation?.strengthLevel) || "Débil";
  const strengthScore = validation?.strengthScore || 5; // Mínimo 5% para que se vea algo

  return (
    <div className="mt-2 space-y-3">
      {/* Barra de fortaleza */}
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isLoading
                  ? "bg-blue-400 animate-pulse"
                  : getStrengthColor(validation?.strengthLevel || "muy_debil")
              }`}
              style={{
                width: `${Math.max(5, strengthScore)}%`,
              }}
            />
          </div>
        </div>

        {/* Mostrar texto siempre */}
        <span
          className={`text-xs font-medium min-w-[60px] text-right ${
            isLoading
              ? "text-blue-600"
              : validation?.strengthScore >= 100
              ? "text-green-600"
              : validation?.strengthScore >= 66
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {isLoading ? "Verificando..." : strengthText}
        </span>
      </div>

      {/* Cuadro de requisitos - mostrar desde el primer carácter */}
      <div className="p-3 bg-white border border-gray-200 rounded-lg">
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-600">
              Requisitos de seguridad
            </span>
            <span className="text-xs text-gray-500">
              {isLoading ? "..." : validation?.strengthScore || 0}/100
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <RequirementBadge
              met={validation?.requirements?.minLength || false}
              text="8+ caracteres"
              isLoading={isLoading}
            />
            <RequirementBadge
              met={validation?.requirements?.hasUpperCase || false}
              text="Mayúscula"
              isLoading={isLoading}
            />
            <RequirementBadge
              met={validation?.requirements?.hasLowerCase || false}
              text="Minúscula"
              isLoading={isLoading}
            />
            <RequirementBadge
              met={validation?.requirements?.hasNumbers || false}
              text="Número"
              isLoading={isLoading}
            />
            <RequirementBadge
              met={validation?.requirements?.hasSpecialChars || false}
              text="Especial"
              isLoading={isLoading}
            />
            <RequirementBadge
              met={validation?.requirements?.noCommonPasswords || false}
              text="No común"
              isLoading={isLoading}
            />
          </div>

          {/* Sugerencia principal */}
          {validation?.suggestions && validation.suggestions.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <p className="text-xs text-blue-600">
                💡 {validation.suggestions[0]}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para badges con estado de loading
const RequirementBadge = ({ met, text, isLoading }) => (
  <div
    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-all duration-200 ${
      isLoading
        ? "bg-blue-100 text-blue-700"
        : met
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700"
    }`}
  >
    <div
      className={`w-2 h-2 rounded-full ${
        isLoading
          ? "bg-blue-500 animate-pulse"
          : met
          ? "bg-green-500"
          : "bg-red-500"
      }`}
    />
    <span>{text}</span>
  </div>
);

export default PasswordStrengthIndicator;
