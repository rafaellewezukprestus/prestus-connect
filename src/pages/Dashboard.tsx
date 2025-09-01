import { Users, MessageSquare, Zap, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Dashboard = () => {
  const stats = [
    {
      title: 'Atendentes Ativos',
      value: '12',
      description: '3 VAs, 2 Supervisores, 1 Dev',
      icon: Users,
      color: 'text-primary',
    },
    {
      title: 'Chats em Andamento',
      value: '47',
      description: '+12% desde ontem',
      icon: MessageSquare,
      color: 'text-success',
    },
    {
      title: 'Instâncias Z-API',
      value: '5',
      description: 'Todas conectadas',
      icon: Zap,
      color: 'text-warning',
    },
    {
      title: 'Chats Resolvidos Hoje',
      value: '234',
      description: '+18% desde ontem',
      icon: TrendingUp,
      color: 'text-success',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral da plataforma de atendimento
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Últimas ações na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 text-sm">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium">Chat #1234 atribuído a João (VA)</p>
                <p className="text-muted-foreground">Há 2 minutos</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium">Nova instância Z-API configurada</p>
                <p className="text-muted-foreground">Há 15 minutos</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <div className="flex-1">
                <p className="font-medium">Atendente Maria adicionada</p>
                <p className="text-muted-foreground">Há 1 hora</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>
              Monitoramento em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Servidor Principal</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm text-success">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Z-API Gateway</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm text-success">Conectado</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Base de Dados</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm text-success">Operacional</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;