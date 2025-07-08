import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Mail, ArrowLeft } from "lucide-react";

import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { forgotPasswordSchema } from "../../utils/validationSchemas";
import { authService } from "../../services/authService";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const result = await authService.forgotPassword(data.email);

      if (result.success) {
        setSubmitted(true);
      } else {
        setError("email", { message: result.message });
      }
    } catch (error) {
      setError("email", { message: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Correo enviado
              </h2>
              <p className="text-gray-600 mb-6">
                Te hemos enviado un enlace de recuperación a tu correo
                electrónico. Revisa tu bandeja de entrada y sigue las
                instrucciones.
              </p>
              <Link
                to="/login"
                className="text-[#082563] hover:text-[#061a4a] font-medium"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al login
            </Link>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¿Olvidaste tu contraseña?
              </h2>

              <p className="text-[#082563] text-sm">
                Ingresa tu email y te enviaremos un link para recuperar tu
                contraseña
              </p>
            </div>
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
                placeholder="tu-email@ejemplo.com"
                icon={Mail}
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="full"
              variant="secondary"
              loading={loading}
              disabled={loading}
            >
              Enviar link de recuperación
            </Button>

            {/* Links */}
            <div className="text-center">
              <div className="text-sm text-gray-600">
                ¿Recordaste tu contraseña?{" "}
                <Link
                  to="/login"
                  className="text-[#082563] hover:text-[#061a4a] font-medium"
                >
                  Iniciar sesión
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
