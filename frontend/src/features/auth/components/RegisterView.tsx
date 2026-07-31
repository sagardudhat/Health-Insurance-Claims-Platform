'use client';

import React from 'react';
import { RegisterForm } from './register/RegisterForm';

export const RegisterView = () => {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[var(--bg)]">
      <RegisterForm />
    </div>
  );
};
