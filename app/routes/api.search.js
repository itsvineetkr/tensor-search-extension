import axios from 'axios';

export const loader = async ({ request }) => {
  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';

  // Extract query parameters
  const shopDomain = url.host;
  const searchType = 'vector';

  // Build the request payload as URLSearchParams (form data)
  const formData = new URLSearchParams();
  formData.append('shop_domain', shopDomain);
  formData.append('query', q);
  formData.append('search_type', searchType);

  try {
    const response = await axios.post(
      'https://4aed-183-82-163-52.ngrok-free.app/api/v1/shopify-search',
      formData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    const data = response.data;
    
    if (data.status === 'error') {
      return new Response(JSON.stringify({ error: data.response }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    return new Response(JSON.stringify({ products: data.response }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    // Handle axios errors properly
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    const statusCode = error.response?.status || 500;
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: statusCode,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
};