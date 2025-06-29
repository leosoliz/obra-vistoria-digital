
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useVistorias } from '@/hooks/useVistorias';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Building, Plus, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const VistoriasList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { vistorias, isLoading } = useVistorias();

  const handleLogout = async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'finalizado':
        return 'bg-green-100 text-green-800';
      case 'rascunho':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Minhas Vistorias
              </h1>
              <p className="text-gray-600 mt-1">
                Bem-vindo, {user?.email}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Vistoria
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {vistorias.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma vistoria encontrada
              </h3>
              <p className="text-gray-600 mb-6">
                Você ainda não criou nenhuma vistoria. Comece criando sua primeira vistoria.
              </p>
              <Button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Vistoria
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vistorias.map((vistoria) => (
              <Card key={vistoria.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">
                      {vistoria.nome_obra}
                    </CardTitle>
                    <Badge className={getStatusColor(vistoria.status)}>
                      {vistoria.status === 'finalizado' ? 'Finalizado' : 'Rascunho'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600 line-clamp-2">
                      {vistoria.localizacao}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formatDate(vistoria.data_vistoria)}
                    </span>
                  </div>

                  {vistoria.empresa_responsavel && (
                    <div className="flex items-start gap-2">
                      <Building className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-gray-500 line-clamp-1">
                        {vistoria.empresa_responsavel}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 text-xs text-gray-400">
                    Criado em {formatDate(vistoria.created_at)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VistoriasList;
