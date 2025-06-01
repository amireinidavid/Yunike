import { create } from 'zustand';
import { api, productApi } from '../utils/api';

// Product type definition
export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  isDefault: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  inventory: number;
  isActive: boolean;
  attributes: Record<string, string>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  sku: string;
  barcode?: string;
  inventory: number;
  lowInventoryThreshold?: number;
  isActive: boolean;
  isFeatured: boolean;
  images: ProductImage[];
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  vendorId: string;
  vendor?: {
    id: string;
    name: string;
    slug: string;
  };
  variants?: ProductVariant[];
  attributes?: Record<string, string>;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Filtering types
export interface ProductFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular' | 'rating';
  page: number;
  limit: number;
}

// Store interface
interface ProductStoreState {
  // Product collections
  products: Product[];
  featuredProducts: Product[];
  relatedProducts: Product[];
  currentProduct: Product | null;
  
  // Pagination & metadata
  totalProducts: number;
  totalPages: number;
  currentPage: number;
  
  // Filters & sorting
  filters: ProductFilters;
  
  // UI states
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  
  // Product CRUD actions
  fetchProducts: (filters?: Partial<ProductFilters>) => Promise<void>;
  fetchFeaturedProducts: (limit?: number) => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  fetchProductBySlug: (slug: string) => Promise<Product | null>;
  fetchRelatedProducts: (productId: string, limit?: number) => Promise<void>;
  fetchVendorProducts: (vendorId: string, filters?: Partial<ProductFilters>) => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  
  // Vendor product management
  createProduct: (productData: Partial<Product> | any) => Promise<Product | null>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  updateInventory: (productId: string, inventory: number, variantInventory?: Record<string, number>) => Promise<boolean>;
  
  // Store UI actions
  setFilters: (filters: Partial<ProductFilters>) => void;
  resetFilters: () => void;
  clearErrors: () => void;
  setCurrentProduct: (product: Product | null) => void;
}

// Default filters
const DEFAULT_FILTERS: ProductFilters = {
  page: 1,
  limit: 20,
  sortBy: 'newest'
};

