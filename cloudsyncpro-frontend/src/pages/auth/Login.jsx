import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Checkbox from "../../components/ui/Checkbox";
import { loginSchema } from "../../utils/validationSchemas";
import { authService } from "../../services/authService";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  // Mostrar mensaje de registro exitoso si viene desde register
  useEffect(() => {
    if (location.state?.message) {
      toast.info(location.state.message, {
        duration: 4000,
      });
    }
  }, [location.state]);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const result = await authService.login(data.email, data.password);

      if (result.success) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));

        // ✅ SUCCESS - Login exitoso
        toast.success("¡Inicio de sesión exitoso!", {
          description: `Bienvenido de vuelta, ${result.data.user.name_user}`,
          duration: 3000,
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else {
        // ❌ ERROR - Credenciales incorrectas
        toast.error("Error al iniciar sesión", {
          description: result.message,
        });
        setError("email", { message: result.message });
      }
    } catch (error) {
      // ❌ ERROR - Problema de conexión
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
            <h2 className="text-2xl font-bold text-gray-900">
              Inicio de sesión
            </h2>
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

            {/* Remember Me */}
            <div className="flex items-center">
              <Checkbox
                id="rememberMe"
                label="Recordar correo electrónico"
                {...register("rememberMe")}
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

            {/* Submit Button */}
            <Button
              type="submit"
              size="full"
              loading={loading}
              disabled={loading}
            >
              Ingresar
            </Button>

            {/* Links */}
            <div className="text-center space-y-3">
              <div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#082563] hover:text-[#061a4a] font-semibold"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <div className="text-sm text-gray-600">
                ¿No tienes cuenta?{" "}
                <Link
                  to="/register"
                  className="text-[#082563] hover:text-[#061a4a] font-medium"
                >
                  Regístrate
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
