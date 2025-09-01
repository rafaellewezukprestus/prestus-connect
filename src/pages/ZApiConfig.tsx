import { useState } from 'react';
import { Plus, Trash2, Settings, Zap, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { ZApiInstance } from '@/types/zapi';

const ZApiConfig = () => {
  const { toast } = useToast();
  const [instances, setInstances] = useState<ZApiInstance[]>([
    {
      id: '1',
      name: '1784_Prestus_Edvaldo',
      instanceId: '3DC6C526777550415408E2D55401DB6C',
      token: 'AE844333DA63B96A2EC8A8DD',
      apiUrl: 'https://api.z-api.io/instances/3DC6C526777550415408E2D55401DB6C/token/AE844333DA63B96A2EC8A8DD',
      status: 'connected',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstance, setEditingInstance] = useState<ZApiInstance | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    instanceId: '',
    token: ''
  });

  const handleSave = () => {
    if (!formData.name || !formData.instanceId || !formData.token) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const apiUrl = `https://api.z-api.io/instances/${formData.instanceId}/token/${formData.token}`;
    
    if (editingInstance) {
      setInstances(prev => prev.map(instance => 
        instance.id === editingInstance.id 
          ? { ...instance, ...formData, apiUrl }
          : instance
      ));
      toast({
        title: "Sucesso",
        description: "Instância atualizada com sucesso",
      });
    } else {
      const newInstance: ZApiInstance = {
        id: Date.now().toString(),
        ...formData,
        apiUrl,
        status: 'disconnected',
        createdAt: new Date().toISOString()
      };
      setInstances(prev => [...prev, newInstance]);
      toast({
        title: "Sucesso",
        description: "Nova instância criada com sucesso",
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', instanceId: '', token: '' });
    setEditingInstance(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (instance: ZApiInstance) => {
    setEditingInstance(instance);
    setFormData({
      name: instance.name,
      instanceId: instance.instanceId,
      token: instance.token
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setInstances(prev => prev.filter(instance => instance.id !== id));
    toast({
      title: "Sucesso",
      description: "Instância removida com sucesso",
    });
  };

  const testConnection = async (instance: ZApiInstance) => {
    try {
      const response = await fetch(`${instance.apiUrl}/status`, {
        method: 'GET',
        headers: {
          'Client-Token': 'F2e0ebe652cf34d9fac78d245d3f17718S'
        }
      });

      if (response.ok) {
        setInstances(prev => prev.map(inst => 
          inst.id === instance.id 
            ? { ...inst, status: 'connected', lastActivity: new Date().toISOString() }
            : inst
        ));
        toast({
          title: "Conexão bem-sucedida",
          description: `Instância ${instance.name} está conectada`,
        });
      } else {
        throw new Error('Falha na conexão');
      }
    } catch (error) {
      setInstances(prev => prev.map(inst => 
        inst.id === instance.id 
          ? { ...inst, status: 'error' }
          : inst
      ));
      toast({
        title: "Erro de conexão",
        description: `Não foi possível conectar com ${instance.name}`,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: ZApiInstance['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: ZApiInstance['status']) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-success text-success-foreground">Conectada</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="secondary">Desconectada</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuração Z-API</h1>
          <p className="text-muted-foreground">
            Gerencie suas instâncias do Z-API para recebimento de mensagens
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Instância
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingInstance ? 'Editar' : 'Nova'} Instância Z-API
              </DialogTitle>
              <DialogDescription>
                Configure os dados da instância para conectar com o Z-API
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Instância</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: 1784_Prestus_Edvaldo"
                />
              </div>
              <div>
                <Label htmlFor="instanceId">ID da Instância</Label>
                <Input
                  id="instanceId"
                  value={formData.instanceId}
                  onChange={(e) => setFormData(prev => ({ ...prev, instanceId: e.target.value }))}
                  placeholder="Ex: 3DC6C526777550415408E2D55401DB6C"
                />
              </div>
              <div>
                <Label htmlFor="token">Token da Instância</Label>
                <Input
                  id="token"
                  value={formData.token}
                  onChange={(e) => setFormData(prev => ({ ...prev, token: e.target.value }))}
                  placeholder="Ex: AE844333DA63B96A2EC8A8DD"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  {editingInstance ? 'Salvar' : 'Criar'} Instância
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {instances.map((instance) => (
          <Card key={instance.id} className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{instance.name}</CardTitle>
                    <CardDescription>
                      ID: {instance.instanceId}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(instance.status)}
                  {getStatusBadge(instance.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">URL da API</Label>
                  <p className="text-sm text-muted-foreground font-mono break-all">
                    {instance.apiUrl}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Última Atividade</Label>
                  <p className="text-sm text-muted-foreground">
                    {instance.lastActivity 
                      ? new Date(instance.lastActivity).toLocaleString('pt-BR')
                      : 'Nunca'
                    }
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testConnection(instance)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Testar Conexão
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(instance)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(instance.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {instances.length === 0 && (
          <Card className="shadow-sm">
            <CardContent className="text-center py-12">
              <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma instância configurada</h3>
              <p className="text-muted-foreground mb-4">
                Adicione sua primeira instância Z-API para começar a receber mensagens
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => resetForm()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Instância
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ZApiConfig;