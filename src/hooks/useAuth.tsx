
/**
 * HOOK DE AUTENTICAÇÃO - useAuth
 * 
 * Este hook gerencia todo o sistema de autenticação da aplicação usando Supabase Auth.
 * Fornece acesso global ao estado de autenticação e sessão do usuário.
 * 
 * Funcionalidades:
 * - Gerenciamento de estado de autenticação
 * - Detecção automática de mudanças na sessão
 * - Recuperação de sessão existente
 * - Contexto global para toda a aplicação
 * 
 * Uso:
 * 1. Envolver a aplicação com AuthProvider
 * 2. Usar useAuth() em qualquer componente para acessar dados de autenticação
 */

// Importações necessárias
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/**
 * INTERFACE DO CONTEXTO DE AUTENTICAÇÃO
 * 
 * Define a estrutura dos dados disponíveis no contexto de autenticação
 */
interface AuthContextType {
  user: User | null;        // Dados do usuário autenticado (null se não autenticado)
  session: Session | null;  // Sessão ativa do Supabase (null se não há sessão)
  loading: boolean;         // Indica se está carregando dados de autenticação
}

/**
 * CONTEXTO DE AUTENTICAÇÃO
 * 
 * Contexto React que armazena e compartilha o estado de autenticação
 * entre todos os componentes da aplicação
 */
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
});

/**
 * HOOK PARA USAR O CONTEXTO DE AUTENTICAÇÃO
 * 
 * Hook personalizado que fornece acesso aos dados de autenticação.
 * Deve ser usado dentro de um AuthProvider.
 * 
 * @returns {AuthContextType} Objeto com user, session e loading
 * @throws {Error} Se usado fora do AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * PROVEDOR DE AUTENTICAÇÃO
 * 
 * Componente que gerencia o estado de autenticação e fornece
 * os dados para toda a árvore de componentes.
 * 
 * Funcionalidades:
 * - Escuta mudanças no estado de autenticação
 * - Recupera sessão existente na inicialização
 * - Mantém estado sincronizado com Supabase
 * 
 * @param {React.ReactNode} children - Componentes filhos
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Estados locais para gerenciar autenticação
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * CONFIGURAÇÃO DO LISTENER DE AUTENTICAÇÃO
     * 
     * Escuta mudanças no estado de autenticação (login, logout, refresh)
     * e atualiza o estado local automaticamente
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    /**
     * RECUPERAÇÃO DE SESSÃO EXISTENTE
     * 
     * Verifica se há uma sessão ativa ao inicializar a aplicação
     * (por exemplo, se o usuário já estava logado)
     */
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Retrieved existing session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    /**
     * CLEANUP
     * 
     * Remove o listener quando o componente for desmontado
     * para evitar vazamentos de memória
     */
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
