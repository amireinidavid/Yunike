'use client';

import { useState, useEffect, ReactNode, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useProductStore from '../../../store/useProductStore';
import type { ProductFilters } from '../../../store/useProductStore';
import { useAuth } from '@/components/AuthProvider';
import { 
  Search, 
  Plus, 
  Filter, 
  ArrowUpDown, 
  Edit2, 
  Trash2, 
  Eye, 
  Package, 
  DollarSign, 
  Tag, 
  BarChart2,
  AlertCircle 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// ProductCard component for displaying product information
const ProductCard = ({ product, onDelete }: { product: any; onDelete: (id: string) => Promise<void> }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Use a more robust approach for finding the default image
  let defaultImage = '/placeholder-product.jpg';
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const mainImage = product.images.find((img: any) => img.isDefault || img.isMain);
    defaultImage = mainImage?.url || product.images[0]?.url || defaultImage;
  }

  const isLowInventory = product.inventory <= (product.lowInventoryThreshold || 5);
  const isOutOfStock = product.inventory === 0;
  
  // In our API, isPublished is equivalent to isActive in the UI
  const isActive = product.isActive !== undefined ? product.isActive : product.isPublished;

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await onDelete(product.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Add console log for debugging
  console.log('Rendering product card:', product.id, product.name, { hasImages: product.images?.length > 0 });

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-border">
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        <Image
          src={defaultImage}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Status badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {isOutOfStock ? (
            <span className="px-2 py-1 text-xs font-medium bg-destructive text-primary-foreground rounded">
              Out of Stock
            </span>
          ) : isLowInventory ? (
            <span className="px-2 py-1 text-xs font-medium bg-amber-500 text-primary-foreground rounded">
              Low Stock
            </span>
          ) : null}
          
          {!isActive && (
            <span className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded">
              Inactive
            </span>
          )}
          
          {product.isFeatured && (
            <span className="px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded">
              Featured
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-foreground line-clamp-1">{product.name}</h3>
        <div className="text-sm text-muted-foreground mb-2">{product.sku || 'No SKU'}</div>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="font-medium text-foreground">
              {product.salePrice ? (
                <>
                  <span className="text-destructive">${product.salePrice}</span>
                  <span className="text-sm text-muted-foreground line-through ml-1">${product.price}</span>
                </>
              ) : (
                `$${product.price}`
              )}
            </span>
          </div>
          
          <div className="flex items-center">
            <Package className="h-4 w-4 text-muted-foreground mr-1" />
            <span className={`text-sm font-medium ${isOutOfStock ? 'text-destructive' : isLowInventory ? 'text-amber-500' : 'text-muted-foreground'}`}>
              {product.inventory} in stock
            </span>
          </div>
        </div>
        
        {product.category && (
          <div className="mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              <Tag className="h-3 w-3 mr-1" />
              {product.category.name}
            </span>
          </div>
        )}
        
        <div className="flex justify-between items-center pt-3 border-t border-border">
          <div className="flex space-x-1">
            <Link href={`/dashboard/products/edit/${product.id}`} className="p-2 rounded-md hover:bg-secondary transition-colors">
              <Edit2 className="h-4 w-4 text-primary" />
            </Link>
            <Link href={`/dashboard/products/preview/${product.id}`} className="p-2 rounded-md hover:bg-secondary transition-colors">
              <Eye className="h-4 w-4 text-green-500" />
            </Link>
            <button 
              className="p-2 rounded-md hover:bg-secondary transition-colors" 
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </button>
          </div>
          
          {product.variants && product.variants.length > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              {product.variants.length} variants
            </span>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{product.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center p-3 bg-destructive/10 rounded-md border border-destructive/20">
              <Trash2 className="h-5 w-5 text-destructive mr-2" />
              <p className="text-sm text-destructive">This will permanently delete the product and all associated data.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete Product'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Filter and sort component
const ProductFilters = ({ 
  onSearchChange, 
  onSortChange, 
  onFilterChange, 
  activeSort, 
  activeFilters 
}: { 
  onSearchChange: (value: string) => void; 
  onSortChange: (sort: ProductFilters['sortBy']) => void;
  onFilterChange: (filter: Record<string, string | number | boolean>) => void;
  activeSort: ProductFilters['sortBy'];
  activeFilters: Record<string, string | number | boolean>;
}) => {
  return (
    <div className="bg-card p-4 rounded-lg shadow-sm mb-6 border border-border">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <input
            type="text"
            placeholder="Search products..."
            className="pl-10 pr-4 py-2 border border-border bg-background rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              className="appearance-none bg-background border border-border text-foreground py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              onChange={(e) => {
                // Type assertion to ensure the value matches the expected type
                const value = e.target.value as "newest" | "oldest" | "price_asc" | "price_desc" | "popular" | "rating";
                onSortChange(value);
              }}
              value={activeSort}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          </div>
          
          <button 
            className="flex items-center gap-2 py-2 px-4 bg-secondary border border-border rounded-lg hover:bg-secondary/80"
            onClick={() => {
              // Open more detailed filter modal/dropdown
              // This would be implemented with a modal or dropdown component
            }}
          >
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span>Filters</span>
          </button>
          
          <Link
            href="/dashboard/products/create"
            className="flex items-center gap-2 py-2 px-4 bg-primary hover:bg-primary/90 transition-colors text-primary-foreground rounded-lg"
          >
            <Plus className="h-4 w-4" />
            <span>Create Product</span>
          </Link>
        </div>
      </div>
      
      {/* Active filters section */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-border">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {Object.entries(activeFilters).map(([key, value]) => (
            value && (
              <span 
                key={key} 
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
              >
                {key}: {String(value)}
                <button 
                  className="ml-1 text-primary hover:text-primary/80"
                  onClick={() => {
                    const newFilters = {...activeFilters};
                    delete newFilters[key];
                    onFilterChange(newFilters);
                  }}
                >
                  ×
                </button>
              </span>
            )
          ))}
          <button 
            className="text-sm text-primary hover:text-primary/80"
            onClick={() => onFilterChange({})}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

// Stats overview component
const StatsOverview = ({ stats }: { stats: any }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Products</p>
            <h3 className="text-2xl font-bold text-foreground">{stats.total}</h3>
          </div>
          <div className="p-3 rounded-full bg-primary/10">
            <Package className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>
      
      <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Active Products</p>
            <h3 className="text-2xl font-bold text-foreground">{stats.active}</h3>
          </div>
          <div className="p-3 rounded-full bg-green-500/10">
            <Eye className="h-6 w-6 text-green-500" />
          </div>
        </div>
      </div>
      
      <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Low Stock</p>
            <h3 className="text-2xl font-bold text-foreground">{stats.lowStock}</h3>
          </div>
          <div className="p-3 rounded-full bg-amber-500/10">
            <AlertCircle className="h-6 w-6 text-amber-500" />
          </div>
        </div>
      </div>
      
      <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Featured Products</p>
            <h3 className="text-2xl font-bold text-foreground">{stats.featured}</h3>
          </div>
          <div className="p-3 rounded-full bg-primary/10">
            <BarChart2 className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Products Page
export default function ProductsPage() {
  const router = useRouter();
  const { 
    products, 
    totalProducts, 
    totalPages, 
    currentPage,
    isLoading, 
    error, 
    filters,
    fetchProducts, 
    fetchVendorProducts,
    deleteProduct,
    setFilters,
    resetFilters 
  } = useProductStore();
  
  // Add auth context to get user/vendor info
  const { isAuthenticated, user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string | number | boolean>>({});
  
  // Use a ref to track the previous filters to prevent infinite loops
  const prevFiltersRef = useRef<string>('');
  
  // Add ref to track component mount state
  const isMountedRef = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Product stats (would normally come from an API)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    lowStock: 0,
    featured: 0
  });
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Update filters when search changes
  useEffect(() => {
    if (debouncedSearch) {
      setFilters({ search: debouncedSearch, page: 1 });
    } else if (filters.search) {
      const { search, ...rest } = filters;
      setFilters({ ...rest, page: 1 });
    }
  }, [debouncedSearch, setFilters, filters.search]);
  
  // Initial fetch on component mount
  useEffect(() => {
    // Only run once on mount
    if (isAuthenticated && user?.vendor?.id) {
      console.log('Initial fetch of vendor products for vendor ID:', user.vendor.id);
      fetchVendorProducts(user.vendor.id);
    } else if (!isLoading) {
      console.log('Initial fetch of all products');
      fetchProducts();
    }
    
    // Only run on mount and auth changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.vendor?.id]);
  
  // Fetch vendor products when filters change, but avoid infinite loops
  useEffect(() => {
    // Skip if component is unmounted or initial loading
    if (!isMountedRef.current || !user?.vendor?.id) return;
    
    // Stringify the filters to compare with previous filters
    const currentFiltersString = JSON.stringify(filters);
    
    // Skip if this is the first render or if filters haven't changed
    if (prevFiltersRef.current === currentFiltersString) return;
    
    // Update the ref with current filters
    prevFiltersRef.current = currentFiltersString;
    
    // Only fetch if this isn't the first render (skip initial fetch)
    if (prevFiltersRef.current !== '') {
      console.log('Filters changed, fetching updated products with:', filters);
      
      if (isAuthenticated && user?.vendor?.id) {
        // Call without filters to use the ones already in the store
        fetchVendorProducts(user.vendor.id);
      } else {
        // Call without filters to use the ones already in the store
        fetchProducts();
      }
    }
  }, [filters, fetchVendorProducts, fetchProducts, isAuthenticated, user]);
  
  // Update stats when products change
  useEffect(() => {
    // Log products for debugging
    console.log('Products received:', products.length, products);
    
    if (products.length > 0) {
      setStats({
        total: totalProducts,
        active: products.filter(p => {
          // Use type assertion to access isPublished which exists in API but not in the Product type
          const product = p as any;
          return p.isActive !== undefined ? p.isActive : product.isPublished;
        }).length,
        lowStock: products.filter(p => p.inventory <= (p.lowInventoryThreshold || 5)).length,
        featured: products.filter(p => p.isFeatured).length
      });
    }
  }, [products, totalProducts]);
  
  // Handle sorting change
  const handleSortChange = (sortValue: ProductFilters['sortBy']) => {
    setFilters({ sortBy: sortValue, page: 1 });
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters: Record<string, string | number | boolean>) => {
    setActiveFilters(newFilters);
    setFilters({ ...newFilters, page: 1 });
  };
  
  // Handle pagination
  const handlePageChange = (pageNumber: number) => {
    setFilters({ page: pageNumber });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Add the handleDeleteProduct function
  const handleDeleteProduct = async (productId: string) => {
    try {
      console.log('Deleting product:', productId);
      await deleteProduct(productId);
      
      // Refresh the product list after deletion
      if (user?.vendor?.id) {
        await fetchVendorProducts(user.vendor.id);
      } else {
        await fetchProducts();
      }

      // Update stats after deletion
      setStats({
        ...stats,
        total: stats.total - 1
      });

      // You could add a toast notification here if you have a toast library
      // toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Failed to delete product:', error);
      // toast.error('Failed to delete product');
    }
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Products</h1>
        <p className="text-muted-foreground">Manage your product inventory and listings</p>
      </div>
      
      {/* Stats Overview */}
      <StatsOverview stats={stats} />
      
      {/* Filters and Search */}
      <ProductFilters 
        onSearchChange={setSearchQuery}
        onSortChange={handleSortChange}
        onFilterChange={handleFilterChange}
        activeSort={filters.sortBy || 'newest'}
        activeFilters={activeFilters}
      />
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && !isLoading && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6">
          <div className="flex">
            <div className="py-1">
              <AlertCircle className="h-6 w-6 text-destructive mr-3" />
            </div>
            <div>
              <p className="font-medium">Failed to load products</p>
              <p className="text-sm">{error}</p>
              <button 
                onClick={() => fetchProducts()} 
                className="mt-2 text-sm font-medium text-destructive hover:text-destructive/80"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && !error && products.length === 0 && (
        <div className="bg-card rounded-lg shadow-sm border border-border p-8 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {Object.keys(activeFilters).length > 0
              ? "Try adjusting your filters or search terms."
              : "Get started by creating your first product."}
          </p>
          <Link
            href="/dashboard/products/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Product
          </Link>
        </div>
      )}
      
      {/* Product grid */}
      {!isLoading && !error && products.length > 0 && (
        <>
          {/* Debug info */}
          <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
            <h4 className="font-medium mb-1">Debug Info</h4>
            <p className="text-sm">Products loaded: {products.length}</p>
            <p className="text-sm">First product ID: {products[0].id}</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-background border border-border text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Logic to display current page and surrounding pages
                  let pageNum;
                  
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === pageNum
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="px-3 py-1 rounded-md bg-background border border-border text-foreground hover:bg-muted"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md bg-background border border-border text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}
