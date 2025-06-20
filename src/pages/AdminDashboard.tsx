
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Building2, MapPin, Mail, Trash2, Users, Video } from 'lucide-react';
import { Clinic, Patient, Video as VideoType } from '@/types';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    email: '',
    password: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadClinics();
  }, []);

  const loadClinics = () => {
    const stored = localStorage.getItem('cinebaby_clinics');
    if (stored) {
      setClinics(JSON.parse(stored));
    }
  };

  const handleCreateClinic = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newClinic: Clinic = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString()
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

  const handleDeleteClinic = (clinicId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta clínica? Todos os dados serão permanentemente perdidos.')) {
      return;
    }

    // Remove clinic
    const updatedClinics = clinics.filter(c => c.id !== clinicId);
    setClinics(updatedClinics);
    localStorage.setItem('cinebaby_clinics', JSON.stringify(updatedClinics));

    // Remove related patients and videos
    const patients = JSON.parse(localStorage.getItem('cinebaby_patients') || '[]');
    const videos = JSON.parse(localStorage.getItem('cinebaby_videos') || '[]');
    
    const clinicPatients = patients.filter((p: Patient) => p.clinicId === clinicId);
    const patientIds = clinicPatients.map((p: Patient) => p.id);
    
    const filteredPatients = patients.filter((p: Patient) => p.clinicId !== clinicId);
    const filteredVideos = videos.filter((v: VideoType) => !patientIds.includes(v.patientId));
    
    localStorage.setItem('cinebaby_patients', JSON.stringify(filteredPatients));
    localStorage.setItem('cinebaby_videos', JSON.stringify(filteredVideos));

    toast({
      title: "Clínica excluída!",
      description: "A clínica e todos os dados relacionados foram removidos.",
      variant: "destructive"
    });
  };

  const getClinicStats = (clinicId: string) => {
    const patients = JSON.parse(localStorage.getItem('cinebaby_patients') || '[]');
    const videos = JSON.parse(localStorage.getItem('cinebaby_videos') || '[]');
    
    const clinicPatients = patients.filter((p: Patient) => p.clinicId === clinicId);
    const patientIds = clinicPatients.map((p: Patient) => p.id);
    const clinicVideos = videos.filter((v: VideoType) => patientIds.includes(v.patientId));
    
    return {
      patientsCount: clinicPatients.length,
      videosCount: clinicVideos.length
    };
  };

  return (
    <Layout title="Painel Administrativo">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gerenciar Clínicas</h2>
            <p className="text-gray-600">Cadastre e gerencie as clínicas da plataforma</p>
          </div>
          
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
        </div>

        {clinics.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma clínica cadastrada</h3>
              <p className="text-gray-600 mb-4">Comece cadastrando a primeira clínica da plataforma</p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-cinebaby-gradient hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeira Clínica
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clinics.map((clinic) => {
              const stats = getClinicStats(clinic.id);
              return (
                <Card key={clinic.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-5 w-5 text-cinebaby-purple" />
                        <CardTitle className="text-lg">{clinic.name}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClinic(clinic.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {clinic.address}, {clinic.city}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {clinic.email}
                    </div>
                    
                    <div className="flex justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        {stats.patientsCount} pacientes
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Video className="h-4 w-4 mr-1" />
                        {stats.videosCount} vídeos
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
