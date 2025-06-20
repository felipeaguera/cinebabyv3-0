
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, Search, User, Phone, Calendar, Eye, Video } from 'lucide-react';
import { Patient, Video as VideoType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import ClinicExamsTab from '@/components/ClinicExamsTab';

const ClinicDashboard: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadPatients();
    loadVideos();
  }, [user]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients(patients);
    }
  }, [searchTerm, patients]);

  const loadPatients = () => {
    if (!user?.clinicId) return;
    
    const stored = localStorage.getItem('cinebaby_patients');
    if (stored) {
      const allPatients = JSON.parse(stored);
      const clinicPatients = allPatients.filter((p: Patient) => p.clinic_id === user.clinicId);
      setPatients(clinicPatients);
      setFilteredPatients(clinicPatients);
    }
  };

  const loadVideos = () => {
    const stored = localStorage.getItem('cinebaby_videos');
    if (stored) {
      setVideos(JSON.parse(stored));
    }
  };

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.clinicId) return;

    const newPatient: Patient = {
      id: Date.now().toString(),
      name: formData.name,
      phone: formData.phone,
      clinic_id: user.clinicId,
      created_at: new Date().toISOString()
    };

    const allPatients = JSON.parse(localStorage.getItem('cinebaby_patients') || '[]');
    const updatedPatients = [...allPatients, newPatient];
    localStorage.setItem('cinebaby_patients', JSON.stringify(updatedPatients));

    setPatients([...patients, newPatient]);
    setFormData({ name: '', phone: '' });
    setIsDialogOpen(false);
    
    toast({
      title: "Paciente cadastrada!",
      description: `${newPatient.name} foi cadastrada com sucesso.`,
    });
  };

  const handlePatientClick = (patientId: string) => {
    navigate(`/patient/${patientId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPatientVideoCount = (patientId: string) => {
    return videos.filter((v: VideoType) => v.patient_id === patientId).length;
  };

  return (
    <Layout title="Painel da Clínica">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Painel da Clínica</h2>
            <p className="text-gray-600">Gerencie suas pacientes e visualize os exames realizados</p>
          </div>
        </div>

        <Tabs defaultValue="patients" className="space-y-4">
          <TabsList>
            <TabsTrigger value="patients">Pacientes</TabsTrigger>
            <TabsTrigger value="exams">Exames Realizados</TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-cinebaby-gradient hover:opacity-90">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Paciente
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Nova Paciente</DialogTitle>
                    <DialogDescription>
                      Preencha os dados da paciente para começar
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleCreatePatient} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Maria Silva"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Ex: (11) 99999-9999"
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full bg-cinebaby-gradient hover:opacity-90">
                      Cadastrar Paciente
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Patients Table */}
            {filteredPatients.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm ? 'Nenhuma paciente encontrada' : 'Nenhuma paciente cadastrada'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm 
                      ? 'Tente ajustar sua busca ou cadastre uma nova paciente'
                      : 'Comece cadastrando a primeira paciente'
                    }
                  </p>
                  {!searchTerm && (
                    <Button 
                      onClick={() => setIsDialogOpen(true)}
                      className="bg-cinebaby-gradient hover:opacity-90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Primeira Paciente
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-cinebaby-purple" />
                    Lista de Pacientes ({filteredPatients.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Vídeos</TableHead>
                        <TableHead>Cadastro</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.map((patient) => (
                        <TableRow key={patient.id} className="cursor-pointer hover:bg-gray-50">
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-cinebaby-purple" />
                              {patient.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-gray-400" />
                              {patient.phone}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Video className="h-4 w-4 mr-2 text-cinebaby-turquoise" />
                              {getPatientVideoCount(patient.id)} vídeo(s)
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              {formatDate(patient.created_at)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => handlePatientClick(patient.id)}
                              className="bg-cinebaby-gradient hover:opacity-90"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="exams" className="space-y-6">
            <ClinicExamsTab
              videos={videos}
              setVideos={setVideos}
              patients={patients}
              clinicId={user?.clinicId || ''}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ClinicDashboard;
