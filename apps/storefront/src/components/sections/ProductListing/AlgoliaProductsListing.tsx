"use client"

import { HttpTypes } from "@medusajs/types"
import {
  AlgoliaProductSidebar,
  ProductListingActiveFilters,
  ProductsPagination,
} from "@/components/organisms"
import {
  ProductListingLoadingView,
  ProductListingNoResultsView,
  ProductListingProductsView,
} from "@/components/molecules"
import { client } from "@/lib/client"
import { Configure, useHits } from "react-instantsearch"
import { InstantSearchNext } from "react-instantsearch-nextjs"
import { useSearchParams } from "next/navigation"
import { getFacedFilters } from "@/lib/helpers/get-faced-filters"
import { PRODUCT_LIMIT } from "@/const"
import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { useEffect, useMemo, useState } from "react"
import { listProducts } from "@/lib/data/products"
import { getProductPrice } from "@/lib/helpers/get-product-price"

export const AlgoliaProductsListing = ({
  category_id,
  collection_id,
  seller_handle,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION,
  currency_code,
}: {
  category_id?: string
  collection_id?: string
  locale?: string
  seller_handle?: string
  currency_code: string
}) => {
  const searchParams = useSearchParams()

  const facetFilters: string = getFacedFilters(searchParams)
  const query: string = searchParams.get("query") || ""
  const page: number = +(searchParams.get("page") || 1)

  const filterParts = []
  
  if (seller_handle) {
    filterParts.push(`seller.handle:${seller_handle}`)
  }
  
  if (category_id) {
    filterParts.push(`categories.id:${category_id}`)
  }
  
  if (collection_id) {
    filterParts.push(`collections.id:${collection_id}`)
  }
  
  if (facetFilters) {
    filterParts.push(facetFilters)
  }
  
  const filters = filterParts.join(' AND ')
  
  console.log('Filters being applied:', filters || '(no filters)')
  console.log('Currency code:', currency_code, 'Locale:', locale)
  console.log('Category ID:', category_id)
  
  return (
    <InstantSearchNext searchClient={client} indexName="products">
      <Configure
        query={query}
        filters={filters}
        hitsPerPage={PRODUCT_LIMIT}
        page={page - 1}
      />
      <ProductsListing
        locale={locale}
        currency_code={currency_code}
        filters={filters}
      />
    </InstantSearchNext>
  )
}

const ProductsListing = ({
  locale,
  currency_code,
  filters,
}: {
  locale?: string
  currency_code: string
  filters: string
}) => {
  const [apiProducts, setApiProducts] = useState<
    HttpTypes.StoreProduct[] | null
  >(null)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const { items, results } = useHits()

  console.log('Algolia results:', {
    items: items.length,
    nbHits: results?.nbHits,
    filters: filters
  })
  
  if (items.length > 0) {
    console.log('First item categories:', items[0].categories)
  }

  const searchParams = useSearchParams()

  const itemsKey = useMemo(
    () => items.map((item) => item.objectID).join(","),
    [items]
  )

  async function handleSetProducts() {
    try {
      setIsLoadingProducts(true)
      const { response } = await listProducts({
        countryCode: locale,
        queryParams: {
          fields:
            "*variants.calculated_price,*seller.reviews,-thumbnail,-images,-type,-tags,-variants.options,-options,-collection,-collection_id",
          handle: items.map((item) => item.handle),
          limit: items.length,
        },
      })

      const filteredProducts = response.products.filter((prod) => {
        const { cheapestPrice } = getProductPrice({ product: prod })
        return Boolean(cheapestPrice) && prod
      })
      
      setApiProducts(filteredProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
      setApiProducts(null)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  useEffect(() => {
    if (items.length > 0) {
      handleSetProducts()
    } else {
      setApiProducts([])
      setIsLoadingProducts(false)
    }
  }, [itemsKey])

  if (!results?.processingTimeMS) return <ProductListingSkeleton />

  const isLoading = isLoadingProducts && items.length > 0
  
  const products = items.filter((pr) => {
    const apiProduct = apiProducts?.find((p) => p.handle === pr.handle)
    return apiProduct && filterProductsByCurrencyCode(apiProduct)
  })

  const count = results?.nbHits || 0
  const pages = results?.nbPages || 1

  function filterProductsByCurrencyCode(product: HttpTypes.StoreProduct) {
    const minPrice = searchParams.get("min_price")
    const maxPrice = searchParams.get("max_price")

    if ([minPrice, maxPrice].some((price) => typeof price === "string")) {
      const variantsWithCurrencyCode = product?.variants?.filter(
        (variant) => variant.calculated_price?.currency_code === currency_code
      )

      if (!variantsWithCurrencyCode?.length) {
        return false
      }

      if (minPrice && maxPrice) {
        return variantsWithCurrencyCode.some(
          (variant) =>
            (variant.calculated_price?.calculated_amount ?? 0) >= +minPrice &&
            (variant.calculated_price?.calculated_amount ?? 0) <= +maxPrice
        )
      }
      if (minPrice) {
        return variantsWithCurrencyCode.some(
          (variant) =>
            (variant.calculated_price?.calculated_amount ?? 0) >= +minPrice
        )
      }
      if (maxPrice) {
        return variantsWithCurrencyCode.some(
          (variant) =>
            (variant.calculated_price?.calculated_amount ?? 0) <= +maxPrice
        )
      }
    }

    return true
  }

  return (
    <div className="min-h-[70vh]">
      <div className="flex justify-between w-full items-center">
        <div className="my-4 label-md">{`${count} listings`}</div>
      </div>
      <div className="hidden md:block">
        <ProductListingActiveFilters />
      </div>
      <div className="md:flex gap-4">
        <div className="w-[280px] flex-shrink-0 hidden md:block">
          <AlgoliaProductSidebar />
        </div>
        <div className="w-full flex flex-col">
          {isLoading && <ProductListingLoadingView />}

          {!isLoading && !products.length && <ProductListingNoResultsView />}

          {!isLoading && products.length > 0 && (
            <ProductListingProductsView
              products={products}
              apiProducts={apiProducts}
            />
          )}

          <div className="mt-auto">
            <ProductsPagination pages={pages} />
          </div>
        </div>
      </div>
    </div>
  )
}
