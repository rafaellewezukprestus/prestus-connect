import { useState } from 'react';
import { Plus, Pencil, Trash2, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User } from '@/types/auth';

const mockAttendants: User[] = [
  {
    id: '1',
    username: 'admin',
    role: 'Dev',
    name: 'Administrador',
    email: 'admin@prestuschat.com',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    username: 'joao.va',
    role: 'VA',
    name: 'João Silva',
    email: 'joao@prestuschat.com',
    isActive: true,
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    username: 'maria.supervisor',
    role: 'Supervisor',
    name: 'Maria Santos',
    email: 'maria@prestuschat.com',
    isActive: true,
    createdAt: '2024-01-03T00:00:00Z',
  },
];

const Attendants = () => {
  const [attendants, setAttendants] = useState<User[]>(mockAttendants);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAttendant, setEditingAttendant] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    role: 'VA' as 'VA' | 'Supervisor' | 'Dev',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAttendant) {
      // Update existing attendant
      setAttendants(prev =>
        prev.map(att =>
          att.id === editingAttendant.id
            ? { ...att, ...formData }
            : att
        )
      );
    } else {
      // Create new attendant
      const newAttendant: User = {
        id: Date.now().toString(),
        ...formData,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setAttendants(prev => [...prev, newAttendant]);
    }
    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAttendant(null);
    setFormData({
      username: '',
      name: '',
      email: '',
      role: 'VA',
    });
  };

  const handleEdit = (attendant: User) => {
    setEditingAttendant(attendant);
    setFormData({
      username: attendant.username,
      name: attendant.name,
      email: attendant.email,
      role: attendant.role,
    });
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    setAttendants(prev =>
      prev.map(att =>
        att.id === id ? { ...att, isActive: !att.isActive } : att
      )
    );
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'Dev': return 'default';
      case 'Supervisor': return 'secondary';
      case 'VA': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Atendentes</h1>
          <p className="text-muted-foreground">
            Gerencie os atendentes da plataforma
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Atendente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAttendant ? 'Editar Atendente' : 'Novo Atendente'}
              </DialogTitle>
              <DialogDescription>
                {editingAttendant 
                  ? 'Edite as informações do atendente'
                  : 'Adicione um novo atendente à plataforma'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Digite o nome de usuário"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite o nome completo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Digite o email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Cargo</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: 'VA' | 'Supervisor' | 'Dev') =>
                    setFormData(prev => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VA">VA (Virtual Assistant)</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="Dev">Dev (Developer)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingAttendant ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Atendentes</CardTitle>
          <CardDescription>
            {attendants.length} atendentes cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendants.map((attendant) => (
                <TableRow key={attendant.id}>
                  <TableCell className="font-medium">{attendant.name}</TableCell>
                  <TableCell>{attendant.username}</TableCell>
                  <TableCell>{attendant.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(attendant.role)}>
                      {attendant.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={attendant.isActive ? 'default' : 'secondary'}>
                      {attendant.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(attendant)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(attendant.id)}
                      >
                        {attendant.isActive ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendants;