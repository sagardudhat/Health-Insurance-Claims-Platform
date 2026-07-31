'use client';

import React from 'react';
import { LoginForm } from './login/LoginForm';

export const LoginView = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[var(--bg)]">
      <LoginForm />
    </div>
  );
};
