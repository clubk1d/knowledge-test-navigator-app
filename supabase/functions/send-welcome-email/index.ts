
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
  confirmationUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, confirmationUrl }: WelcomeEmailRequest = await req.json();

    console.log(`Sending welcome email to: ${email}`);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Driving Quiz App!</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <div style="background: white; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 24px;">🚗</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Driving Quiz App!</h1>
          </div>
          
          <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${fullName}!</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Welcome to the Driving Quiz App! We're excited to have you join our community of safe and knowledgeable drivers.
            </p>
            
            <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #1F2937; margin: 0 0 15px 0;">What you can do:</h3>
              <ul style="color: #4B5563; margin: 0; padding-left: 20px;">
                <li>Practice with categorized questions</li>
                <li>Take random quizzes of different lengths</li>
                <li>Track your progress over time</li>
                <li>Master traffic signs, road rules, and safety</li>
              </ul>
            </div>
            
            ${confirmationUrl ? `
            <p style="font-size: 16px; margin-bottom: 20px;">
              To get started, please confirm your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" style="background: #10B981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">Confirm Email Address</a>
            </div>
            ` : `
            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 16px; margin-bottom: 20px;">You're all set! Start practicing now:</p>
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovableproject.com') || 'https://your-app-url.com'}" style="background: #10B981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">Start Quiz Practice</a>
            </div>
            `}
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 14px; color: #6B7280; text-align: center;">
              🇵🇭 Proudly made by a Filipino 🇵🇭<br>
              Driving Quiz App Team
            </p>
            
            <p style="font-size: 12px; color: #9CA3AF; text-align: center; margin-top: 20px;">
              If you didn't create an account with us, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Driving Quiz App <noreply@wyndrive.com>",
      to: [email],
      subject: "Welcome to Driving Quiz App! 🚗",
      html: emailHtml,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
