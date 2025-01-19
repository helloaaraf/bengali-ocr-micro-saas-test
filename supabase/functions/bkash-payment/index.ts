import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BkashConfig {
  grantTokenUrl: string
  createPaymentUrl: string
  executePaymentUrl: string
  username: string
  password: string
  appKey: string
  appSecret: string
}

const config: BkashConfig = {
  grantTokenUrl: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant',
  createPaymentUrl: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create',
  executePaymentUrl: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/execute',
  username: Deno.env.get('BKASH_USERNAME') || '',
  password: Deno.env.get('BKASH_PASSWORD') || '',
  appKey: Deno.env.get('BKASH_APP_KEY') || '',
  appSecret: Deno.env.get('BKASH_APP_SECRET') || '',
}

async function getAuthToken() {
  const response = await fetch(config.grantTokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      username: config.username,
      password: config.password,
    },
    body: JSON.stringify({
      app_key: config.appKey,
      app_secret: config.appSecret,
    }),
  })

  const data = await response.json()
  return data.id_token
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { packageId, userId } = await req.json()
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
      throw new Error('Package not found')
    }

    // Get auth token
    const idToken = await getAuthToken()

    // Create payment
    const createPaymentResponse = await fetch(config.createPaymentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authorization: idToken,
        'x-app-key': config.appKey,
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