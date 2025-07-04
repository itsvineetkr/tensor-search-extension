import { authenticate } from '../shopify.server';
import axios from 'axios';

function flattenProductsByVariants(products) {
  const flattened = [];

  for (const product of products) {
    const variantEdges = product.variants?.edges || [];

    for (const variantEdge of variantEdges) {
      const variant = variantEdge.node;

      flattened.push({
        title: product.title,
        handle: product.handle,
        description: product.description,
        productId: product.id,
        variantId: variant.id,
        price: parseFloat(variant.price),
        sku: variant.sku,
        availableForSale: variant.availableForSale,
        inventoryQuantity: variant.inventoryQuantity,
        variantTitle: variant.title,
        image: variant.image?.url || null,
        // add other fields you want here
      });
    }
  }

  return flattened;
}

async function fetchAllProducts(admin) {
    const allProducts = [];
    let hasNextPage = true;
    let cursor = null;

    const PRODUCTS_QUERY = `#graphql
    query GetProducts($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            title
            handle
            description
            descriptionHtml
            status
            createdAt
            updatedAt
            publishedAt
            productType
            vendor
            tags
            totalInventory
            tracksInventory
            onlineStoreUrl
            seo {
              title
              description
            }
            options {
              id
              name
              values
            }
            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  price
                  compareAtPrice
                  sku
                  barcode
                  inventoryQuantity
                  taxable
                  inventoryPolicy
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }
            media(first: 20) {
              edges {
                node {
                  ... on MediaImage {
                    id
                    image {
                      url
                      altText
                      width
                      height
                    }
                    mediaContentType
                  }
                }
              }
            }
            collections(first: 10) {
              edges {
                node {
                  id
                  title
                  handle
                }
              }
            }
            metafields(first: 50) {
              edges {
                node {
                  id
                  namespace
                  key
                  value
                  type
                }
              }
            }
          }
        }
      }
    }`;

    while (hasNextPage) {
        const response = await admin.graphql(PRODUCTS_QUERY, {
            variables: {
                first: 50,
                after: cursor,
            },
        });

        const responseJson = await response.json();

        if (responseJson.errors) {
            throw new Error(`GraphQL Error: ${JSON.stringify(responseJson.errors)}`);
        }

        const { products } = responseJson.data;
        allProducts.push(...products.edges.map(edge => edge.node));

        hasNextPage = products.pageInfo.hasNextPage;
        cursor = products.pageInfo.endCursor;
    }

    return flattenProductsByVariants(allProducts);
}

async function syncProductsToAPI(products, shopDomain) {
    // Convert to JSONL format
    const jsonlData = products.map(product => JSON.stringify(product)).join('\n');

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('shop_domain', shopDomain);

    const blob = new Blob([jsonlData], { type: 'application/x-jsonlines' });
    formData.append('data', blob, 'products.jsonl');

    // Send to external API
    const apiResponse = await axios.post(
        'https://bckn.tensorsolution.in/api/v1/index-data-shopify',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 60000, // 60 second timeout for large datasets
        }
    );

    return apiResponse.data;
}

function handleSyncError(error) {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            return Response.json({
                success: false,
                message: `API request failed: ${error.response.status} - ${error.response.statusText}`,
                details: error.response.data
            });
        } else if (error.request) {
            return Response.json({
                success: false,
                message: 'Network error: Unable to reach the API server'
            });
        }
    }

    return Response.json({
        success: false,
        message: `Sync failed: ${error.message}`
    });
}

export const action = async ({ request }) => {
    if (request.method !== "POST") {
        throw new Response("Method not allowed", { status: 405 });
    }

    const { admin, session } = await authenticate.admin(request);

    try {
        const shopDomain = session.shop;
        console.log(`Starting product sync for shop: ${shopDomain}`);

        // Fetch all products using modern Shopify Admin API
        const products = await fetchAllProducts(admin);
        console.log(`Successfully fetched ${products.length} products`);

        // Convert to JSONL format and send to external API
        const syncResult = await syncProductsToAPI(products, shopDomain);

        return Response.json({
            success: true,
            message: `Successfully synced ${products.length} products from ${shopDomain}`,
            shopDomain,
            productCount: products.length,
            apiResult: syncResult
        });

    } catch (error) {
        console.error('Sync error:', error);
        return handleSyncError(error);
    }
};
