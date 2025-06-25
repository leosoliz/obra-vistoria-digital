
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Shield } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Login realizado!",
          description: "Bem-vindo ao Sistema de Vistoria de Obras.",
        });
        
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: name,
            }
          }
        });

        if (error) throw error;

        toast({
          title: "Conta criada!",
          description: "Verifique seu email para confirmar a conta.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center pb-8 gradient-institucional text-white rounded-t-lg">
          <div className="flex items-center justify-center mb-6">
            <div className="relative mr-3">
              <Shield className="h-12 w-12 text-white" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-yellow-200" />
              </div>
            </div>
            <div className="text-left">
              <CardTitle className="text-xl font-bold mb-1">PREFEITURA MUNICIPAL DE</CardTitle>
              <CardTitle className="text-xl font-bold mb-2">PRESIDENTE GETÚLIO</CardTitle>
              <p className="text-yellow-100 text-sm font-medium">Sistema de Vistoria de Obras</p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <p className="text-white font-medium">
              {isLogin ? 'Acesso ao Sistema' : 'Cadastro de Usuário'}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-azul-escuro font-medium">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-azul-institucional/30 focus:border-azul-institucional"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="email" className="text-azul-escuro font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-azul-institucional/30 focus:border-azul-institucional"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-azul-escuro font-medium">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-azul-institucional/30 focus:border-azul-institucional"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-azul-institucional hover:bg-azul-escuro text-white shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Processando...' : (isLogin ? 'Entrar no Sistema' : 'Criar Conta')}
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              className="w-full text-azul-institucional hover:bg-blue-50"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border-l-4 border-l-azul-institucional">
            <p className="text-xs text-gray-600 text-center">
              <strong>Sistema Oficial</strong><br />
              Secretaria de Planejamento e Desenvolvimento Econômico<br />
              Prefeitura Municipal de Presidente Getúlio
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
