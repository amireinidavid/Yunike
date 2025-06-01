'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import useProductStore from '../../../../../store/useProductStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';

// Import shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';

import { 
  Upload, X, Plus, Check, AlertCircle, 
  ArrowLeft, Save, Trash, DollarSign, Package, 
  RefreshCw, Edit, Layers
} from 'lucide-react';

// Define product condition options
const conditionOptions = [
  { value: 'NEW', label: 'New' },
  { value: 'USED', label: 'Used' },
  { value: 'REFURBISHED', label: 'Refurbished' },
  { value: 'COLLECTIBLE', label: 'Collectible' }
];

// Product variant display and edit component
const VariantList = ({ 
  variants, 
  onEditVariant 
}: { 
  variants: any[],
  onEditVariant: () => void
}) => {
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Product Variants</h3>
        <Button 
          type="button"
          variant="outline"
          size="sm"
          onClick={onEditVariant}
          className="flex items-center gap-1"
        >
          <Edit className="h-4 w-4" />
          <span>Edit Variants</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {variants.map((variant, index) => (
          <Card key={variant.id || index} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{variant.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {variant.options && variant.options.map((option: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">{option}</Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Price:</span> ${variant.price}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Stock:</span> {variant.inventory}
                  </p>
                </div>
              </div>
              {variant.isDefault && (
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary">Default Variant</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Add the VariantEditor component
const VariantEditor = ({ 
  variants, 
  setVariants,
  isOpen,
  onClose
}: { 
  variants: any[],
  setVariants: React.Dispatch<React.SetStateAction<any[]>>,
  isOpen: boolean,
  onClose: () => void
}) => {
  const [newVariant, setNewVariant] = useState({
    name: '',
    options: [] as string[],
    price: 0,
    comparePrice: 0,
    inventory: 0,
    sku: '',
    isDefault: false
  });
  
  const [optionInput, setOptionInput] = useState('');

  const handleAddOption = () => {
    if (optionInput.trim()) {
      setNewVariant(prev => ({
        ...prev,
        options: [...prev.options, optionInput.trim()]
      }));
      setOptionInput('');
    }
  };

  const handleRemoveOption = (index: number) => {
    setNewVariant(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleAddVariant = () => {
    if (newVariant.name && newVariant.options.length > 0) {
      setVariants(prev => [...prev, { ...newVariant, id: `temp-${Date.now()}` }]);
      setNewVariant({
        name: '',
        options: [],
        price: 0,
        comparePrice: 0,
        inventory: 0,
        sku: '',
        isDefault: variants.length === 0 // First variant is default
      });
    }
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetDefaultVariant = (index: number) => {
    setVariants(prev => 
      prev.map((v, i) => ({
        ...v,
        isDefault: i === index
      }))
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Product Variants</DialogTitle>
          <DialogDescription>
            Add, edit or remove variants for this product
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 max-h-[60vh] overflow-y-auto py-4">
          {/* Existing variants */}
          {variants.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Existing Variants</h4>
              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <Card key={variant.id || index} className="relative">
                    <div className="absolute top-2 right-2 flex items-center gap-2">
                      <Button 
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={variant.isDefault ? "text-primary" : "text-muted-foreground"}
                        onClick={() => handleSetDefaultVariant(index)}
                        title={variant.isDefault ? "Default Variant" : "Set as Default"}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleRemoveVariant(index)}
                        title="Remove Variant"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="pt-4 pb-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">{variant.name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {variant.options && variant.options.map((opt: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">{opt}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Price:</span> ${variant.price}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Inventory:</span> {variant.inventory}
                          </div>
                          {variant.sku && (
                            <div>
                              <span className="text-muted-foreground">SKU:</span> {variant.sku}
                            </div>
                          )}
                        </div>
                      </div>
                      {variant.isDefault && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary">Default Variant</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Add new variant */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add New Variant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="variant-name">Variant Name</Label>
                <Input
                  id="variant-name"
                  placeholder="e.g. Size, Color, Material"
                  value={newVariant.name}
                  onChange={(e) => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="variant-options">Options</Label>
                <div className="flex gap-2">
                  <Input
                    id="variant-options"
                    placeholder="e.g. Small, Red, Cotton"
                    value={optionInput}
                    onChange={(e) => setOptionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOption();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleAddOption}
                  >
                    Add
                  </Button>
                </div>
                
                {newVariant.options.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {newVariant.options.map((option, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="flex items-center gap-1 pl-2 h-6"
                      >
                        {option}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-destructive/20 rounded-full p-0"
                          onClick={() => handleRemoveOption(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="variant-price">Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                    </span>
                    <Input
                      id="variant-price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-9"
                      value={newVariant.price || ''}
                      onChange={(e) => setNewVariant(prev => ({ 
                        ...prev, 
                        price: parseFloat(e.target.value) || 0 
                      }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="variant-inventory">Inventory</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Package className="h-4 w-4" />
                    </span>
                    <Input
                      id="variant-inventory"
                      type="number"
                      placeholder="0"
                      className="pl-9"
                      value={newVariant.inventory || ''}
                      onChange={(e) => setNewVariant(prev => ({ 
                        ...prev, 
                        inventory: parseInt(e.target.value) || 0 
                      }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="variant-sku">SKU (Optional)</Label>
                  <Input
                    id="variant-sku"
                    placeholder="SKU123"
                    value={newVariant.sku}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, sku: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <Button
                  type="button"
                  onClick={handleAddVariant}
                  disabled={!newVariant.name || newVariant.options.length === 0}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variant
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button type="button" onClick={onClose}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main product edit page
export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  console.log("Component mounted with params:", params);
  console.log("Product ID from params:", productId);
  
  const { 
    fetchProductById, 
    updateProduct, 
    currentProduct,
    isLoading: isProductLoading,
    isSubmitting, 
    error, 
    clearErrors 
  } = useProductStore();
  
  const { isAuthenticated, isLoading: isAuthLoading, refreshTokenManually } = useAuth();
  
  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Form state
  const [product, setProduct] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: 0,
    comparePrice: 0,
    inventory: 0,
    sku: '',
    status: 'DRAFT',
    isPublished: false,
    isDigital: false,
    hasVariants: false,
    isFeatured: false,
    condition: 'NEW',
    tagsAndKeywords: [] as string[]
  });
  
  // Images state
  const [images, setImages] = useState<any[]>([]);
  
  // Add variants state
  const [variants, setVariants] = useState<any[]>([]);
  // Add variant editor modal state
  const [variantEditorOpen, setVariantEditorOpen] = useState(false);
  
  // Move all useEffect hooks here, together at the top

  // Check authentication and fetch product data on page load
  useEffect(() => {
    console.log("useEffect running with productId:", productId);
    console.log("Authentication status:", { isAuthenticated, isLoading: isAuthLoading });
    
    // Redirect if user is not authenticated
    if (!isAuthLoading && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login page');
      router.push('/login?redirect=/dashboard/products/edit');
      return;
    }
    
    // Fetch product data if we have an ID
    if (productId && isAuthenticated) {
      console.log('Fetching product with ID:', productId);
      const fetchData = async () => {
        try {
          const fetchedProduct = await fetchProductById(productId);
          console.log('API response for product:', fetchedProduct);
          if (fetchedProduct) {
            console.log('Populating form with product data');
            populateFormData(fetchedProduct);
          } else {
            // Product not found, redirect to products list
            console.log('Product not found, redirecting to products list');
            router.push('/dashboard/products');
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          router.push('/dashboard/products');
        }
      };
      
      fetchData();
    } else if (!productId) {
      // No ID provided, redirect to products list
      console.log('No product ID provided, redirecting to products list');
      router.push('/dashboard/products');
    }
  }, [productId, isAuthenticated, isAuthLoading, router, fetchProductById]);
  
  // Cleanup for image object URLs
  useEffect(() => {
    // Cleanup function to revoke object URLs to avoid memory leaks
    return () => {
      images.forEach(image => {
        if (image.url && image.file) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [images]);
  
  // Populate form with product data
  const populateFormData = (productData: any) => {
    console.log('Populating form with product data structure:', JSON.stringify(productData, null, 2));
    
    // Basic product info
    setProduct({
      name: productData.name || '',
      slug: productData.slug || '',
      description: productData.description || '',
      shortDescription: productData.shortDescription || '',
      price: productData.price || 0,
      comparePrice: productData.comparePrice || 0,
      inventory: productData.inventory || 0,
      sku: productData.sku || '',
      status: productData.isPublished ? 'PUBLISHED' : 'DRAFT',
      isPublished: productData.isPublished || false,
      isDigital: productData.isDigital || false,
      hasVariants: productData.hasVariants || false,
      isFeatured: productData.isFeatured || false,
      condition: productData.condition || 'NEW',
      tagsAndKeywords: productData.tagsAndKeywords || []
    });
    
    // Set images
    if (productData.images && productData.images.length > 0) {
      console.log('Setting product images:', productData.images);
      setImages(productData.images.map((img: any) => ({
        id: img.id,
        url: img.url,
        alt: img.alt || `Image for ${productData.name}`,
        isMain: img.isMain || img.isDefault
      })));
    }
    
    // Set variants if they exist
    if (productData.hasVariants && productData.variants && productData.variants.length > 0) {
      console.log('Setting product variants:', productData.variants);
      setVariants(productData.variants.map((variant: any) => ({
        id: variant.id,
        name: variant.name,
        options: variant.options || [],
        price: variant.price || 0,
        comparePrice: variant.comparePrice || 0,
        inventory: variant.inventory || 0,
        sku: variant.sku || '',
        isDefault: variant.isDefault || false
      })));
    }
  };
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setProduct(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setProduct(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Add image handler
  const handleAddImage = (file: File) => {
    const isMain = images.length === 0;
    // Create a preview URL for the file
    const previewUrl = URL.createObjectURL(file);
    setImages([...images, { file, isMain, url: previewUrl }]);
  };
  
  // Remove image handler
  const handleRemoveImage = (index: number) => {
    const imageToRemove = images[index];
    
    // Revoke the object URL if this was a newly added image with a preview URL
    if (imageToRemove.file && imageToRemove.url) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    
    const newImages = [...images];
    newImages.splice(index, 1);
    
    // If we removed the main image, set the first image as main
    if (imageToRemove.isMain && newImages.length > 0) {
      newImages[0].isMain = true;
    }
    
    setImages(newImages);
  };
  
  // Set main image handler
  const handleSetMainImage = (index: number) => {
    const newImages = images.map((image, i) => ({
      ...image,
      isMain: i === index
    }));
    setImages(newImages);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };
  
  // Handle update confirmation
  const handleConfirmUpdate = async () => {
    try {
      console.log('Starting product update process...');
      
      // Refresh token before submission
      await refreshTokenManually();
      console.log('Token refreshed successfully');
      
      // Process images for API submission
      console.log(`Processing ${images.length} images...`);
      const processedImages = await Promise.all(
        images.map(async (img, index) => {
          // If the image already has a URL and ID, just use that
          if (img.url && img.id) {
            console.log(`Using existing image: ${img.id}`);
            return {
              id: img.id,
              url: img.url,
              alt: img.alt || `Product image ${index + 1}`,
              isMain: img.isMain
            };
          }
          
          // If it's a new file, convert to base64
          if (img.file) {
            console.log(`Converting new image at index ${index} to base64`);
            return new Promise<any>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve({
                  id: img.id || `temp-${index}`,
                  data: reader.result, // This will be base64 data URL
                  alt: `Product image ${index + 1}`,
                  isMain: img.isMain
                });
              };
              reader.readAsDataURL(img.file);
            });
          }
          
          return {
            id: img.id || `temp-${index}`,
            alt: `Product image ${index + 1}`,
            isMain: img.isMain
          };
        })
      );
      
      // Prepare product data
      const productData = {
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        price: product.price,
        comparePrice: product.comparePrice || undefined,
        inventory: product.inventory,
        sku: product.sku || undefined,
        isPublished: product.status === 'PUBLISHED',
        isDigital: product.isDigital,
        hasVariants: product.hasVariants,
        isFeatured: product.isFeatured,
        condition: product.condition,
        tagsAndKeywords: product.tagsAndKeywords.length > 0 ? product.tagsAndKeywords : undefined,
        images: processedImages.length > 0 ? processedImages : undefined
      };
      
      console.log('Product data prepared, submitting update...');
      
      if (productId) {
        try {
          const updatedProduct = await updateProduct(productId, productData as any);
          console.log('Product updated successfully:', updatedProduct);
          
          // Close the modal first
          setShowConfirmModal(false);
          
          // Show a success message (optional)
          // toast.success('Product updated successfully');
          
          // Redirect to products page
          console.log('Redirecting to products page...');
          setTimeout(() => {
            router.push('/dashboard/products');
          }, 500); // Small delay to ensure UI updates before redirect
        } catch (updateError) {
          console.error('Update API call failed:', updateError);
          setShowConfirmModal(false);
          // Could show an error toast here
          // toast.error('Failed to update product');
        }
      } else {
        console.error('No product ID available for update');
        setShowConfirmModal(false);
      }
    } catch (error) {
      console.error('Failed to update product:', error);
      setShowConfirmModal(false);
      // Could show an error toast here
      // toast.error('Failed to update product');
    }
  };

  // Show loading spinner while loading data
  if (isAuthLoading || isProductLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading product data...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div 
        className="flex items-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.back()}
          className="mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Edit Product</h1>
        {currentProduct && (
          <Badge variant="outline" className="ml-4 px-3 py-1 bg-muted/50">
            {currentProduct.id}
          </Badge>
        )}
      </motion.div>
      
      {error && (
        <motion.div 
          className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-destructive mr-3" />
            <span className="text-destructive">{error}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={clearErrors} 
              className="ml-auto"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Main section: Basic info and Image upload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Basic Product Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="name">Product Title <span className="text-destructive">*</span></Label>
                  <Input
                    id="name"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    placeholder="Enter product title"
                    required
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="slug">
                    Slug <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={product.slug}
                    onChange={handleChange}
                    placeholder="product-url-slug"
                    required
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="shortDescription">
                    Short Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="shortDescription"
                    name="shortDescription"
                    value={product.shortDescription}
                    onChange={handleChange}
                    placeholder="Enter short description"
                    className="resize-none"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={product.status}
                      onValueChange={(value) => {
                        setProduct(prev => ({ ...prev, status: value }))
                      }}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="HIDDEN">Hidden</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                      value={product.condition}
                      onValueChange={(value) => {
                        setProduct(prev => ({ ...prev, condition: value }))
                      }}
                    >
                      <SelectTrigger id="condition">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div 
            className="h-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">Product Images</CardTitle>
                <CardDescription>Upload or update product images</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <AnimatePresence>
                      {images.map((image, index) => (
                        <motion.div 
                          key={index} 
                          className="relative bg-muted rounded-md overflow-hidden aspect-square group"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                        >
                          <img 
                            src={image.url || ''}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <motion.button 
                              type="button"
                              onClick={() => handleSetMainImage(index)}
                              className={`p-2 rounded-full ${image.isMain ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'}`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Check className="h-4 w-4" />
                            </motion.button>
                            <motion.button 
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="p-2 rounded-full bg-destructive text-destructive-foreground"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Trash className="h-4 w-4" />
                            </motion.button>
                          </div>
                          {image.isMain && (
                            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                              Main
                            </Badge>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="text-center mb-4 text-muted-foreground">
                    No images uploaded yet
                  </div>
                )}
                
                <div
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="flex-1 min-h-[200px] flex flex-col items-center justify-center rounded-lg cursor-pointer border-2 border-dashed border-muted-foreground/20 hover:border-primary hover:bg-secondary/10"
                >
                  <div className="flex flex-col items-center p-8">
                    <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-lg font-medium mb-1">Upload Images</p>
                    <p className="text-sm text-muted-foreground text-center max-w-[240px]">
                      Click to add product images
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  id="image-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleAddImage(e.target.files[0]);
                      e.target.value = ''; // Reset input
                    }
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Pricing & Inventory */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Price <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      id="price"
                      name="price"
                      value={product.price}
                      onChange={handleChange}
                      required
                      className="pl-9"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="comparePrice">
                    Compare-at Price
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      id="comparePrice"
                      name="comparePrice"
                      value={product.comparePrice}
                      onChange={handleChange}
                      className="pl-9"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="inventory">Stock Quantity <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Package className="h-4 w-4" />
                    </span>
                    <Input
                      type="number"
                      id="inventory"
                      name="inventory"
                      value={product.inventory}
                      onChange={handleChange}
                      required
                      className="pl-9"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    name="sku"
                    value={product.sku}
                    onChange={handleChange}
                    placeholder="SKU123"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isDigital"
                    checked={product.isDigital}
                    onCheckedChange={(checked) => handleCheckboxChange('isDigital', checked === true)}
                  />
                  <Label htmlFor="isDigital">Digital product</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasVariants"
                    checked={product.hasVariants}
                    onCheckedChange={(checked) => handleCheckboxChange('hasVariants', checked === true)}
                  />
                  <Label htmlFor="hasVariants">Has variants</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFeatured"
                    checked={product.isFeatured}
                    onCheckedChange={(checked) => handleCheckboxChange('isFeatured', checked === true)}
                  />
                  <Label htmlFor="isFeatured">Featured product</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Description */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Detailed Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="description"
                name="description"
                value={product.description}
                onChange={handleChange}
                placeholder="Enter detailed description..."
                className="min-h-[200px]"
              />
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Form actions */}
        <motion.div 
          className="flex justify-end space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Update Product</span>
              </>
            )}
          </Button>
        </motion.div>
      </form>
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to update <span className="font-medium">{product.name}</span>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center">
                {images.length > 0 && images[0].url && (
                  <div className="w-12 h-12 mr-3 rounded overflow-hidden">
                    <img 
                      src={images.find(img => img.isMain)?.url || images[0].url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">${product.price.toFixed(2)} • {product.inventory} in stock</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmUpdate}
              disabled={isSubmitting}
              className="gap-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Yes, Update</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
