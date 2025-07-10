import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import PasswordStrengthIndicator from "../../components/ui/PasswordStrengthIndicator";
import { registerSchema } from "../../utils/validationSchemas";
import { authService } from "../../services/authService";
import usePasswordValidation from "../../hooks/usePasswordValidation";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  // Observar campos para validación en tiempo real
  const email = watch("email");
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  // Hook personalizado para validación de contraseña
  const { validation, isLoading: validationLoading } =
    usePasswordValidation(password);

  // Lógica simple - solo 2 casos para deshabilitar
  const isFormValid = () => {
    // Caso 1: Email inválido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return false;
    }

    // Caso 2: Contraseñas no coinciden (si ambas están llenas)
    if (password && confirmPassword && password !== confirmPassword) {
      return false;
    }

    // En todos los demás casos, el botón está habilitado
    return true;
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const result = await authService.register(data.email, data.password);

      if (result.success) {
        toast.success("¡Registro exitoso!", {
          description: "Tu cuenta ha sido creada correctamente",
          duration: 3000,
        });

        setTimeout(() => {
          navigate("/login", {
            state: {
              message:
                "Registro completado. Inicia sesión con tus credenciales.",
            },
          });
        }, 1000);
      } else {
        toast.error("Error en el registro", {
          description: result.message,
        });
        setError("email", { message: result.message });
      }
    } catch (error) {
      toast.error("Error de conexión", {
        description: "No se pudo conectar con el servidor",
      });
      setError("email", { message: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Registro</h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                icon={Mail}
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                icon={Lock}
                showPasswordToggle
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                error={errors.password?.message}
                {...register("password")}
              />

              {/* Indicador de fortaleza - solo informativo */}
              <PasswordStrengthIndicator
                password={password}
                validation={validation}
                isLoading={validationLoading}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar contraseña
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                icon={Lock}
                showPasswordToggle
                showPassword={showConfirmPassword}
                onTogglePassword={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />

              {/* Indicador de coincidencia de contraseñas */}
              {password && confirmPassword && (
                <div className="mt-2">
                  <div
                    className={`flex items-center space-x-2 text-xs ${
                      password === confirmPassword
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {password === confirmPassword ? (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Las contraseñas coinciden</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Las contraseñas no coinciden</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button - sin tooltip */}
            <Button
              type="submit"
              size="full"
              loading={loading}
              disabled={loading || !isFormValid()}
              className={`w-full transition-all duration-200 ${
                !isFormValid()
                  ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed opacity-60"
                  : ""
              }`}
            >
              {loading ? "Registrando..." : "Registrarse"}
            </Button>

            {/* Links */}
            <div className="text-center">
              <div className="text-sm text-gray-600">
                ¿Ya tienes cuenta?{" "}
                <Link
                  to="/login"
                  className="text-[#082563] hover:text-[#061a4a] font-medium"
                >
                  Inicia sesión
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
