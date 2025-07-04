export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';

  // Extract query parameters
  const shopDomain = url.searchParams.get('shop_domain') || '';
  const searchType = url.searchParams.get('search_type') || 'keyword';
  const queryBy = url.searchParams.get('query_by') || 'title, body, tags, productType';
  const filterBy = url.searchParams.get('filter_by') || '';
  const sortBy = url.searchParams.get('sort_by') || '';
  const facetBy = url.searchParams.get('facet_by') || '';
  const perPage = parseInt(url.searchParams.get('per_page') || '10');
  const page = parseInt(url.searchParams.get('page') || '1');

  // Build the request
  const searchParams = new URLSearchParams({
    shop_domain: shopDomain,
    query: q,
    search_type: searchType,
    query_by: queryBy,
    filter_by: filterBy,
    sort_by: sortBy,
    facet_by: facetBy,
    per_page: perPage,
    page: page
  });

  try {
    const response = await fetch('https://bckn.tensorsolution.in/api/v1/shopify-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: searchParams.toString()
    });

    const data = await response.json();
    
    if (data.status === 'error') {
      return new Response(JSON.stringify({ error: data.response }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ products: data.response }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
};
