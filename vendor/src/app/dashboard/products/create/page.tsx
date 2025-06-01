'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useProductStore, { Product } from '../../../../store/useProductStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { refreshAccessTokenManually } from '@/utils/authInitializer';

// Import shadcn components
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Label } from "../../../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Badge } from "../../../../components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../../components/ui/tooltip";

import { 
  Upload, X, Plus, Image as ImageIcon, Check, AlertCircle, 
  ArrowLeft, Save, Eye, Trash, Tag, DollarSign, Package, 
  BarChart2, Calendar, Edit3, Layers, Search, Hash, Ruler
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Define product condition options from schema
const conditionOptions = [
  { value: 'NEW', label: 'New' },
  { value: 'USED', label: 'Used' },
  { value: 'REFURBISHED', label: 'Refurbished' },
  { value: 'COLLECTIBLE', label: 'Collectible' }
];

// Rich text editor component
const RichTextEditor = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
  // This is a simplified editor - in a real implementation, you'd use a library like TipTap, CKEditor, etc.
  return (
    <div className="relative">
      <div className="flex items-center space-x-2 mb-2 p-2 bg-secondary rounded-t-md">
        <button className="p-1 hover:bg-muted rounded">
          <span className="font-bold">B</span>
        </button>
        <button className="p-1 hover:bg-muted rounded">
          <span className="italic">I</span>
        </button>
        <button className="p-1 hover:bg-muted rounded">
          <span className="underline">U</span>
        </button>
        <div className="h-4 border-l border-border mx-1"></div>
        <button className="p-1 hover:bg-muted rounded">
          <span>🔗</span>
        </button>
        <button className="p-1 hover:bg-muted rounded">
          <span>📋</span>
        </button>
      </div>
      <textarea 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full h-40 p-4 bg-background border border-border rounded-b-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        placeholder="Enter detailed description..."
      />
    </div>
  );
};

