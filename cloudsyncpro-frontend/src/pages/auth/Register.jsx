import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { registerSchema } from "../../utils/validationSchemas";
import { authService } from "../../services/authService";

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
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const result = await authService.register(data.email, data.password);

      if (result.success) {
        // ✅ SUCCESS - Registro exitoso
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
        // ❌ ERROR - Error en el registro (email ya existe, etc.)
        toast.error("Error en el registro", {
          description: result.message,
        });
        setError("email", { message: result.message });
      }
    } catch (error) {
      // ❌ ERROR - Error de conexión
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
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="full"
              loading={loading}
              disabled={loading}
            >
              Registrarse
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
