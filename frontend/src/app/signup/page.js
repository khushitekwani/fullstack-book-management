"use client";
import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { signup } from '../api/apiHandler';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Validation schema using Yup
const SignupSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
    .required('Mobile number is required'),
  login_type: Yup.string()
    .oneOf(['simple', 'google', 'facebook'], 'Invalid login type')
    .required('Login type is required')
});

function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      const result = await signup(values);
      console.log("Signup result:", result);
      
      if (result.code === '1') {
        toast.success(result.message);
        router.push("/login");
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Signup Failed',
          text: result.message || "Something went wrong",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Signup Failed',
        text: "Something went wrong",
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-semibold mb-8 text-center text-gray-800">Create Account</h2>
        
        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            mobile: '',
            login_type: 'simple',
            role: 'user'
          }}
          validationSchema={SignupSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              {/* Name Field */}
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Field
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 border rounded-md shadow-sm focus:ring-2 focus:outline-none ${
                    errors.name && touched.name 
                      ? 'border-red-400 focus:ring-red-200 focus:border-red-400' 
                      : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm mt-2 font-medium"
                />
              </div>

              {/* Email Field */}
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className={`w-full px-4 py-3 border rounded-md shadow-sm focus:ring-2 focus:outline-none ${
                    errors.email && touched.email 
                      ? 'border-red-400 focus:ring-red-200 focus:border-red-400' 
                      : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm mt-2 font-medium"
                />
              </div>

              {/* Password Field */}
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Field
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 border rounded-md shadow-sm focus:ring-2 focus:outline-none ${
                      errors.password && touched.password 
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-400' 
                        : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm mt-2 font-medium"
                />
              </div>

              {/* Confirm Password Field */}
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Field
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 border rounded-md shadow-sm focus:ring-2 focus:outline-none ${
                      errors.confirmPassword && touched.confirmPassword 
                        ? 'border-red-400 focus:ring-red-200 focus:border-red-400' 
                        : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={toggleConfirmPasswordVisibility}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm mt-2 font-medium"
                />
              </div>

              {/* Mobile Field */}
              <div className="mb-6">
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <Field
                  id="mobile"
                  name="mobile"
                  type="tel"
                  placeholder="1234567890"
                  className={`w-full px-4 py-3 border rounded-md shadow-sm focus:ring-2 focus:outline-none ${
                    errors.mobile && touched.mobile 
                      ? 'border-red-400 focus:ring-red-200 focus:border-red-400' 
                      : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                />
                <ErrorMessage
                  name="mobile"
                  component="div"
                  className="text-red-500 text-sm mt-2 font-medium"
                />
              </div>

              {/* Login Type */}
              <div className="mb-8">
                <label htmlFor="login_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Method
                </label>
                <Field
                  as="select"
                  id="login_type"
                  name="login_type"
                  className={`w-full px-4 py-3 border rounded-md shadow-sm bg-white focus:ring-2 focus:outline-none appearance-none ${
                    errors.login_type && touched.login_type 
                      ? 'border-red-400 focus:ring-red-200 focus:border-red-400' 
                      : 'border-gray-300 focus:ring-blue-100 focus:border-blue-500'
                  }`}
                >
                  <option value="simple">Simple</option>
                  <option value="google">Google</option>
                  <option value="facebook">Facebook</option>
                </Field>
                <ErrorMessage
                  name="login_type"
                  component="div"
                  className="text-red-500 text-sm mt-2 font-medium"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium text-base shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:bg-blue-300"
              >
                {loading ? 'Processing...' : 'Create Account'}
              </button>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account? <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">Sign In</a>
                </p>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default SignupPage;