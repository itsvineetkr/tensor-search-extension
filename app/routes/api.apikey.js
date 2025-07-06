import prisma from "../db.server.js";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shopDomain = url.searchParams.get('shop_domain');

  if (!shopDomain) {
    return new Response(JSON.stringify({ 
      error: 'shop_domain parameter is required' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Find the API key for the given shop domain
    const apiKeyRecord = await prisma.APIKeys.findFirst({
      where: {
        shop_domain: shopDomain
      },
      select: {
        api_key: true
      }
    });

    if (!apiKeyRecord) {
      return new Response(JSON.stringify({ 
        error: 'API key not found for this shop domain' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      apiKey: apiKeyRecord.api_key 
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const action = async ({ request }) => {
  // Handle CORS preflight
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

  return loader({ request });
};
