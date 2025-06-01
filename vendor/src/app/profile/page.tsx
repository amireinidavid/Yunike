'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../store/useAuthStore';
import { Loader2, CheckCircle, ChevronRight, AlertTriangle, ExternalLink } from 'lucide-react';
import StripeRedirectHandler from '../../components/stripe/StripeRedirectHandler';

// At the top of the file, add this constant
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// Validation schema
const vendorProfileSchema = z.object({
  // Basic info
  storeName: z.string().min(3, { message: "Store name must be at least 3 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  shortDescription: z.string().max(150).optional(),

  // Business info
  businessAddress: z.object({
    street: z.string().min(3),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().min(3),
    country: z.string().min(2),
  }),
  businessType: z.enum(['INDIVIDUAL', 'PARTNERSHIP', 'CORPORATION', 'LLC', 'NON_PROFIT']),
  
  // Store policies
  processingTime: z.string().optional(),
  minOrderAmount: z.coerce.number().min(0).optional(),
  freeShippingThreshold: z.coerce.number().min(0).optional(),
  
  // Tags
  tags: z.array(z.string()).optional(),
  
  // Stripe settings
  stripeAccountType: z.enum(['EXPRESS', 'STANDARD', 'CUSTOM']).default('EXPRESS').optional(),
});

type VendorProfileFormValues = z.infer<typeof vendorProfileSchema>;

// Steps configuration
const steps = [
  { id: 1, label: 'Create Account', completed: true },
  { id: 2, label: 'Setup Shop', completed: false },
  { id: 3, label: 'Connect Bank', completed: false }
];

const VendorProfilePage = () => {
  const router = useRouter();
  const { 
    createVendorProfile, 
    isLoading, 
    error, 
    stripeConnectData, 
    createStripeConnectAccount,
    getStripeOnboardingLink
  } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [tagInput, setTagInput] = useState("");
  const [formError, setFormError] = useState("");
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState("");
  const [profileCreated, setProfileCreated] = useState(false);
  
  // Set up form
  const form = useForm<VendorProfileFormValues>({
    resolver: zodResolver(vendorProfileSchema),
    defaultValues: {
      storeName: '',
      description: '',
      shortDescription: '',
      businessAddress: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
      businessType: 'INDIVIDUAL',
      tags: [],
      stripeAccountType: 'EXPRESS',
    }
  });
  
  // Handle form submission
  const handleSubmit = async (data: VendorProfileFormValues) => {
    setFormError("");
    try {
      console.log("Submitting form data:", data);
      await createVendorProfile(data);
      console.log("Profile created successfully");
      
      // Set profile creation success flag
      setProfileCreated(true);
      
      // Move to the next step (connect bank) after successful profile creation
      setCurrentStep(2);
      
      // For demo or test environments, redirect directly to dashboard
      if (DEMO_MODE) {
        console.log("Demo mode active - redirecting to dashboard");
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      console.error("Error creating profile:", err);
      setFormError(err?.message || "Failed to create profile. Please try again.");
    }
  };

  // Connect Stripe account
  const handleConnectStripe = async () => {
    setStripeLoading(true);
    setStripeError("");
    
    try {
      // First create a Stripe account
      await createStripeConnectAccount(form.getValues('stripeAccountType'));
      
      // Then get the onboarding link
      const onboardingUrl = await getStripeOnboardingLink();
      
      if (onboardingUrl) {
        // Navigate to Stripe's onboarding
        window.location.href = onboardingUrl;
      } else {
        // If no onboarding URL (which shouldn't happen), simulate success for test accounts
        console.log("No onboarding URL returned, redirecting to dashboard");
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error("Error connecting Stripe:", err);
      
      // For demo purposes, allow proceeding even with errors
      if (DEMO_MODE) {
        console.log("Demo mode active - proceeding despite Stripe error");
        setStripeError("Using test account instead. In a real environment, you would connect to Stripe.");
        
        // Wait 2 seconds then redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
        return;
      }
      
      setStripeError(err?.message || "Failed to connect Stripe account. Please try again.");
    } finally {
      setStripeLoading(false);
    }
  };

  // Check for Stripe redirect result on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if this is a redirect from Stripe onboarding
      const url = new URL(window.location.href);
      const setupMode = url.searchParams.get('setup_mode');
      
      if (setupMode === 'complete') {
        // Successfully completed onboarding, go to dashboard
        router.push('/dashboard');
      } else if (setupMode === 'canceled') {
        // User canceled onboarding, show message
        setStripeError("Stripe account setup was canceled. You can try again.");
      }
    }
  }, [router]);

  // Go to next step
  const nextStep = () => {
    // Validate current step fields before proceeding
    let isValid = false;
    
    if (currentStep === 0) {
      // Validate basic info
      form.trigger(['storeName', 'description']).then(valid => {
        if (valid) {
          setCurrentStep(1);
        }
      });
      return;
    } 
    
    if (currentStep === 1) {
      // Validate business details
      form.trigger([
        'businessType', 
        'businessAddress.street', 
        'businessAddress.city',
        'businessAddress.state', 
        'businessAddress.postalCode', 
        'businessAddress.country'
      ]).then(valid => {
        if (valid) {
          setCurrentStep(2);
        }
      });
      return;
    }
  };

  // Go to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Add tag to form
  const addTag = () => {
    if (!tagInput.trim()) return;
    
    const currentTags = form.getValues('tags') || [];
    if (!currentTags.includes(tagInput.trim())) {
      form.setValue('tags', [...currentTags, tagInput.trim()]);
    }
    setTagInput("");
  };

  // Remove tag from form
  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 } 
    },
    exit: { opacity: 0 }
  };

  const slideIn = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };
  
  // Updated progress classes based on current step
  const getStepClasses = (index: number) => {
    if (index < currentStep) {
      return "bg-blue-600 text-white border-blue-600"; // completed
    } else if (index === currentStep) {
      return "bg-blue-600 text-white border-blue-600"; // current
    }
    return "bg-white text-gray-400 border-gray-300"; // upcoming
  };

  // Handle Stripe redirect success
  const handleStripeSuccess = () => {
    router.push('/dashboard');
  };
  
  // Handle Stripe redirect error
  const handleStripeError = (error: string) => {
    setStripeError(error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
      <StripeRedirectHandler 
        onSuccess={handleStripeSuccess}
        onError={handleStripeError}
      />
      
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700">
            Create Your Vendor Profile
          </h1>
          <p className="text-gray-600 mt-2">Complete your profile to start selling on our platform</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Step connector line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-gray-200"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>
            
            {/* Steps */}
            {steps.map((step, index) => (
              <div key={step.id} className="relative flex flex-col items-center">
                <motion.div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-all ${getStepClasses(index)}`}
                  initial={{ scale: 0.8 }}
                  animate={{ 
                    scale: 1,
                    boxShadow: index <= currentStep ? '0 0 0 4px rgba(59, 130, 246, 0.3)' : 'none'
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </motion.div>
                <span className={`mt-2 text-xs sm:text-sm whitespace-nowrap ${index <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <form 
            onSubmit={form.handleSubmit(handleSubmit)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && currentStep === 2) {
                // Prevent form submission on Enter key in the final step
                e.preventDefault();
              }
            }}
          >
            {formError && (
              <div className="bg-red-50 text-red-600 p-4 border-b border-red-100">
                {formError}
              </div>
            )}
            
            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key="step1"
                  className="p-6 md:p-8"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={containerVariants}
                >
                  <motion.div variants={slideIn} className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Store Basics</h2>
                    <p className="text-gray-500 text-sm mt-1">Tell us about your store</p>
                  </motion.div>

                  <div className="space-y-6">
                    <motion.div variants={slideIn}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                      <input
                        {...form.register('storeName')}
                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800"
                        placeholder="Your Store Name"
                      />
                      {form.formState.errors.storeName && (
                        <p className="mt-1 text-sm text-red-500">
                          {form.formState.errors.storeName.message}
                        </p>
                      )}
                    </motion.div>
                    
                    <motion.div variants={slideIn}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Store Tagline</label>
                      <input
                        {...form.register('shortDescription')}
                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800"
                        placeholder="Brief description of your store"
                      />
                    </motion.div>
                    
                    <motion.div variants={slideIn}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
                      <textarea
                        {...form.register('description')}
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800"
                        placeholder="Describe your store, products, and what makes you unique"
                      />
                      {form.formState.errors.description && (
                        <p className="mt-1 text-sm text-red-500">
                          {form.formState.errors.description.message}
                        </p>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  key="step2"
                  className="p-6 md:p-8"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={containerVariants}
                >
                  <motion.div variants={slideIn} className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Business Details</h2>
                    <p className="text-gray-500 text-sm mt-1">Tell us about your business</p>
                  </motion.div>

                  <div className="space-y-6">
                    <motion.div variants={slideIn}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                      <select
                        {...form.register('businessType')}
                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none text-gray-800"
                      >
                        <option value="INDIVIDUAL">Individual/Sole Proprietor</option>
                        <option value="PARTNERSHIP">Partnership</option>
                        <option value="CORPORATION">Corporation</option>
                        <option value="LLC">Limited Liability Company (LLC)</option>
                        <option value="NON_PROFIT">Non-Profit Organization</option>
                      </select>
                    </motion.div>

                    <motion.div variants={slideIn}>
                      <h3 className="block text-sm font-medium text-gray-700 mb-3">Business Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Street Address</label>
                          <input
                            {...form.register('businessAddress.street')}
                            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800"
                            placeholder="123 Main St"
                          />
                          {form.formState.errors.businessAddress?.street && (
                            <p className="mt-1 text-sm text-red-500">
                              Street address is required
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">City</label>
                          <input
                            {...form.register('businessAddress.city')}
                            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800"
                            placeholder="City"
                          />
                          {form.formState.errors.businessAddress?.city && (
                            <p className="mt-1 text-sm text-red-500">
                              City is required
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">State/Province</label>
                          <input
                            {...form.register('businessAddress.state')}
                            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800"
                            placeholder="State/Province"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Postal/ZIP Code</label>
                          <input
                            {...form.register('businessAddress.postalCode')}
                            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800"
                            placeholder="Postal Code"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm text-gray-600 mb-1">Country</label>
                          <input
                            {...form.register('businessAddress.country')}
                            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800"
                            placeholder="Country"
                          />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step3"
                  className="p-6 md:p-8"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={containerVariants}
                >
                  <motion.div variants={slideIn} className="text-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Connect Bank Account</h2>
                    <p className="text-gray-500 text-sm mt-1">Set up payments to receive funds from sales</p>
                  </motion.div>

                  <div className="space-y-6">
                    {DEMO_MODE && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                        <p className="text-yellow-700 font-medium">Demo Mode Active</p>
                        <p className="text-sm text-yellow-600 mt-1">
                          You are in demo mode. All Stripe accounts will be test accounts and no real banking information will be used.
                        </p>
                      </div>
                    )}
                    
                    {stripeError && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-red-700">{stripeError}</span>
                      </div>
                    )}
                  
                  <motion.div variants={slideIn}>
                      <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
                        <h3 className="text-blue-800 font-medium mb-2">Why connect your bank account?</h3>
                        <ul className="list-disc pl-5 space-y-1 text-blue-700 text-sm">
                          <li>Receive payments directly to your bank account</li>
                          <li>Manage payouts and transfers easily</li>
                          <li>View transaction history and financial reports</li>
                          <li>For testing, you can use Stripe's test account details</li>
                        </ul>
                        </div>
                      
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                      <select
                        {...form.register('stripeAccountType')}
                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-800"
                      >
                        <option value="EXPRESS">Express (Recommended)</option>
                        <option value="STANDARD">Standard</option>
                        <option value="CUSTOM">Custom</option>
                      </select>
                      <p className="mt-1 text-sm text-gray-500">
                        Express accounts offer the simplest onboarding experience.
                      </p>
                    </motion.div>

                    <div className="flex flex-col space-y-4">
                      <motion.div variants={slideIn} className="text-center">
                        <p className="text-gray-700 mb-4">
                          To complete your profile, create a Stripe Connect account to receive payments.
                        </p>

                        {stripeConnectData?.accountId ? (
                          <div className="bg-green-50 border border-green-200 p-4 rounded-md">
                            <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                            <p className="text-green-700">Stripe Connect account created!</p>
                            <p className="text-sm text-green-600 mt-1">
                              {stripeConnectData.accountLinkUrl 
                                ? "Continue to Stripe to complete your bank account setup"
                                : "Please continue to set up your bank account"
                              }
                            </p>
                          </div>
                        ) : (
                          <div className="border border-gray-200 p-4 rounded-md">
                            <p className="text-gray-700 mb-2">Please create your vendor profile first.</p>
                            <p className="text-xs text-gray-500">
                              Note: For testing purposes, you can use Stripe test accounts.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Actions */}
          <motion.div 
            className="p-4 md:p-6 bg-gray-50 flex justify-between items-center border-t"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`px-5 py-2 rounded-lg transition-all ${
                currentStep === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Back
            </button>
            
              {currentStep < steps.length - 2 ? (
                // For steps 0 and 1
              <button
                type="button"
                onClick={nextStep}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-all"
              >
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </button>
              ) : currentStep === steps.length - 2 ? (
                // For step 2 (last step before Stripe connect)
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                    <>
                      Save & Continue
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              ) : (
                // For final step (Connect Bank)
                <button
                  type="button"
                  onClick={handleConnectStripe}
                  disabled={stripeLoading || !profileCreated}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center transition-all"
                >
                  {stripeLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Connect with Stripe
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </>
                )}
              </button>
            )}
          </motion.div>
        </form>
      </div>
    </div>
  </div>
);
}
export default VendorProfilePage;
