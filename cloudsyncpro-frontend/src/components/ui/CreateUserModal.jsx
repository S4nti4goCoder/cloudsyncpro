import {
  X,
  UserPlus,
  User,
  Mail,
  Shield,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import usePasswordValidation from "../../hooks/usePasswordValidation";
import PasswordStrengthIndicator from "./PasswordStrengthIndicator";

// Esquema de validación
const createUserSchema = yup.object({
  name_user: yup
    .string()
    .required("El nombre es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  email_user: yup
    .string()
    .email("Correo electrónico inválido")
    .required("El correo electrónico es obligatorio"),
  password_user: yup
    .string()
    .required("La contraseña es obligatoria")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  role_user: yup
    .string()
    .oneOf(["user", "admin"], "Rol inválido")
    .required("El rol es obligatorio"),
});

const CreateUserModal = ({ isOpen, onClose, onSave, isLoading = false }) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(createUserSchema),
    defaultValues: {
      name_user: "",
      email_user: "",
      password_user: "",
      role_user: "user",
    },
  });

  const password = watch("password_user");
  const formData = watch();
  const { validation, isLoading: validationLoading } =
    usePasswordValidation(password);

  console.log("📊 Form data en tiempo real:", formData);
  console.log("🔑 Password actual:", password);

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

  // Reset form cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleFormSubmit = (data) => {
    console.log("🔥 handleFormSubmit ejecutado con data:", data);

    // Validar que la contraseña sea válida antes de enviar
    if (validation && !validation.isValid) {
      console.log("❌ Contraseña no válida, validation:", validation);
      return; // No enviar si la contraseña no es válida
    }

    console.log("✅ Contraseña válida, enviando datos...");
    console.log("🚀 Llamando onSave con:", data);
    onSave(data);
  };

  if (!isOpen) return null;

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
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mr-4">
              <UserPlus className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Crear Nuevo Usuario
              </h3>
              <p className="text-sm text-gray-500">
                Agregar un nuevo usuario al sistema
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

        {/* ⭐ FORM DEBE INCLUIR CONTENIDO Y FOOTER */}
        <form
          onSubmit={(e) => {
            console.log("🚀 FORM ONSUBMIT EJECUTADO");
            e.preventDefault();
            handleSubmit(handleFormSubmit)(e);
          }}
        >
          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              {/* Todos los campos van aquí */}

              {/* Nombre completo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nombre completo
                </label>
                <input
                  type="text"
                  {...register("name_user")}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors cursor-text border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Ingresa el nombre completo"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Correo electrónico
                </label>
                <input
                  type="email"
                  {...register("email_user")}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors cursor-text border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="usuario@ejemplo.com"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password_user")}
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors cursor-text border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <PasswordStrengthIndicator
                  password={password}
                  validation={validation}
                  isLoading={validationLoading}
                />
              </div>

              {/* Rol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Rol del usuario
                </label>
                <select
                  {...register("role_user")}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors cursor-pointer border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            {/* Información adicional */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    Información importante
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• El usuario recibirá sus credenciales de acceso</li>
                    <li>• Se creará con estado "Activo" por defecto</li>
                    <li>• Podrá cambiar su contraseña en su primer acceso</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ⭐ FOOTER DEBE ESTAR DENTRO DEL FORM */}
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
              disabled={isLoading || (validation && !validation.isValid)}
              className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[140px] justify-center cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Crear Usuario
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUserModal;
