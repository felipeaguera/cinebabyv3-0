import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import QRCodeViewer from '@/components/QRCodeViewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Upload, Play, Trash2, QrCode, Printer, User, Phone, Calendar, X } from 'lucide-react';
import { Patient, Video } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { videoStorage } from '@/utils/videoStorage';
import { isValidUUID, isLegacyId } from '@/utils/uuid';
import { supabase } from '@/utils/supabase';

const PatientDetail: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isQRViewerOpen, setIsQRViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('PatientDetail - Loading patient with ID:', patientId);
    loadPatientData();
    loadVideos();
  }, [patientId]);

  const loadPatientData = async () => {
    if (!patientId) {
      console.log('PatientDetail - No patientId provided');
      return;
    }
    
    try {
      // Buscar paciente no Supabase
      const { data: foundPatient, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) {
        console.error('PatientDetail - Error fetching patient:', error);
        // Fallback para localStorage se Supabase falhar
        const patients = JSON.parse(localStorage.getItem('cinebaby_patients') || '[]');
        const localPatient = patients.find((p: Patient) => p.id === patientId);
        
        if (localPatient) {
          // Converter para formato Supabase
          const convertedPatient = {
            ...localPatient,
            clinic_id: localPatient.clinicId || localPatient.clinic_id,
            created_at: localPatient.createdAt || localPatient.created_at
          };
          setPatient(convertedPatient);
        } else {
          navigate(user?.type === 'admin' ? '/admin' : '/clinic');
        }
        return;
      }

      if (foundPatient) {
        // Para admin users, permitir acesso a qualquer paciente
        // Para clinic users, permitir acesso apenas aos seus pacientes
        if (user?.type === 'admin' || foundPatient.clinic_id === user?.clinicId) {
          console.log('PatientDetail - User has access to patient');
          setPatient(foundPatient);
        } else {
          console.log('PatientDetail - User does not have access to patient');
          navigate('/clinic');
        }
      } else {
        console.log('PatientDetail - Patient not found, redirecting');
        navigate(user?.type === 'admin' ? '/admin' : '/clinic');
      }
    } catch (error) {
      console.error('PatientDetail - Error loading patient:', error);
      navigate(user?.type === 'admin' ? '/admin' : '/clinic');
    }
  };

  const loadVideos = async () => {
    if (!patientId) return;
    
    try {
      // Buscar vídeos no Supabase
      const { data: supabaseVideos, error } = await supabase
        .from('videos')
        .select('*')
        .eq('patient_id', patientId)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('PatientDetail - Error fetching videos from Supabase:', error);
        // Fallback para IndexedDB/localStorage
        const patientVideos = await videoStorage.getVideosByPatient(patientId);
        console.log('PatientDetail - Patient videos from IndexedDB:', patientVideos);
        setVideos(patientVideos);
        return;
      }

      console.log('PatientDetail - Patient videos from Supabase:', supabaseVideos);
      setVideos(supabaseVideos || []);
    } catch (error) {
      console.error('PatientDetail - Error loading videos:', error);
      // Fallback para IndexedDB se Supabase falhar
      try {
        const patientVideos = await videoStorage.getVideosByPatient(patientId);
        console.log('PatientDetail - Patient videos from IndexedDB:', patientVideos);
        setVideos(patientVideos);
      } catch (indexedError) {
        console.error('PatientDetail - Error loading videos from IndexedDB:', indexedError);
        // Fallback final para localStorage
        const allVideos = JSON.parse(localStorage.getItem('cinebaby_videos') || '[]');
        const patientVideos = allVideos.filter((v: Video) => v.patient_id === patientId || v.patientId === patientId);
        setVideos(patientVideos);
      }
    }
  };

  const handleVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !patientId) return;

    setUploading(true);

    try {
      const newVideo = {
        id: Date.now().toString(),
        patientId,
        fileName: selectedFile.name,
        file: selectedFile,
        uploadedAt: new Date().toISOString()
      };

      await videoStorage.saveVideo(newVideo);
      
      // Reload videos
      await loadVideos();
      
      setSelectedFile(null);
      setIsUploadDialogOpen(false);
      
      toast({
        title: "Vídeo enviado!",
        description: "O vídeo foi adicionado com sucesso usando armazenamento otimizado.",
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer upload do vídeo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) return;

    try {
      // Delete from IndexedDB
      await videoStorage.deleteVideo(videoId);
      
      // Also remove from localStorage as fallback cleanup
      const allVideos = JSON.parse(localStorage.getItem('cinebaby_videos') || '[]');
      const updatedVideos = allVideos.filter((v: Video) => v.id !== videoId);
      localStorage.setItem('cinebaby_videos', JSON.stringify(updatedVideos));
      
      console.log(`Video ${videoId} permanently deleted from all storage`);
      
      // Reload videos
      await loadVideos();
      
      toast({
        title: "Vídeo excluído!",
        description: "O vídeo foi removido permanentemente de todos os locais de armazenamento.",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o vídeo. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handlePlayVideo = (video: Video) => {
    console.log('Playing video:', video.fileName, 'URL:', video.fileUrl);
    setSelectedVideo(video);
    setIsVideoPlayerOpen(true);
  };

  const generateQRCode = () => {
    if (!patient) return;
    
    // Garantir que usamos o ID real da paciente
    const patientId = patient.id;
    
    // Verificar se o ID é válido (UUID ou ID legado)
    const isValidId = isValidUUID(patientId) || isLegacyId(patientId);
    
    if (!isValidId) {
      console.error('PatientDetail - Invalid ID format:', patientId);
      toast({
        title: "Erro no QR Code",
        description: "ID da paciente inválido. Por favor, verifique os dados da paciente.",
        variant: "destructive"
      });
      return;
    }
    
    const baseUrl = window.location.origin;
    const qrUrl = `${baseUrl}/paciente/${patientId}`;
    
    console.log('PatientDetail - Patient ID:', patientId);
    console.log('PatientDetail - ID Type:', isValidUUID(patientId) ? 'UUID' : 'Legacy');
    console.log('PatientDetail - Generating QR Code for URL:', qrUrl);
    
    // Atualizar o paciente com o QR Code URL
    const updatedPatient = { ...patient, qrCode: qrUrl };
    
    setPatient(updatedPatient);
    setIsQRViewerOpen(true);
    
    toast({
      title: "QR Code gerado!",
      description: `Link criado: /paciente/${patientId}`,
    });
  };

  const printQRCard = () => {
    if (!patient) return;
    
    const patientId = patient.id;
    
    // Verificar se o ID é válido
    const isValidId = isValidUUID(patientId) || isLegacyId(patientId);
    
    if (!isValidId) {
      toast({
        title: "Erro na impressão",
        description: "ID da paciente inválido para impressão do cartão.",
        variant: "destructive"
      });
      return;
    }
    
    // Generate QR code URL usando o ID real da paciente
    const patientVideoUrl = `${window.location.origin}/paciente/${patientId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(patientVideoUrl)}`;
    
    console.log('PatientDetail - Printing QR Card for patient ID:', patientId);
    console.log('PatientDetail - QR Card URL:', patientVideoUrl);
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <html>
        <head>
          <title>Cartão QR Code - ${patient.name}</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: Arial, sans-serif; text-align: center; padding: 40px; margin: 0; }
            .card { max-width: 400px; margin: 0 auto; padding: 40px; border: 2px solid #7B529F; border-radius: 20px; }
            .logo { width: 120px; margin-bottom: 30px; }
            .qr-code { 
              width: 200px; 
              height: 200px; 
              margin: 30px auto; 
              border: 1px solid #ddd; 
              display: block;
              border-radius: 8px;
            }
            .patient-name { font-size: 24px; font-weight: bold; color: #7B529F; margin: 20px 0; }
            .clinic-name { font-size: 18px; color: #5FC6C8; margin: 10px 0; }
            .message { font-size: 16px; color: #666; margin: 30px 0; font-style: italic; line-height: 1.4; }
            .patient-info { font-size: 14px; color: #888; margin: 15px 0; }
            .patient-id { font-size: 12px; color: #999; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="card">
            <img src="/lovable-uploads/6bd58522-32f8-48b7-bbe7-999d3463508c.png" alt="CineBaby" class="logo">
            <div class="patient-name">${patient.name}</div>
            <div class="clinic-name">Clínica CineBaby</div>
            <div class="patient-info">Telefone: ${patient.phone}</div>
            <div class="patient-id">ID: ${patient.id}</div>
            <img src="${qrCodeUrl}" alt="QR Code para ${patient.name}" class="qr-code" />
            <div class="message">
              "Reviva esse momento mágico sempre que quiser. Ver seu bebê antes do nascimento é um carinho que emociona para sempre."
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for the image to load before printing
    setTimeout(() => {
      printWindow.print();
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBackPath = () => {
    if (user?.type === 'admin') {
      return patient ? `/admin/clinic/${patient.clinic_id}` : '/admin';
    }
    return '/clinic';
  };

  if (!patient) {
    return (
      <Layout title="Paciente não encontrado">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Paciente não encontrado ou você não tem permissão para visualizá-lo.</p>
          <p className="text-sm text-gray-500 mb-4">ID procurado: {patientId}</p>
          <Button onClick={() => navigate(getBackPath())}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Detalhes da Paciente">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate(getBackPath())}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {user?.type === 'admin' ? 'Voltar para Clínica' : 'Voltar para Lista'}
          </Button>
          
          <div className="flex gap-2">
            <Button
              onClick={generateQRCode}
              variant="outline"
              className="text-cinebaby-purple border-cinebaby-purple hover:bg-cinebaby-purple hover:text-white"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Gerar QR Code
            </Button>
            
            {patient.qrCode && (
              <Button
                onClick={printQRCard}
                className="bg-cinebaby-gradient hover:opacity-90"
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Cartão
              </Button>
            )}
          </div>
        </div>

        {/* Informações da Paciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-cinebaby-purple" />
              Informações da Paciente
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center text-gray-600">
              <User className="h-4 w-4 mr-2" />
              <span className="font-medium">{patient.name}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <span>{patient.phone}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Cadastrada em {formatDate(patient.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Upload de Vídeo */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Vídeos de Ultrassom ({videos.length})</CardTitle>
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-cinebaby-gradient hover:opacity-90">
                    <Upload className="h-4 w-4 mr-2" />
                    Adicionar Vídeo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload de Vídeo</DialogTitle>
                    <DialogDescription>
                      Selecione o vídeo do ultrassom para fazer o upload. Agora suporta arquivos maiores!
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleVideoUpload} className="space-y-4">
                    <div>
                      <Label htmlFor="video">Arquivo de Vídeo</Label>
                      <Input
                        id="video"
                        type="file"
                        accept="video/*"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        required
                        disabled={uploading}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-cinebaby-gradient hover:opacity-90"
                      disabled={uploading}
                    >
                      {uploading ? 'Enviando...' : 'Fazer Upload'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {videos.length === 0 ? (
              <div className="text-center py-8">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Nenhum vídeo adicionado ainda</p>
                <p className="text-sm text-gray-500">Clique em "Adicionar Vídeo" para fazer o primeiro upload</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {videos.map((video) => (
                  <Card key={video.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                        {video.fileUrl ? (
                          <video 
                            src={video.fileUrl} 
                            className="w-full h-full object-cover"
                            poster=""
                            preload="metadata"
                          />
                        ) : (
                          <Play className="h-8 w-8 text-gray-400" />
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <h4 className="font-medium text-sm mb-2 truncate" title={video.fileName}>
                        {video.fileName}
                      </h4>
                      <p className="text-xs text-gray-500 mb-3">
                        {formatDate(video.uploadedAt)}
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handlePlayVideo(video)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteVideo(video.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Video Player Dialog */}
        <Dialog open={isVideoPlayerOpen} onOpenChange={setIsVideoPlayerOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{selectedVideo?.fileName}</DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVideoPlayerOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <DialogDescription>
                Vídeo de ultrassom - {selectedVideo && formatDate(selectedVideo.uploadedAt)}
              </DialogDescription>
            </DialogHeader>
            
            {selectedVideo && (
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video 
                  src={selectedVideo.fileUrl} 
                  controls 
                  autoPlay
                  className="w-full h-full"
                  preload="metadata"
                  onLoadStart={() => console.log('Video loading started')}
                  onCanPlay={() => console.log('Video can play')}
                  onError={(e) => {
                    console.error('Video error:', e);
                    console.error('Video URL that failed:', selectedVideo.fileUrl);
                  }}
                  onLoadedData={() => console.log('Video data loaded')}
                >
                  Seu navegador não suporta a reprodução de vídeo.
                </video>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* QR Code Viewer Dialog */}
        <QRCodeViewer
          patient={patient}
          isOpen={isQRViewerOpen}
          onClose={() => setIsQRViewerOpen(false)}
        />
      </div>
    </Layout>
  );
};

export default PatientDetail;
