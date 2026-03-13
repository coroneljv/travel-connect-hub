import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/types/database";
import { type UIRole, dbRoleToUIRole, uiRoleToDbRole } from "@/lib/roles";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: {
    id: string;
    full_name: string;
    organization_id: string | null;
    position: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    phone?: string | null;
    date_of_birth?: string | null;
    nationality?: string | null;
    passport_country?: string | null;
    travel_style?: string | null;
  } | null;
  userRole: AppRole | null;
  uiRole: UIRole | null;
  organization: { id: string; name: string; country: string | null; description: string | null } | null;
  loading: boolean;
  selectedUIRole: UIRole | null;
  selectRole: (role: UIRole) => void;
  signUp: (params: {
    email: string;
    password: string;
    fullName: string;
    uiRole: UIRole;
    phone?: string;
    orgName?: string;
    orgCountry?: string;
  }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [organization, setOrganization] = useState<AuthContextType["organization"]>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUIRole, setSelectedUIRole] = useState<UIRole | null>(() => {
    return (sessionStorage.getItem("selectedRole") as UIRole) ?? null;
  });

  const uiRole = userRole ? dbRoleToUIRole(userRole) : null;

  const selectRole = (role: UIRole) => {
    setSelectedUIRole(role);
    sessionStorage.setItem("selectedRole", role);
  };

  const fetchUserData = async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, full_name, organization_id, position, avatar_url, bio, phone, date_of_birth, nationality, passport_country, travel_style")
        .eq("id", userId)
        .single();

      setProfile(profileData);

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      setUserRole((roleData?.role as AppRole) ?? null);

      if (profileData?.organization_id) {
        const { data: orgData } = await supabase
          .from("organizations")
          .select("id, name, country, description")
          .eq("id", profileData.organization_id)
          .single();

        setOrganization(orgData);
      } else {
        setOrganization(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => fetchUserData(session.user.id), 0);
      } else {
        setProfile(null);
        setUserRole(null);
        setOrganization(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (params: {
    email: string;
    password: string;
    fullName: string;
    uiRole: UIRole;
    phone?: string;
    orgName?: string;
    orgCountry?: string;
  }) => {
    const dbRole = uiRoleToDbRole(params.uiRole);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: params.fullName,
          ui_role: params.uiRole,
          phone: params.phone,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("Cadastro falhou");

    const orgName =
      params.uiRole === "anfitriao"
        ? params.orgName || params.fullName
        : params.fullName;
    const orgCountry = params.orgCountry || "Brasil";

    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .insert({ name: orgName, country: orgCountry })
      .select("id")
      .single();

    if (orgError) throw orgError;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ organization_id: orgData.id, full_name: params.fullName })
      .eq("id", authData.user.id);

    if (profileError) throw profileError;

    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: authData.user.id, role: dbRole });

    if (roleError) throw roleError;

    await fetchUserData(authData.user.id);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUserRole(null);
    setOrganization(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        userRole,
        uiRole,
        organization,
        loading,
        selectedUIRole,
        selectRole,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