// Image upload component with enhanced UI
const ImageUpload = ({ images, onAddImage, onRemoveImage, onSetMainImage }: { 
  images: any[], 
  onAddImage: (file: File) => void, 
  onRemoveImage: (index: number) => void,
  onSetMainImage: (index: number) => void
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  // --- BEGIN: Cache object URLs for image previews ---
  const [objectURLs, setObjectURLs] = useState<string[]>([]);

  useEffect(() => {
    // Clean up old object URLs
    objectURLs.forEach(url => URL.revokeObjectURL(url));
    // Generate new object URLs for current images
    const urls = images.map(image => image.url || (image.file ? URL.createObjectURL(image.file) : ''));
    setObjectURLs(urls);
    // Clean up on unmount
    return () => {
      urls.forEach(url => url && URL.revokeObjectURL(url));
    };
    // Only re-run when images change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);
  // --- END: Cache object URLs for image previews ---

  // Handle drag events
  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type.includes('image/')) {
          onAddImage(file);
        }
      }
    };

    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    return () => {
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('dragleave', handleDragLeave);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, [onAddImage]);

  return (
    <Card className="border-2 border-dashed border-border h-full flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl">Product Images</CardTitle>
        <CardDescription>
          Upload high-quality product images
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="ml-1 cursor-help">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>765 × 850 pixels recommended</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col mt-4">
        {images.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <AnimatePresence>
        {images.map((image, index) => (
                <motion.div 
                  key={index} 
                  className="relative bg-muted rounded-md overflow-hidden aspect-[765/850] group"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
            <img 
              src={image.url || objectURLs[index] || ''} 
              alt={`Product image ${index + 1}`}
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <motion.button 
                type="button"
                onClick={() => onSetMainImage(index)}
                className={`p-2 rounded-full ${image.isMain ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'}`}
                title={image.isMain ? 'Main Image' : 'Set as Main Image'}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
              >
                <Check className="h-4 w-4" />
                    </motion.button>
                    <motion.button 
                type="button"
                onClick={() => onRemoveImage(index)}
                className="p-2 rounded-full bg-destructive text-destructive-foreground"
                title="Remove Image"
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
        
        {/* Add image button - enhanced drop zone */}
        <div
          ref={dropZoneRef}
          onClick={() => fileInputRef.current?.click()}
          className={`
            flex-1 min-h-[200px] flex flex-col items-center justify-center rounded-lg cursor-pointer
            transition-all duration-300 border-2 border-dashed 
            ${isDragging 
              ? 'border-primary bg-primary/5 scale-105' 
              : 'border-muted-foreground/20 hover:border-primary hover:bg-secondary/10'
            }
          `}
        >
          <motion.div 
            className="flex flex-col items-center p-8"
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
              <Upload className={`h-8 w-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
            <p className={`text-lg font-medium mb-1 ${isDragging ? 'text-primary' : 'text-foreground'}`}>
              {isDragging ? 'Drop image here' : 'Upload Images'}
            </p>
            <p className="text-sm text-muted-foreground text-center max-w-[240px]">
              Drag & drop product images or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              PNG, JPG up to 5MB
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              765 × 850 pixels recommended
            </p>
          </motion.div>
        </div>
      </CardContent>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onAddImage(e.target.files[0]);
            e.target.value = ''; // Reset input
          }
        }}
      />
    </Card>
  );
};

// Color picker component with enhanced UI
const ColorPicker = ({ colors, onAddColor, onRemoveColor }: {
  colors: string[],
  onAddColor: (color: string) => void,
  onRemoveColor: (color: string) => void
}) => {
  const [newColor, setNewColor] = useState('#000000');
  
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-foreground mb-2">
        Available Colors
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        <AnimatePresence>
        {colors.map((color, index) => (
            <motion.div 
              key={index} 
              className="relative group"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <div 
                className="w-8 h-8 rounded-full border border-border shadow-sm"
              style={{ backgroundColor: color }}
            ></div>
            <button 
              type="button"
              onClick={() => onRemoveColor(color)}
                className="absolute -top-1 -right-1 bg-background border border-border rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <X className="w-3 h-3 text-foreground" />
            </button>
            </motion.div>
          ))}
        </AnimatePresence>
        <motion.div 
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
        >
          <input 
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="w-8 h-8 rounded-full border border-border bg-background cursor-pointer shadow-sm"
          />
          <motion.button
            type="button"
            onClick={() => {
              if (!colors.includes(newColor)) {
              onAddColor(newColor);
              }
            }}
            className="p-1 rounded-full bg-primary text-primary-foreground"
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-3 h-3" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

// Product variant component
const VariantEditor = ({ 
  variants, 
  setVariants 
}: { 
  variants: any[], 
  setVariants: React.Dispatch<React.SetStateAction<any[]>>
}) => {
  const [newVariant, setNewVariant] = useState({
    name: '',
    options: [] as string[],
    price: 0,
    comparePrice: 0,
    inventory: 0,
    sku: '',
    barcode: '',
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
        barcode: '',
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

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Product Variants</h3>
        <p className="text-sm text-muted-foreground">
          Add variants for different options like size, color, etc.
        </p>
        
        {/* Existing variants */}
        {variants.length > 0 && (
          <div className="space-y-4 mb-6">
            <h4 className="text-sm font-medium">Existing Variants</h4>
            <div className="space-y-3">
              {variants.map((variant, index) => (
                <Card key={variant.id} className="relative">
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
                          {variant.options.map((opt: string, i: number) => (
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
                <Label htmlFor="variant-comparePrice">Compare-at Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <Input
                    id="variant-comparePrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-9"
                    value={newVariant.comparePrice || ''}
                    onChange={(e) => setNewVariant(prev => ({ 
                      ...prev, 
                      comparePrice: parseFloat(e.target.value) || 0 
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
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Hash className="h-4 w-4" />
                  </span>
                  <Input
                    id="variant-sku"
                    placeholder="SKU123"
                    className="pl-9"
                    value={newVariant.sku}
                    onChange={(e) => setNewVariant(prev => ({ ...prev, sku: e.target.value }))}
                  />
                </div>
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
    </div>
  );
};

// Specifications editor component
const SpecificationsEditor = ({ 
  specifications, 
  setSpecifications 
}: { 
  specifications: { name: string, value: string, unit: string }[], 
  setSpecifications: React.Dispatch<React.SetStateAction<{ name: string, value: string, unit: string }[]>>
}) => {
  const [newSpec, setNewSpec] = useState({
    name: '',
    value: '',
    unit: ''
  });

  const handleAddSpec = () => {
    if (newSpec.name && newSpec.value) {
      setSpecifications(prev => [...prev, { ...newSpec }]);
      setNewSpec({ name: '', value: '', unit: '' });
    }
  };

  const handleRemoveSpec = (index: number) => {
    setSpecifications(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Product Specifications</h3>
      <p className="text-sm text-muted-foreground">
        Add technical specifications and features for your product
      </p>
      
      {/* Existing specifications */}
      {specifications.length > 0 && (
        <div className="space-y-3 mb-4">
          <div className="rounded-md border">
            <div className="grid grid-cols-4 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
              <div>Specification</div>
              <div>Value</div>
              <div>Unit</div>
              <div className="w-[50px]"></div>
            </div>
            <div className="divide-y">
              {specifications.map((spec, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 p-4 items-center">
                  <div className="font-medium">{spec.name}</div>
                  <div>{spec.value}</div>
                  <div>{spec.unit}</div>
                  <div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleRemoveSpec(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Add new specification */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base">Add Specification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="spec-name">Name</Label>
              <Input
                id="spec-name"
                placeholder="e.g. Processor, Material"
                value={newSpec.name}
                onChange={(e) => setNewSpec(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="spec-value">Value</Label>
              <Input
                id="spec-value"
                placeholder="e.g. Intel i7, Cotton"
                value={newSpec.value}
                onChange={(e) => setNewSpec(prev => ({ ...prev, value: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="spec-unit">Unit (Optional)</Label>
              <Input
                id="spec-unit"
                placeholder="e.g. GHz, %, cm"
                value={newSpec.unit}
                onChange={(e) => setNewSpec(prev => ({ ...prev, unit: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="pt-2">
            <Button
              type="button"
              onClick={handleAddSpec}
              disabled={!newSpec.name || !newSpec.value}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Specification
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main product creation page
export default function CreateProductPage() {
  const router = useRouter();
  const { createProduct, isSubmitting, error, clearErrors } = useProductStore();
  // Use the AuthProvider context for isLoading and isAuthenticated
  const { isAuthenticated, isLoading, refreshTokenManually } = useAuth();
  
  // Check authentication on page load
  useEffect(() => {
    // Only redirect if auth check is done and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard/products/create');
    }
  }, [isAuthenticated, isLoading, router]);
  
  // Show loading spinner while auth is loading
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Form state
  const [product, setProduct] = useState<{
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    comparePrice: number;
    costPrice: number;
    wholesalePrice: number;
    wholesaleMinQty: number;
    sku: string;
    barcode: string;
    inventory: number;
    lowStockThreshold: number;
    weight: number;
    dimensions: { length: number; width: number; height: number };
    isPublished: boolean;
    isDigital: boolean;
    digitalFileUrl: string;
    hasVariants: boolean;
    isFeatured: boolean;
    isOnSale: boolean;
    condition: string;
    warrantyInfo: string;
    returnPolicy: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
    tagsAndKeywords: string[];
    status: string;
    saleStartDate: string | null;
    saleEndDate: string | null;
    shippingClass: string;
  }>({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: 0,
    comparePrice: 0,
    costPrice: 0,
    wholesalePrice: 0,
    wholesaleMinQty: 1,
    sku: '',
    barcode: '',
    inventory: 0,
    lowStockThreshold: 5,
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    isPublished: false,
    isDigital: false,
    digitalFileUrl: '',
    hasVariants: false,
    isFeatured: false,
    isOnSale: false,
    condition: 'NEW',
    warrantyInfo: '',
    returnPolicy: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [],
    tagsAndKeywords: [],
    status: 'DRAFT',
    saleStartDate: null,
    saleEndDate: null,
    shippingClass: ''
  });
  
  // Generate slug from product name
  useEffect(() => {
    if (product.name && !product.slug) {
      const generatedSlug = product.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      
      setProduct(prev => ({
        ...prev,
        slug: generatedSlug
      }));
    }
  }, [product.name, product.slug]);
  
  // Images state
  const [images, setImages] = useState<any[]>([]);
  
  // Colors state
  const [colors, setColors] = useState<string[]>([]);
  
  // Categories state
  const [categories, setCategories] = useState<string[]>([]);
  
  // Specifications state
  const [specifications, setSpecifications] = useState<{ name: string, value: string, unit: string }[]>([]);

  // Variants state
  const [variants, setVariants] = useState<any[]>([]);
  
  // Add image handler
  const handleAddImage = (file: File) => {
    const isMain = images.length === 0;
    setImages([...images, { file, isMain }]);
  };
  
  // Remove image handler
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    
    // If we removed the main image, set the first image as main
    if (images[index].isMain && newImages.length > 0) {
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
  
  // Add color handler
  const handleAddColor = (color: string) => {
    if (!colors.includes(color)) {
      setColors([...colors, color]);
    }
  };
  
  // Remove color handler
  const handleRemoveColor = (color: string) => {
    setColors(colors.filter(c => c !== color));
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
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First, ensure we have a fresh token before submission
      console.log('🔄 Refreshing token before product submission...');
      const refreshed = await refreshAccessTokenManually();
      console.log('Token refresh result:', refreshed);
      
      // Get fresh token from localStorage
      const accessToken = localStorage.getItem('accessToken');
    
      // Check authentication again before submission
      if (!isAuthenticated || !accessToken) {
        console.error('Authentication required to create products');
        console.log('Auth state:', { isAuthenticated, hasToken: !!accessToken });
        router.push('/login?redirect=/dashboard/products/create');
        return;
      }
      
      // Log auth status before making API calls
      console.log('Submitting product with auth status:', { 
        isAuthenticated, 
        hasToken: !!accessToken,
        tokenLength: accessToken ? accessToken.length : 0
      });
      
      // Convert images to base64 for API submission
      const processedImages = await Promise.all(
        images.map(async (img, index) => {
          // If the image already has a URL, just use that
          if (img.url) {
            return {
              id: img.id || `temp-${index}`,
              url: img.url,
              alt: `Product image ${index + 1}`,
              isMain: img.isMain
            };
          }
          
          // If it's a file, convert to base64
          if (img.file) {
            return new Promise<any>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve({
                  id: `temp-${index}`,
                  data: reader.result, // This will be base64 data URL
                  alt: `Product image ${index + 1}`,
                  isMain: img.isMain
                });
              };
              reader.readAsDataURL(img.file);
            });
          }
          
          // Fallback for other cases
          return {
            id: img.id || `temp-${index}`,
            alt: `Product image ${index + 1}`,
            isMain: img.isMain
          };
        })
      );
      
      console.log('Processed images:', processedImages.length, 'images ready for upload');
      
      // Process variants to ensure they match backend expectations
      const processedVariants = product.hasVariants 
        ? variants.map(v => {
            // Make a copy to avoid mutating the original
            const variant = { ...v };
            
            // Ensure options are simple strings as expected by backend
            if (Array.isArray(variant.options)) {
              // Just leave options as is - our validation now accepts strings
              console.log(`Variant ${variant.name} has options:`, variant.options);
            }
            
            return {
              id: variant.id,
              name: variant.name,
              options: variant.options,
              price: variant.price || 0,
              comparePrice: variant.comparePrice,
              inventory: variant.inventory || 0,
              sku: variant.sku,
              isDefault: variant.isDefault
            };
          })
        : [];
      
      // Prepare product data
      const productData = {
        // Basic information
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        price: product.price,
        comparePrice: product.comparePrice || undefined,
        costPrice: product.costPrice || undefined,
        wholesalePrice: product.wholesalePrice || undefined,
        wholesaleMinQty: product.wholesaleMinQty || undefined,
        sku: product.sku || undefined,
        barcode: product.barcode || undefined,
        inventory: product.inventory,
        lowStockThreshold: product.lowStockThreshold,
        weight: product.weight || undefined,
        dimensions: product.dimensions,
        
        // Status flags
        isPublished: product.status === 'PUBLISHED',
        isDigital: product.isDigital,
        digitalFileUrl: product.isDigital ? product.digitalFileUrl : undefined,
        hasVariants: product.hasVariants,
        isFeatured: product.isFeatured,
        isOnSale: product.isOnSale,
        
        // Additional details
        condition: product.condition,
        warrantyInfo: product.warrantyInfo || undefined,
        returnPolicy: product.returnPolicy || undefined,
        metaTitle: product.metaTitle || undefined,
        metaDescription: product.metaDescription || undefined,
        metaKeywords: product.metaKeywords.length > 0 ? product.metaKeywords : undefined,
        tagsAndKeywords: product.tagsAndKeywords.length > 0 ? product.tagsAndKeywords : undefined,
        shippingClass: product.shippingClass || undefined,
        
        // Date fields
        saleStartDate: product.isOnSale && product.saleStartDate 
          ? new Date(product.saleStartDate).toISOString() 
          : null,
        saleEndDate: product.isOnSale && product.saleEndDate 
          ? new Date(product.saleEndDate).toISOString() 
          : null,
        
        // Relations
        variants: product.hasVariants ? processedVariants : [],
        
        specifications: specifications.length > 0 
          ? specifications
          : undefined,
        
        attributes: colors.length > 0 ? { colors } : undefined,
        
        // Images - send the processed images with base64 data
        images: processedImages.length > 0 ? processedImages : undefined
      };
      
      // If hasVariants is true but no variants exist, create a default variant
      if (product.hasVariants && (!productData.variants || productData.variants.length === 0)) {
        productData.variants = [{
          id: `temp-default-variant`,
          name: 'Default',
          options: ['Standard'], // String format is now supported
          price: product.price,
          comparePrice: product.comparePrice || 0,
          inventory: product.inventory,
          sku: product.sku || '',
          isDefault: true
        }];
      }
      
      console.log('Submitting product data:', JSON.stringify(productData, null, 2));
      
      try {
        // Use 'as any' to bypass type checking temporarily
        const newProduct = await createProduct(productData as any);
        if (newProduct) {
          router.push(`/dashboard/products`);
        } else {
          // Handle case where product creation failed but no error was thrown
          console.error('Failed to create product: No product returned');
        }
      } catch (error) {
        console.error('Failed to create product:', error);
      }
    } catch (refreshError) {
      console.error('Failed to refresh token before submission:', refreshError);
      router.push('/login?redirect=/dashboard/products/create');
    }
  };
  
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
        <h1 className="text-3xl font-bold">Create Product</h1>
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
        {/* Main section: Image upload (left) and Basic info (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Image upload */}
          <motion.div 
            className="h-full"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <ImageUpload 
              images={images} 
              onAddImage={handleAddImage} 
              onRemoveImage={handleRemoveImage} 
              onSetMainImage={handleSetMainImage} 
            />
          </motion.div>
          
          {/* Right column - Basic product info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
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
                    <span className="ml-2 text-xs text-muted-foreground">(Auto-generated from title)</span>
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
                    <span className="ml-2 text-xs text-muted-foreground">(Max 150 words)</span>
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
              
                <div className="space-y-3">
                  <Label htmlFor="tags">Tags <span className="text-destructive">*</span></Label>
                  <div className="flex items-center space-x-2">
                    <Input
                    id="tags"
                    placeholder="Add tags separated by commas"
                      className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        const input = e.currentTarget;
                        const tag = input.value.trim();
                        if (tag && !product.tagsAndKeywords.includes(tag)) {
                          setProduct(prev => ({
                            ...prev,
                            tagsAndKeywords: [...prev.tagsAndKeywords, tag]
                          }));
                          input.value = '';
                        }
                      }
                    }}
                  />
                    <Button 
                      type="button" 
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const input = document.getElementById('tags') as HTMLInputElement;
                        const tag = input.value.trim();
                        if (tag && !product.tagsAndKeywords.includes(tag)) {
                          setProduct(prev => ({
                            ...prev,
                            tagsAndKeywords: [...prev.tagsAndKeywords, tag]
                          }));
                          input.value = '';
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                </div>
                  
                {product.tagsAndKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      <AnimatePresence>
                    {product.tagsAndKeywords.map((tag, index) => (
                          <motion.div 
                        key={index} 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                      >
                            <Badge variant="secondary" className="flex items-center gap-1 pl-3 h-7">
                        {tag}
                              <Button
                          type="button"
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 ml-1 hover:bg-destructive/20 rounded-full p-0"
                          onClick={() => {
                            setProduct(prev => ({
                              ...prev,
                              tagsAndKeywords: prev.tagsAndKeywords.filter((_, i) => i !== index)
                            }));
                          }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                  </div>
                )}
              </div>
              
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="brand">Brand</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brand1">Nike</SelectItem>
                        <SelectItem value="brand2">Adidas</SelectItem>
                        <SelectItem value="brand3">Puma</SelectItem>
                        <SelectItem value="brand4">Reebok</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="warranty">Warranty</Label>
                    <Select 
                  value={product.warrantyInfo}
                      onValueChange={(value) => {
                        setProduct(prev => ({ ...prev, warrantyInfo: value }))
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select warranty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NONE">No Warranty</SelectItem>
                        <SelectItem value="30 Days">30 Days</SelectItem>
                        <SelectItem value="90 Days">90 Days</SelectItem>
                        <SelectItem value="1 Year">1 Year</SelectItem>
                        <SelectItem value="2 Years">2 Years</SelectItem>
                        <SelectItem value="Lifetime">Lifetime</SelectItem>
                      </SelectContent>
                    </Select>
              </div>
              </div>
              </CardContent>
            </Card>
          </motion.div>
            </div>
            
        {/* Category Info */}
        <motion.div 
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Category Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="home">Home & Garden</SelectItem>
                      <SelectItem value="beauty">Beauty & Personal Care</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select>
                    <SelectTrigger id="subcategory">
                      <SelectValue placeholder="Select a subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phones">Smartphones</SelectItem>
                      <SelectItem value="laptops">Laptops</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Specifications section */}
        <motion.div 
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Specifications</CardTitle>
              <CardDescription>Add technical details and specifications</CardDescription>
            </CardHeader>
            <CardContent>
              <SpecificationsEditor specifications={specifications} setSpecifications={setSpecifications} />
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Description & Specifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Description */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Detailed Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden">
                  <div className="flex items-center space-x-2 p-2 bg-muted border-b">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
                      <span className="font-bold">B</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
                      <span className="italic">I</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
                      <span className="underline">U</span>
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
                      <span>🔗</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
                      <span>📋</span>
                    </Button>
                </div>
                  <Textarea
                    id="description"
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                    placeholder="Enter detailed description..."
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none resize-none"
                    rows={12}
                  />
                  </div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Right column - Price/Discount/Status */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">Pricing & Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
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
                      Discount
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
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Pricing & Options */}
        <motion.div 
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Product Options</CardTitle>
              <CardDescription>Set pricing, stock levels and product variants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Pricing section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Pricing & Inventory</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
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
              
                  <div className="space-y-3">
                    <Label htmlFor="comparePrice">
                      Discount
                      <span className="ml-2 text-xs text-muted-foreground">(Compare-at price)</span>
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
                  
                  <div className="space-y-3">
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
                </div>
              </div>
              
              {/* Status section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Status</h3>
                <div className="w-[200px]">
                  <Select 
                    value={product.status}
                    onValueChange={(value) => {
                      setProduct(prev => ({ ...prev, status: value }))
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="HIDDEN">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Colors section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Colors</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  <AnimatePresence>
                    {colors.map((color, index) => (
                      <motion.div 
                        key={index} 
                        className="relative group"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div 
                          className="w-8 h-8 rounded-full border border-border shadow-sm"
                          style={{ backgroundColor: color }}
                        ></div>
                        <button 
                          type="button"
                          onClick={() => handleRemoveColor(color)}
                          className="absolute -top-1 -right-1 bg-background border border-border rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <X className="w-3 h-3 text-foreground" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  <motion.div 
                    className="flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                  >
                <input
                      type="color"
                      id="newColor"
                      defaultValue="#000000"
                      onChange={(e) => {
                        if (!colors.includes(e.target.value)) {
                          handleAddColor(e.target.value);
                        }
                      }}
                      className="w-8 h-8 rounded-full border border-border bg-background cursor-pointer p-0"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        const colorInput = document.getElementById('newColor') as HTMLInputElement;
                        if (!colors.includes(colorInput.value)) {
                          handleAddColor(colorInput.value);
                        }
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>
              
              {/* Options section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                    id="isDigital"
                    checked={product.isDigital}
                      onCheckedChange={(checked: boolean | "indeterminate") => {
                        setProduct(prev => ({
                          ...prev,
                          isDigital: checked === true
                        }));
                      }}
                    />
                    <Label htmlFor="isDigital">Digital product</Label>
                </div>
                
                  <div className="flex items-center space-x-2">
                    <Checkbox
                  id="hasVariants"
                  checked={product.hasVariants}
                      onCheckedChange={(checked: boolean | "indeterminate") => {
                        setProduct(prev => ({
                          ...prev,
                          hasVariants: checked === true
                        }));
                      }}
                    />
                    <Label htmlFor="hasVariants">Has variants</Label>
                  </div>
              </div>
              
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                  id="isFeatured"
                  checked={product.isFeatured}
                      onCheckedChange={(checked: boolean | "indeterminate") => {
                        setProduct(prev => ({
                          ...prev,
                          isFeatured: checked === true
                        }));
                      }}
                    />
                    <Label htmlFor="isFeatured">Featured product</Label>
            </div>
            
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isOnSale"
                      checked={product.isOnSale}
                      onCheckedChange={(checked: boolean | "indeterminate") => {
                        setProduct(prev => ({
                          ...prev,
                          isOnSale: checked === true
                        }));
                      }}
                    />
                    <Label htmlFor="isOnSale">On sale</Label>
              </div>
              </div>
            </div>
            
              {product.isDigital && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Label htmlFor="digitalFileUrl">Digital File URL</Label>
                  <Input
                    id="digitalFileUrl"
                    name="digitalFileUrl"
                    value={product.digitalFileUrl}
                  onChange={handleChange}
                    className="mt-1"
                    placeholder="URL to digital file"
                  />
                </motion.div>
              )}

              {/* Sale dates section - show when isOnSale is true */}
              {product.isOnSale && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-medium mt-6">Sale Period</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="saleStartDate">Sale Start Date</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                        </span>
                        <Input
                          id="saleStartDate"
                          name="saleStartDate"
                          type="datetime-local"
                          value={product.saleStartDate || ''}
                          onChange={handleChange}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="saleEndDate">Sale End Date</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                        </span>
                        <Input
                          id="saleEndDate"
                          name="saleEndDate"
                          type="datetime-local"
                          value={product.saleEndDate || ''}
                          onChange={handleChange}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Shipping class section */}
              <div className="space-y-3 mt-4">
                <Label htmlFor="shippingClass">Shipping Class</Label>
                <Select
                  value={product.shippingClass}
                  onValueChange={(value) => {
                    setProduct(prev => ({ ...prev, shippingClass: value }))
                  }}
                >
                  <SelectTrigger id="shippingClass">
                    <SelectValue placeholder="Select shipping class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Shipping</SelectItem>
                    <SelectItem value="express">Express Shipping</SelectItem>
                    <SelectItem value="free">Free Shipping</SelectItem>
                    <SelectItem value="heavy">Heavy/Bulky Items</SelectItem>
                    <SelectItem value="fragile">Fragile Items</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Variants section - show when hasVariants is true */}
              {product.hasVariants && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-8"
                >
                  <VariantEditor variants={variants} setVariants={setVariants} />
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Final section with action buttons */}
        <div className="grid grid-cols-1 gap-6 mt-6">
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
            type="button"
              variant="secondary"
              onClick={() => {
                setProduct(prev => ({
                  ...prev,
                  status: 'DRAFT'
                }));
              }}
            >
              Save Draft
            </Button>
            <Button
            type="submit"
            disabled={isSubmitting}
              className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                  <span>Saving...</span>
              </>
            ) : (
              <>
                  <Save className="h-4 w-4" />
                  <span>Save Product</span>
              </>
            )}
            </Button>
          </motion.div>
        </div>
      </form>
    </div>
  );
}
