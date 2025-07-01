
import { supabase } from '@/integrations/supabase/client';

export const useEmailService = () => {
  const sendPasswordResetEmail = async (email: string, resetLink: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: { email, resetLink }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }
  };

  const sendWelcomeEmail = async (email: string, fullName: string, confirmationUrl?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: { email, fullName, confirmationUrl }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  };

  const sendCustomEmail = async (to: string, subject: string, html: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: { to, subject, html }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendCustomEmail
  };
};
