import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function getAuthToken(retryCount = 0) {
  try {
    const maxRetries = 3;
    const username = Deno.env.get('BKASH_USERNAME');
    const password = Deno.env.get('BKASH_PASSWORD');
    const appKey = Deno.env.get('BKASH_APP_KEY');
    const appSecret = Deno.env.get('BKASH_APP_SECRET');

    // Validate environment variables
    if (!username || !password || !appKey || !appSecret) {
      throw new Error('Missing bKash configuration');
    }

    const response = await fetch('https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        username,
        password,
      },
      body: JSON.stringify({
        app_key: appKey,
        app_secret: appSecret,
      }),
    })

    if (!response.ok) {
      console.error(`bKash auth response status: ${response.status}`);
      
      // Retry logic for 503 errors
      if (response.status === 503 && retryCount < maxRetries) {
        console.log(`Retrying auth token request (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
        return getAuthToken(retryCount + 1);
      }
      
      throw new Error(`বিকাশ সার্ভিস এই মুহূর্তে কাজ করছে না, অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন`);
    }

    const data = await response.json()
    console.log('Auth token response:', data)
    
    if (!data.id_token) {
      throw new Error('বিকাশ অথেনটিকেশন ব্যর্থ হয়েছে');
    }
    
    return data.id_token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw new Error('বিকাশ পেমেন্ট সিস্টেম এই মুহূর্তে কাজ করছে না, অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন');
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      }
    });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    // Parse the request body
    const { packageId, userId } = await req.json();
    console.log('Received request:', { packageId, userId });

    if (!packageId || !userId) {
      throw new Error('প্যাকেজ আইডি এবং ইউজার আইডি প্রয়োজন');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get package details
    const { data: packageData, error: packageError } = await supabaseClient
      .from('credit_packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (packageError || !packageData) {
      console.error('Package error:', packageError);
      throw new Error('প্যাকেজ খুঁজে পাওয়া যায়নি');
    }

    console.log('Package data:', packageData);

    // Get auth token with retry logic
    const idToken = await getAuthToken();
    console.log('Got auth token');

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
    });

    if (!createPaymentResponse.ok) {
      console.error(`Payment creation failed with status: ${createPaymentResponse.status}`);
      if (createPaymentResponse.status === 503) {
        throw new Error('বিকাশ সার্ভিস এই মুহূর্তে কাজ করছে না, অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন');
      }
      throw new Error('পেমেন্ট তৈরি করা যায়নি');
    }

    const paymentData = await createPaymentResponse.json();
    console.log('Payment creation response:', paymentData);

    if (!paymentData.bkashURL) {
      throw new Error('বিকাশ পেমেন্ট URL পাওয়া যায়নি');
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: paymentData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in bKash payment:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message.includes('not allowed') ? 405 : 400,
      }
    );
  }
});