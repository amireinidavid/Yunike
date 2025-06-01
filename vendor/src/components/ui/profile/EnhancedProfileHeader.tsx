'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface EnhancedProfileHeaderProps {
  coverImage?: string;
  logo?: string;
  storeName?: string;
  shortDescription?: string;
  isActive?: boolean;
  verificationStatus?: string;
  onCoverUpload: (file: File) => Promise<string | null | void>;
  onLogoUpload: (file: File) => Promise<string | null | void>;
}

export default function EnhancedProfileHeader({
  coverImage,
  logo,
  storeName = 'Your Store',
  shortDescription = 'Welcome to your vendor dashboard. Set up your store profile to attract customers.',
  isActive = false,
  verificationStatus = 'UNVERIFIED',
  onCoverUpload,
  onLogoUpload
}: EnhancedProfileHeaderProps) {
  const [isUploading, setIsUploading] = useState({
    cover: false,
    logo: false
  });

  const DEFAULT_PROFILE_IMAGE = 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=120&h=120&fit=crop';

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      setIsUploading(prev => ({ ...prev, cover: true }));
      const file = e.target.files[0];
      await onCoverUpload(file);
    } catch (error) {
      console.error('Failed to upload cover image:', error);
    } finally {
      setIsUploading(prev => ({ ...prev, cover: false }));
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      setIsUploading(prev => ({ ...prev, logo: true }));
      const file = e.target.files[0];
      await onLogoUpload(file);
    } catch (error) {
      console.error('Failed to upload logo:', error);
    } finally {
      setIsUploading(prev => ({ ...prev, logo: false }));
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return 'VD';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get verification badge
  const getVerificationBadge = () => {
    switch (verificationStatus) {
      case 'VERIFIED':
        return <Badge className="bg-primary hover:bg-primary/90"><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="text-amber-600 border-amber-600"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      default:
        return <Badge variant="outline" className="text-destructive border-destructive"><AlertCircle className="w-3 h-3 mr-1" /> Unverified</Badge>;
    }
  };

  return (
    <>
      {/* Cover and Profile Section */}
      <div className="relative bg-gradient-to-r from-primary/90 to-primary/70 overflow-hidden">
        {/* Cover Image (with overlay gradient) */}
        <div className="relative w-full h-56 md:h-72 lg:h-96 overflow-hidden group transition-all duration-500">
          {/* Dynamic blur effect background (always visible) */}
          <div className="absolute inset-0 bg-primary/30 backdrop-blur-sm"></div>
          
          {/* Cover image with animation */}
          {coverImage && (
            <>
              <Image
                src={coverImage}
                alt="Store Cover"
                fill
                priority
                className="object-cover transition-all duration-500 
                  group-hover:scale-105 group-hover:brightness-110 
                  animate-subtle-pulse"
                style={{ 
                  objectPosition: 'center 30%' 
                }}
              />
              
              {/* Overlay glass effect that appears on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/40 
                group-hover:from-black/10 group-hover:to-black/50 
                transition-all duration-500"></div>
            </>
          )}
          
          {/* Cover Upload Button with improved animation */}
          <label
            htmlFor="cover-upload"
            className="absolute top-4 right-4 z-10
              bg-background/20 backdrop-blur-lg hover:bg-background/30 
              text-white rounded-full px-4 py-2.5 
              flex items-center gap-2 cursor-pointer 
              shadow-lg shadow-black/10 hover:shadow-xl
              transition-all duration-300 
              transform hover:-translate-y-0.5
              border border-white/20 hover:border-white/40
              group/btn"
          >
            {isUploading.cover ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4 transition-transform duration-300 group-hover/btn:scale-110" />
            )}
            <span className="text-sm font-medium">Change Cover</span>
            <input
              id="cover-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
              disabled={isUploading.cover}
            />
          </label>
          
          {/* Improved Profile Section positioning */}
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 text-white z-10">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Profile Image with enhanced UI */}
              <div className="relative group/profile 
                transform md:-mb-12 lg:-mb-16
                transition-all duration-300
                hover:scale-105">
                <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 
                  rounded-2xl overflow-hidden 
                  border-4 border-white/90 
                  shadow-2xl shadow-black/30
                  transition-all duration-300
                  group-hover/profile:shadow-primary/30
                  group-hover/profile:border-primary-50
                  bg-white">
                  <Avatar className="w-full h-full rounded-none">
                    <AvatarImage 
                      src={logo || DEFAULT_PROFILE_IMAGE} 
                      alt={storeName || "Store"} 
                      className="object-cover transition-all duration-500 group-hover/profile:scale-108"
                    />
                    <AvatarFallback className="rounded-none text-3xl md:text-4xl lg:text-5xl bg-gradient-to-br from-primary/80 to-primary text-white">
                      {getInitials(storeName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Profile Upload Overlay with improved animation */}
                  <label
                    htmlFor="profile-upload"
                    className="absolute inset-0 flex flex-col items-center justify-center 
                      opacity-0 group-hover/profile:opacity-100 
                      bg-black/50 backdrop-blur-sm
                      transition-all duration-300 cursor-pointer"
                  >
                    {isUploading.logo ? (
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-white mb-2 
                          animate-float-slow transition-transform" />
                        <span className="text-xs text-white/90 font-medium">Change Photo</span>
                      </>
                    )}
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                      disabled={isUploading.logo}
                    />
                  </label>
                  
                  {/* Status indicator dot */}
                  {isActive && (
                    <div className="absolute bottom-1 right-1 w-4 h-4 
                      bg-green-500 rounded-full border-2 border-white 
                      animate-pulse-slow z-10" 
                      title="Active Store">
                    </div>
                  )}
                </div>
              </div>
              
              {/* Store Info with typography improvements */}
              <div className="flex-1 space-y-2 md:space-y-1 pb-1 md:mb-6 transform transition-all">
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold 
                    bg-clip-text text-transparent 
                    bg-gradient-to-r from-white to-white/90
                    drop-shadow-sm">
                    {storeName}
                  </h1>
                  <div className="transform hover:scale-105 transition-transform duration-300">
                    {getVerificationBadge()}
                  </div>
                </div>
                <p className="text-white/90 text-sm md:text-base max-w-3xl
                  leading-relaxed
                  backdrop-blur-sm bg-black/5 
                  inline-block px-2 py-1 rounded-md">
                  {shortDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add a gradient separator */}
      <div className="h-2 bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40"></div>
    </>
  );
} 