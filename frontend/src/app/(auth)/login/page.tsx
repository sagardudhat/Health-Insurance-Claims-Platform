'use client';

import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/validators/auth';
import { useLogin } from '@/features/auth/hooks';
import { Button } from '@/components/ui/button';
import { Activity, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const { mutate: login, isPending, error: loginError } = useLogin();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginInput) => {
    setIsRedirecting(true);
    login(data, {
      onError: () => {
        setIsRedirecting(false);
      },
    });
  };

  const errorMessage =
    (loginError as any)?.response?.data?.message ||
    (loginError ? 'Failed to sign in. Check email and password.' : null);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[var(--bg)]">
      <div className="w-full max-w-md bg-white rounded-xl border border-[var(--border)] shadow-xs p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[var(--brand-500)] text-white flex items-center justify-center font-bold mx-auto shadow-sm">
            <Activity className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">ClaimCare Login</h1>
          <p className="text-xs text-[var(--text-secondary)]">Enter your credentials to access your portal</p>
        </div>

        {/* Server Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-secondary)] block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                {...register('email')}
                type="email"
                placeholder="name@organization.com"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] bg-white"
              />
            </div>
            {errors.email && <p className="text-xs text-red-600 font-medium">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-secondary)] block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)] bg-white"
              />
            </div>
            {errors.password && <p className="text-xs text-red-600 font-medium">{errors.password.message}</p>}
          </div>

          <Button
            type="submit"
            isLoading={isPending || isRedirecting}
            loadingText="Authenticating..."
            className="w-full"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--text-secondary)]">
            Don't have an account?{' '}
            <Link href="/register" className="text-[var(--brand-500)] font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
