'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAccount } from '@/hooks/useAccount';
import useAuthStore from '@/store/useAuthStore';
import { useAccountStore } from '@/store/useAccountStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Loader2, Camera, MapPin, Mail, Phone, 
  CheckCircle2, AlertCircle, Store, ShoppingBag, Star, 
  User, Settings, Save, FileEdit, X, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import EnhancedProfileHeader from '@/components/ui/profile/EnhancedProfileHeader';

const VendorAccountPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { 
    vendorProfile, 
    userProfile, 
    isLoading, 
    error,
    uploadCover, 
    uploadLogo, 
    updateVendorProfile,
    updateUserProfile
  } = useAccount();

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    storeName: '',
    shortDescription: '',
    description: '',
    contactEmail: '',
    contactPhone: ''
  });
  
  const [isUploading, setIsUploading] = useState({
    cover: false,
    profile: false
  });

  // Check authentication status and redirect if not authenticated
  useEffect(() => {
    console.log('Account page auth check - User data:', JSON.stringify(user, null, 2));
    
    const initAuth = async () => {
      // If not authenticated, try to initialize auth
      if (!isAuthenticated) {
        console.log('User not authenticated, trying to restore session...');
        const authInitialized = await useAuthStore.getState().initializeAuth();
        
        if (!authInitialized) {
          console.log('Session restore failed, redirecting to login...');
          router.push('/login');
        }
      } else if (user) {
        if (user.role !== 'VENDOR') {
          console.log('User is not a vendor, redirecting...');
          router.push('/profile');
        } else if (!user.vendor) {
          // Vendor user without a vendor profile - should complete setup
          console.log('Vendor without profile, trying to fetch profile data...');
          console.log('Current user object:', JSON.stringify(user, null, 2));
          
          // First try to fetch the vendor profile
          try {
            // Call the getVendorProfile method but don't rely on its return value
            await useAccountStore.getState().getVendorProfile();
            
            // After the call, check the store state directly to see if we got a profile
            const storeState = useAccountStore.getState();
            if (storeState.vendorProfile && storeState.vendorProfile.id) {
              console.log('Found vendor profile after explicit fetch:', storeState.vendorProfile);
              // Stay on the page, profile was loaded
            } else {
              console.log('No valid vendor profile found, redirecting to profile setup');
              router.push('/profile');
            }
          } catch (err) {
            console.error('Error fetching vendor profile:', err);
            router.push('/profile');
          }
        }
        // Else - vendor with profile, stay on the page
      }
    };
    
    initAuth();
  }, [isAuthenticated, user, router]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Initialize form data when profile is loaded
  useEffect(() => {
    if (vendorProfile) {
      setFormData({
        storeName: vendorProfile.storeName || '',
        shortDescription: vendorProfile.shortDescription || '',
        description: vendorProfile.description || '',
        contactEmail: vendorProfile.contactEmail || '',
        contactPhone: vendorProfile.contactPhone || ''
      });

      // Log all account data
      console.log('===== VENDOR PROFILE DATA =====');
      console.log(JSON.stringify(vendorProfile, null, 2));
      console.log('===== USER PROFILE DATA =====');
      console.log(JSON.stringify(userProfile, null, 2));
    }
  }, [vendorProfile, userProfile]);

  // Handle cover image upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      setIsUploading(prev => ({ ...prev, cover: true }));
      const file = e.target.files[0];
      
      console.log('Uploading cover image:', {
        filename: file.name,
        type: file.type,
        size: `${Math.round(file.size / 1024)}KB`
      });
      
      const result = await uploadCover(file);
      
      if (result) {
        console.log('Cover upload successful. URL:', result);
        toast.success('Upload successful', {
          description: 'Your cover image has been updated'
        });
      } else {
        console.error('Cover upload failed: No URL returned');
        toast.error('Upload failed', {
          description: 'Could not upload the cover image. Please try again.'
        });
      }
    } catch (error) {
      console.error('Failed to upload cover image:', error);
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsUploading(prev => ({ ...prev, cover: false }));
    }
  };

  // Handle profile image upload
  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    try {
      setIsUploading(prev => ({ ...prev, profile: true }));
      const file = e.target.files[0];
      
      console.log('Uploading profile image:', {
        filename: file.name,
        type: file.type,
        size: `${Math.round(file.size / 1024)}KB`
      });
      
      const result = await uploadLogo(file);
      
      if (result) {
        console.log('Profile image upload successful. URL:', result);
        toast.success('Upload successful', {
          description: 'Your profile image has been updated'
        });
      } else {
        console.error('Profile image upload failed: No URL returned');
        toast.error('Upload failed', {
          description: 'Could not upload the profile image. Please try again.'
        });
      }
    } catch (error) {
      console.error('Failed to upload profile image:', error);
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsUploading(prev => ({ ...prev, profile: false }));
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    await updateVendorProfile(formData);
    setIsEditingProfile(false);
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

  // Get verification status badge
  const getVerificationBadge = () => {
    if (!vendorProfile) return null;
    
    switch (vendorProfile.verificationStatus) {
      case 'VERIFIED':
        return <Badge className="bg-primary hover:bg-primary/90"><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="text-amber-600 border-amber-600"><Clock className="w-3 h-3 mr-1" /> Pending Verification</Badge>;
      default:
        return <Badge variant="outline" className="text-destructive border-destructive"><AlertCircle className="w-3 h-3 mr-1" /> Unverified</Badge>;
    }
  };

  // If not authenticated, show a simple loading screen (redirect will happen)
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h3 className="text-xl font-medium">Checking authentication...</h3>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-5rem)] p-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h3 className="text-xl font-medium text-foreground">Loading your store profile...</h3>
        <p className="text-muted-foreground mt-2">Please wait while we fetch your data</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-5rem)] p-4">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h3 className="text-xl font-medium text-foreground">Something went wrong</h3>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <EnhancedProfileHeader
        coverImage={vendorProfile?.coverImage || vendorProfile?.banner}
        logo={vendorProfile?.logo}
        storeName={vendorProfile?.storeName}
        shortDescription={vendorProfile?.shortDescription}
        isActive={vendorProfile?.isActive}
        verificationStatus={vendorProfile?.verificationStatus}
        onCoverUpload={async (file) => {
          const result = await uploadCover(file);
          if (result) {
            toast.success('Upload successful', {
              description: 'Your cover image has been updated'
            });
          }
          return result;
        }}
        onLogoUpload={async (file) => {
          const result = await uploadLogo(file);
          if (result) {
            toast.success('Upload successful', {
              description: 'Your profile image has been updated'
            });
          }
          return result;
        }}
      />
      
      {/* Main content - adjust spacing to accommodate profile overflow */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-8">
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-card rounded-lg shadow-sm p-1 mb-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="profile" className="data-[state=active]:bg-muted">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-muted">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Products
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-muted">
                <Star className="w-4 h-4 mr-2" />
                Reviews
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-muted">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Store Details</CardTitle>
                  <CardDescription>Manage your store information and appearance</CardDescription>
                </div>
                <Button 
                  variant={isEditingProfile ? "outline" : "default"} 
                  size="sm"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                >
                  {isEditingProfile ? (
                    <X className="w-4 h-4 mr-2" />
                  ) : (
                    <FileEdit className="w-4 h-4 mr-2" />
                  )}
                  {isEditingProfile ? "Cancel" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Store Name</label>
                        <Input
                          name="storeName"
                          value={formData.storeName}
                          onChange={handleInputChange}
                          placeholder="Your store name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Contact Email</label>
                        <Input
                          name="contactEmail"
                          value={formData.contactEmail}
                          onChange={handleInputChange}
                          placeholder="store@example.com"
                          type="email"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Short Description</label>
                      <Input
                        name="shortDescription"
                        value={formData.shortDescription}
                        onChange={handleInputChange}
                        placeholder="Brief tagline or description (shown on your profile header)"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Full Description</label>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Comprehensive description of your store and what you offer"
                        rows={5}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Contact Phone</label>
                      <Input
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        placeholder="Contact phone number"
                      />
                    </div>
                    
                    <div className="flex justify-end pt-2">
                      <Button 
                        onClick={handleSaveProfile}
                        className="flex items-center"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Store Name</h3>
                        <p className="mt-1">{vendorProfile?.storeName || "Not set"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Contact Email</h3>
                        <p className="mt-1 flex items-center">
                          <Mail className="w-4 h-4 mr-1 text-muted-foreground" />
                          {vendorProfile?.contactEmail || "Not set"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Contact Phone</h3>
                        <p className="mt-1 flex items-center">
                          <Phone className="w-4 h-4 mr-1 text-muted-foreground" />
                          {vendorProfile?.contactPhone || "Not set"}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                        <p className="mt-1 flex items-start">
                          <MapPin className="w-4 h-4 mr-1 text-muted-foreground mt-0.5" />
                          <span>
                            {vendorProfile?.businessAddress ? (
                              typeof vendorProfile.businessAddress === 'string' 
                                ? vendorProfile.businessAddress 
                                : [
                                    vendorProfile.businessAddress.street,
                                    vendorProfile.businessAddress.city,
                                    vendorProfile.businessAddress.country
                                  ].filter(Boolean).join(', ')
                            ) : "Not set"}
                          </span>
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Store Description</h3>
                      <p className="text-foreground whitespace-pre-line">
                        {vendorProfile?.description || "No description provided yet. Click Edit to add a description of your store."}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Store Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Store Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Status</span>
                      <Badge variant={vendorProfile?.isActive ? "default" : "destructive"}>
                        {vendorProfile?.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Verification</span>
                      {getVerificationBadge()}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Joined</span>
                      <span className="text-foreground text-sm">
                        {vendorProfile?.createdAt 
                          ? new Date(vendorProfile.createdAt).toLocaleDateString() 
                          : "Unknown"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Products</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-6">
                  <ShoppingBag className="w-10 h-10 text-muted mb-2 mx-auto" />
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">Active Products</p>
                </CardContent>
                <CardFooter className="pt-0 pb-3">
                  <Button size="sm" className="w-full">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Reviews</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-6">
                  <Star className="w-10 h-10 text-muted mb-2 mx-auto" />
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">Customer Reviews</p>
                </CardContent>
                <CardFooter className="pt-0 pb-3">
                  <Button size="sm" variant="outline" className="w-full">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Products</CardTitle>
                    <CardDescription>Manage your product catalog</CardDescription>
                  </div>
                  <Button>
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted border border-dashed border-border rounded-lg p-8 text-center">
                  <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No products yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">Start building your product catalog to showcase your items to customers</p>
                  <Button>Add Your First Product</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>View and respond to customer feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted border border-dashed border-border rounded-lg p-8 text-center">
                  <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    When customers review your products, they'll appear here. Great customer service can help you earn positive reviews!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive email updates about your store</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-border">
                    <div>
                      <h3 className="font-medium">Security Settings</h3>
                      <p className="text-sm text-muted-foreground">Update password and security preferences</p>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <h3 className="font-medium text-destructive">Delete Account</h3>
                      <p className="text-sm text-muted-foreground">Permanently delete your vendor account</p>
                    </div>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorAccountPage;
