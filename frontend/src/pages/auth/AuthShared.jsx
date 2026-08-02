import { Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa6';
import { FaHexagonNodes } from 'react-icons/fa6';
import { useState } from 'react';

export const AuthLayout = ({ title, subtitle, children }) => (
  <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-ink via-primary-900 to-ink relative overflow-hidden">
    <div className="absolute inset-0 bg-hero-mesh opacity-40" />
    <div className="relative w-full max-w-md">
      <div className="card p-8 shadow-lift">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="relative h-10 w-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FaHexagonNodes className="h-10 w-10 text-ink drop-shadow-sm" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="h-4 w-4 rounded-full bg-accent shadow-[0_0_12px_rgba(250,204,21,0.5)]" />
              </span>
            </span>
            <span className="text-2xl font-black text-ink">Job<span className="bg-gradient-to-r from-accent-dark to-accent bg-clip-text text-transparent">Hive</span></span>
          </Link>
        </div>
        <h1 className="text-2xl font-extrabold text-center">{title}</h1>
        {subtitle && <p className="text-sm text-muted text-center mt-1 mb-6">{subtitle}</p>}
        {children}
      </div>
    </div>
  </div>
);

export const Field = ({ error, children }) => (
  <div>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

export const InputWrap = ({ icon: Icon, show, toggle, children }) => (
  <div className="relative">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
      <Icon className="h-4 w-4" />
    </span>
    {children}
    {show !== undefined && (
      <button
        type="button"
        onClick={toggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-ink"
        tabIndex={-1}
      >
        {show ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
      </button>
    )}
  </div>
);

export const Icon = { FaEnvelope, FaLock, FaEye, FaEyeSlash };
