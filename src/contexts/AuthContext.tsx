import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useEmailService } from '@/hooks/useEmailService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { sendWelcomeEmail, sendPasswordResetEmail } = useEmailService();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check if user is admin
        if (session?.user) {
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            setIsAdmin(profile?.role === 'admin');
          }, 0);
        } else {
          setIsAdmin(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        }
      }
    });

    // Send welcome email after successful signup
    if (!error && data.user) {
      setTimeout(async () => {
        try {
          await sendWelcomeEmail(email, fullName);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't throw error - signup was successful, email is just a bonus
        }
      }, 1000);
    }

    return { error };
  };

  const resetPassword = async (email: string) => {
    try {
      // Call our edge function to generate the reset link
      const { data, error } = await supabase.functions.invoke('generate-reset-link', {
        body: { email }
      });

      if (error) {
        console.error('Error calling generate-reset-link function:', error);
        return { data: null, error };
      }

      if (!data.success) {
        return { data: null, error: { message: data.error } };
      }

      // Send our custom email via Resend
      const emailResult = await sendPasswordResetEmail(email, data.resetLink);
      
      if (!emailResult.success) {
        return { data: null, error: { message: emailResult.error } };
      }

      return { data: { success: true }, error: null };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
