
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { Clinic } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CreateClinicDialogProps {
  clinics: Clinic[];
  setClinics: (clinics: Clinic[]) => void;
}

const CreateClinicDialog: React.FC<CreateClinicDialogProps> = ({ clinics, setClinics }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    email: '',
    password: ''
  });
  const { toast } = useToast();

  const handleCreateClinic = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newClinic: Clinic = {
      id: Date.now().toString(),
      ...formData,
      created_at: new Date().toISOString()
    };

    const updatedClinics = [...clinics, newClinic];
    setClinics(updatedClinics);
    localStorage.setItem('cinebaby_clinics', JSON.stringify(updatedClinics));

    setFormData({ name: '', address: '', city: '', email: '', password: '' });
    setIsDialogOpen(false);
    
    toast({
      title: "Clínica cadastrada!",
      description: `${newClinic.name} foi cadastrada com sucesso.`,
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-cinebaby-gradient hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Nova Clínica
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastrar Nova Clínica</DialogTitle>
          <DialogDescription>
            Preencha os dados da clínica para criar uma nova conta
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleCreateClinic} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Clínica</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email de Login</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>
          
          <Button type="submit" className="w-full bg-cinebaby-gradient hover:opacity-90">
            Cadastrar Clínica
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClinicDialog;
