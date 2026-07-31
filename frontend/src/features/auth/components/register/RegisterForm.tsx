import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/validators/auth';
import { useRegister } from '@/features/auth/hooks';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';

export const RegisterForm = () => {
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const { mutate: registerUser, isPending, error: registerError } = useRegister();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'provider',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = (data: RegisterInput) => {
    setIsRedirecting(true);
    registerUser(data, {
      onError: () => {
        setIsRedirecting(false);
      },
    });
  };

  const errorMessage =
    (registerError as any)?.response?.data?.message ||
    (registerError ? 'Registration failed. Please check your inputs.' : null);

  return (
    <div className="w-full max-w-md bg-white rounded-xl border border-[var(--border)] shadow-xs p-8 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-[var(--brand-500)] text-white flex items-center justify-center font-bold mx-auto shadow-sm">
          <Activity className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Create Account
        </h1>
        <p className="text-xs text-[var(--text-secondary)]">
          Register your role in the ClaimCare platform
        </p>
      </div>

      {/* Server Error Alert */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Register Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--text-secondary)] block">
            Full Name
          </label>
          <div className="relative">
            <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              {...register('name')}
              type="text"
              placeholder="Dr. Sarah Connor"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] bg-white"
            />
          </div>
          {errors.name && <p className="text-xs text-red-600 font-medium">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--text-secondary)] block">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              {...register('email')}
              type="email"
              placeholder="name@organization.com"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] bg-white"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-600 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--text-secondary)] block">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 6 characters"
              className="w-full pl-9 pr-10 py-2 text-sm rounded-lg border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-600 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Role Selection */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--text-secondary)] block">
            Select Role
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'provider', label: 'Provider' },
              { id: 'reviewer', label: 'Reviewer' },
              { id: 'admin', label: 'Admin' },
            ].map((roleObj) => (
              <button
                key={roleObj.id}
                type="button"
                onClick={() => setValue('role', roleObj.id as any)}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all flex flex-col items-center justify-center gap-1 ${
                  selectedRole === roleObj.id
                    ? 'border-[var(--brand-500)] bg-[var(--brand-50)] text-[var(--brand-700)] font-semibold shadow-xs'
                    : 'border-[var(--border)] bg-white text-[var(--text-secondary)] hover:bg-gray-50'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{roleObj.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          isLoading={isPending || isRedirecting}
          loadingText="Creating Account..."
          className="w-full mt-2"
        >
          <span>Register Account</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--text-secondary)]">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--brand-500)] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
