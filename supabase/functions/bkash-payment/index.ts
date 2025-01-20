import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { packageId, userId, callbackUrl } = await req.json()
    console.log('Received request:', { packageId, userId, callbackUrl })

    if (!packageId || !userId || !callbackUrl) {
      throw new Error('Missing required parameters')
    }

    const username = Deno.env.get('BKASH_USERNAME')
    const password = Deno.env.get('BKASH_PASSWORD')
    const appKey = Deno.env.get('BKASH_APP_KEY')
    const appSecret = Deno.env.get('BKASH_APP_SECRET')

    if (!username || !password || !appKey || !appSecret) {
      throw new Error('Missing bKash credentials')
    }

    // Initialize bKash payment
    const bkashResponse = await fetch('https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'username': username,
        'password': password
      },
      body: JSON.stringify({
        mode: '0011',
        payerReference: userId,
        callbackURL: callbackUrl,
        amount: "100", // This should come from the package
        currency: "BDT",
        intent: 'sale',
        merchantInvoiceNumber: 'INV' + Date.now()
      })
    })

    const bkashData = await bkashResponse.json()
    console.log('bKash response:', bkashData)

    if (!bkashData.bkashURL) {
      throw new Error('Failed to get bKash payment URL')
    }

    return new Response(
      JSON.stringify({
        data: bkashData
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      },
    )
  }
})