// Create the store
const useProductStore = create<ProductStoreState>((set, get) => ({
  // Initial state
  products: [],
  featuredProducts: [],
  relatedProducts: [],
  currentProduct: null,
  
  totalProducts: 0,
  totalPages: 0,
  currentPage: 1,
  
  filters: DEFAULT_FILTERS,
  
  isLoading: false,
  isSubmitting: false,
  error: null,
  
  // Fetch all products with optional filters
  fetchProducts: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      
      // Merge existing filters with new filters
      const currentFilters = get().filters;
      const updatedFilters = { ...currentFilters, ...filters };
      
      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      
      // Make API request
      const response = await api.get(`${productApi.getAllProducts}?${queryParams.toString()}`);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      set({
        products: response.products || [],
        totalProducts: response.total || 0,
        totalPages: response.pages || 0,
        currentPage: response.page || 1,
        // Only update filters when explicit filters are provided to avoid infinite loops
        ...(Object.keys(filters).length > 0 ? { filters: updatedFilters } : {}),
        isLoading: false
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch products'
      });
    }
  },
  
  // Fetch featured products
  fetchFeaturedProducts: async (limit = 8) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.get(`${productApi.getFeaturedProducts}?limit=${limit}`);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      set({
        featuredProducts: response.products || [],
        isLoading: false
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch featured products'
      });
    }
  },
  
  // Fetch a single product by ID
  fetchProductById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      console.log(`Fetching product ${id} using endpoint:`, productApi.getVendorDashboardProduct(id));
      
      // Use the vendor dashboard endpoint which returns properly formatted data
      const response = await api.get(productApi.getVendorDashboardProduct(id));
      console.log('Raw API response:', JSON.stringify(response, null, 2));
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch product');
      }
      
      const productData = response.data;
      console.log('Product data extracted:', productData ? 'Found' : 'Not found');
      
      set({
        currentProduct: productData || null,
        isLoading: false
      });
      
      return productData || null;
    } catch (error: any) {
      console.error('Error fetching product:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch product'
      });
      return null;
    }
  },
  
  // Fetch a single product by slug
  fetchProductBySlug: async (slug: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.get(productApi.getProductBySlug(slug));
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      set({
        currentProduct: response.product || null,
        isLoading: false
      });
      
      return response.product || null;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch product'
      });
      return null;
    }
  },
  
  // Fetch related products
  fetchRelatedProducts: async (productId: string, limit = 8) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.get(`${productApi.getRelatedProducts(productId)}?limit=${limit}`);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      set({
        relatedProducts: response.products || [],
        isLoading: false
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch related products'
      });
    }
  },
  
  // Fetch vendor products
  fetchVendorProducts: async (vendorId: string, filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      
      // Merge existing filters with new filters
      const currentFilters = get().filters;
      const updatedFilters = { ...currentFilters, ...filters };
      
      // Build query string
      const queryParams = new URLSearchParams();
      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      
      const response = await api.get(`${productApi.getVendorProducts(vendorId)}?${queryParams.toString()}`);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Log the response for debugging
      console.log('Vendor products response:', JSON.stringify(response, null, 2));
      
      // Check for the new API response format which has products in the data array
      const products = response.data || response.products || [];
      const pagination = response.pagination || {};
      
      // Map isPublished to isActive for consistency with UI
      const mappedProducts = products.map((product: any) => ({
        ...product,
        isActive: product.isActive !== undefined ? product.isActive : product.isPublished
      }));
      
      set({
        products: mappedProducts,
        totalProducts: pagination.total || 0,
        totalPages: pagination.pages || 0,
        currentPage: pagination.page || 1,
        filters: updatedFilters,
        isLoading: false
      });
    } catch (error: any) {
      console.error('Failed to fetch vendor products:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch vendor products'
      });
    }
  },
  
  // Search products
  searchProducts: async (query: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.get(`${productApi.searchProducts}?query=${encodeURIComponent(query)}`);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      set({
        products: response.products || [],
        totalProducts: response.total || 0,
        totalPages: response.pages || 0,
        currentPage: 1,
        isLoading: false
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to search products'
      });
    }
  },
  
  // Create a new product
  createProduct: async (productData: Partial<Product> | any) => {
    try {
      set({ isSubmitting: true, error: null });
      
      // Log the request for debugging
      console.log('Creating product with data:', JSON.stringify(productData, null, 2));
      
      // Ensure we're sending the right format for the server
      // Create a copy to avoid mutating the original data
      const adaptedData = { ...productData };
      
      // Process images if needed
      if (adaptedData.images) {
        console.log(`Processing ${adaptedData.images.length} images for submission`);
      }
      
      // Process variants if needed
      if (adaptedData.variants) {
        console.log(`Processing ${adaptedData.variants.length} variants for submission`);
        // Ensure variants are in the right format
        adaptedData.variants = adaptedData.variants.map((variant: any) => {
          // Convert options to expected format if they're strings
          if (variant.options && Array.isArray(variant.options)) {
            console.log(`Variant ${variant.name} has ${variant.options.length} options`);
          }
          return variant;
        });
      }
      
      const response = await api.post(productApi.createProduct, adaptedData);
      
      // Handle explicit error response
      if (response.error || !response.success) {
        const errorMessage = response.message || response.error || 'Failed to create product';
        console.error('Product creation error:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Verify we have a valid product response
      if (!response.data) {
        throw new Error('Invalid response from server, missing product data');
      }
      
      // Update products list
      const products = get().products;
      set({
        products: [response.data, ...products],
        currentProduct: response.data,
        isSubmitting: false
      });
      
      console.log('Product created successfully:', response.data.id);
      return response.data || null;
    } catch (error: any) {
      // Check for authentication error
      if (error.message?.includes('Authentication') || 
          error.message?.includes('token') ||
          error.message?.includes('unauthorized')) {
        console.error('Authentication error during product creation:', error);
        set({
          isSubmitting: false,
          error: 'Please log in to create products'
        });
      } else {
        console.error('Product creation error:', error);
        set({
          isSubmitting: false,
          error: error.message || 'Failed to create product'
        });
      }
      return null;
    }
  },
  
  // Update a product
  updateProduct: async (id: string, productData: Partial<Product>) => {
    try {
      set({ isSubmitting: true, error: null });
      
      const response = await api.put(productApi.updateProduct(id), productData);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update products list
      const products = get().products.map(product => 
        product.id === id ? { ...product, ...response.product } : product
      );
      
      set({
        products,
        currentProduct: response.product,
        isSubmitting: false
      });
      
      return response.product || null;
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error.message || 'Failed to update product'
      });
      return null;
    }
  },
  
  // Delete a product
  deleteProduct: async (id: string) => {
    try {
      set({ isSubmitting: true, error: null });
      
      const response = await api.delete(productApi.deleteProduct(id));
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update products list
      const products = get().products.filter(product => product.id !== id);
      set({
        products,
        isSubmitting: false
      });
      
      return true;
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error.message || 'Failed to delete product'
      });
      return false;
    }
  },
  
  // Update product inventory
  updateInventory: async (
    productId: string, 
    inventory: number, 
    variantInventory?: Record<string, number>
  ) => {
    try {
      set({ isSubmitting: true, error: null });
      
      const response = await api.put(
        productApi.updateInventory(productId), 
        { inventory, variantInventory }
      );
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Update products list with new inventory values
      const products = get().products.map(product => {
        if (product.id === productId) {
          // Update main product inventory
          const updatedProduct = { ...product, inventory };
          
          // Update variant inventories if available
          if (variantInventory && updatedProduct.variants) {
            updatedProduct.variants = updatedProduct.variants.map(variant => {
              if (variantInventory[variant.id]) {
                return { ...variant, inventory: variantInventory[variant.id] };
              }
              return variant;
            });
          }
          
          return updatedProduct;
        }
        return product;
      });
      
      // Also update current product if it matches
      let currentProduct = get().currentProduct;
      if (currentProduct && currentProduct.id === productId) {
        currentProduct = { 
          ...currentProduct, 
          inventory 
        };
        
        // Update variant inventories
        if (variantInventory && currentProduct.variants) {
          currentProduct.variants = currentProduct.variants.map(variant => {
            if (variantInventory[variant.id]) {
              return { ...variant, inventory: variantInventory[variant.id] };
            }
            return variant;
          });
        }
      }
      
      set({
        products,
        currentProduct,
        isSubmitting: false
      });
      
      return true;
    } catch (error: any) {
      set({
        isSubmitting: false,
        error: error.message || 'Failed to update inventory'
      });
      return false;
    }
  },
  
  // Set filters
  setFilters: (filters: Partial<ProductFilters>) => {
    const currentFilters = get().filters;
    set({ filters: { ...currentFilters, ...filters } });
  },
  
  // Reset filters to default
  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS });
  },
  
  // Clear any errors
  clearErrors: () => {
    set({ error: null });
  },
  
  // Set the current product
  setCurrentProduct: (product: Product | null) => {
    set({ currentProduct: product });
  }
}));

export default useProductStore;
