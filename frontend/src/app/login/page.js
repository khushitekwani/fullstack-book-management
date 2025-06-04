"use client";

import React, { useState, useEffect } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import { login } from '../api/apiHandler';

const VisibilityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const VisibilityOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

// Login validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  login_type: Yup.string()
    .oneOf(['simple', 'google', 'facebook'], 'Invalid login type')
    .required('Login type is required'),
  role: Yup.string()
    .oneOf(['user', 'admin'], 'Invalid role')
    .required('Role is required'),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token) {
      router.push(role === 'admin' ? '/dashboard-admin' : '/dashboard-user');
    }
  }, [router]);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      
      const result = await login(values);

      if (result && result.code === '1') {
        console.log("Login successful", result);

        localStorage.setItem("token", result?.data?.token);
        localStorage.setItem("role", values.role); // Store role from form

        // Show success message
        toast.success("Login successful! Redirecting...", {
          position: "top-right",
          autoClose: 1500,
        });

        setTimeout(() => {
          if (values.role === 'admin') {
            router.push("/dashboard-admin");
          } else {
            router.push("/dashboard-user");
          }
        }, 1500);
      } else {
        // Handle API error
        throw new Error(result?.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      
      // Show error message
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.message || "Something went wrong. Please try again.",
        confirmButtonColor: '#3B82F6',
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer />
      
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="px-6 py-8 sm:p-10">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-sm text-gray-600 mb-6">Sign in to your account to continue</p>
          </div>

          <Formik
            initialValues={{
              email: '',
              password: '',
              login_type: 'simple',
              role: 'user', // Default role is user
            }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Field
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring focus:outline-none ${
                      errors.email && touched.email
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                        : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Field
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 border rounded-lg shadow-sm pr-10 focus:ring focus:outline-none ${
                        errors.password && touched.password
                          ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                          : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                      tabIndex="-1" // Prevents tab focus on this button
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Login Type */}
                <div>
                  <label htmlFor="login_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Login Type
                  </label>
                  <Field
                    as="select"
                    id="login_type"
                    name="login_type"
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-white focus:ring focus:outline-none appearance-none ${
                      errors.login_type && touched.login_type
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                        : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  >
                    <option value="simple">Simple</option>
                    <option value="google">Google</option>
                    <option value="facebook">Facebook</option>
                  </Field>
                  <ErrorMessage name="login_type" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Role Selection */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Login As
                  </label>
                  <Field
                    as="select"
                    id="role"
                    name="role"
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm bg-white focus:ring focus:outline-none appearance-none ${
                      errors.role && touched.role
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                        : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  >
                    <option value="user">user</option>
                    <option value="admin">Admin</option>
                  </Field>
                  <ErrorMessage name="role" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember_me"
                      name="remember_me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                      loading || isSubmitting
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    } transition duration-300`}
                  >
                    {loading ? 'Signing in...' : 'Sign in'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>

          {/* Social Login Options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="sr-only">Sign in with Google</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.545,10.239L12.545,10.239v3.818h5.278c-0.494,2.373-2.289,3.83-5.278,3.83c-3.139,0-5.792-2.69-5.792-5.666s2.653-5.666,5.792-5.666c1.512,0,2.926,0.529,3.957,1.594l0,0l2.826-2.826c-1.782-1.721-4.112-2.681-6.783-2.681c-5.483,0-9.993,4.51-9.993,9.993s4.51,9.993,9.993,9.993c4.931,0,9.495-3.637,9.495-9.993c0-0.725-0.096-1.428-0.259-2.097H12.545z" />
                  </svg>
                </button>
              </div>

              <div>
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="sr-only">Sign in with Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Dont have an account?
              <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
