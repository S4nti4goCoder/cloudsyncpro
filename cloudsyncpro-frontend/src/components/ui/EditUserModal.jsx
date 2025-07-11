import { X, Edit, User, Mail, Shield, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

const EditUserModal = ({
  isOpen,
  onClose,
  onSave,
  user,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name_user: "",
    email_user: "",
    role_user: "user",
    status_user: "active",
  });
  const [errors, setErrors] = useState({});

  // Llenar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name_user: user.name_user || "",
        email_user: user.email_user || "",
        role_user: user.role_user || "user",
        status_user: user.status_user || "active",
      });
      setErrors({});
    }
  }, [isOpen, user]);

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, isLoading]);

  // Validaciones
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name_user.trim()) {
      newErrors.name_user = "El nombre es obligatorio";
    } else if (formData.name_user.trim().length < 2) {
      newErrors.name_user = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.email_user.trim()) {
      newErrors.email_user = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email_user)) {
      newErrors.email_user = "El email no es válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  // Detectar si hay cambios (solo nombre y email)
  const hasChanges = () => {
    if (!user) return false;
    return (
      formData.name_user !== user.name_user ||
      formData.email_user !== user.email_user
    );
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 transition-opacity duration-300 cursor-pointer"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mr-4">
              <Edit className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Editar Usuario
              </h3>
              <p className="text-sm text-gray-500">
                Modificar información del usuario
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* User Avatar */}
          <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-semibold">
                {formData.name_user?.charAt(0).toUpperCase() ||
                  user.name_user?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-4">
              <p className="font-semibold text-gray-900">Editando usuario</p>
              <p className="text-sm text-gray-500">ID: {user.id_user}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nombre completo
              </label>
              <input
                type="text"
                value={formData.name_user}
                onChange={(e) => handleInputChange("name_user", e.target.value)}
                disabled={isLoading}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-text ${
                  errors.name_user
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="Ingresa el nombre completo"
              />
              {errors.name_user && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.name_user}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Correo electrónico
              </label>
              <input
                type="email"
                value={formData.email_user}
                onChange={(e) =>
                  handleInputChange("email_user", e.target.value)
                }
                disabled={isLoading}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-text ${
                  errors.email_user
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="usuario@ejemplo.com"
              />
              {errors.email_user && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email_user}
                </p>
              )}
            </div>
          </div>

          {/* Warning si cambió email */}
          {formData.email_user !== user.email_user && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Cambio de email detectado
                  </p>
                  <p className="text-sm text-yellow-700">
                    El usuario deberá usar el nuevo email para iniciar sesión.
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 bg-gray-50 rounded-b-2xl border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !hasChanges()}
            className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[140px] justify-center cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
