import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getAuthToken() {
  const response = await fetch('https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      username: Deno.env.get('BKASH_USERNAME') || '',
      password: Deno.env.get('BKASH_PASSWORD') || '',
    },
    body: JSON.stringify({
      app_key: Deno.env.get('BKASH_APP_KEY'),
      app_secret: Deno.env.get('BKASH_APP_SECRET'),
    }),
  })

  const data = await response.json()
  console.log('Auth token response:', data)
  return data.id_token
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const { packageId, userId } = await req.json()
    console.log('Received request:', { packageId, userId })

    if (!packageId || !userId) {
      throw new Error('Package ID and User ID are required')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get package details
    const { data: packageData, error: packageError } = await supabaseClient
      .from('credit_packages')
      .select('*')
      .eq('id', packageId)
      .single()

    if (packageError || !packageData) {
      console.error('Package error:', packageError)
      throw new Error('Package not found')
    }

    console.log('Package data:', packageData)

    // Get auth token
    const idToken = await getAuthToken()
    console.log('Got auth token')

    // Create payment
    const createPaymentResponse = await fetch('https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: idToken,
        'x-app-key': Deno.env.get('BKASH_APP_KEY') || '',
      },
      body: JSON.stringify({
        mode: '0011',
        payerReference: userId,
        callbackURL: `${req.headers.get('origin')}/credits/purchase/callback`,
        amount: packageData.price.toString(),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: crypto.randomUUID(),
      }),
    })

    const paymentData = await createPaymentResponse.json()
    console.log('Payment creation response:', paymentData)

    return new Response(
      JSON.stringify({
        success: true,
        data: paymentData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in bKash payment:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})