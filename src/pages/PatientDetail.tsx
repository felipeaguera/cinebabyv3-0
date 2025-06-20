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
  const { toast } = useToast();

  useEffect(() => {
    console.log('PatientDetail - Loading patient with ID:', patientId);
    loadPatientData();
    loadVideos();
  }, [patientId]);

  const loadPatientData = () => {
    if (!patientId) {
      console.log('PatientDetail - No patientId provided');
      return;
    }
    
    const patients = JSON.parse(localStorage.getItem('cinebaby_patients') || '[]');
    console.log('PatientDetail - All patients in localStorage:', patients);
    console.log('PatientDetail - Looking for patient with ID:', patientId);
    
    const foundPatient = patients.find((p: Patient) => p.id === patientId);
    console.log('PatientDetail - Found patient:', foundPatient);
    
    if (foundPatient) {
      // For admin users, allow access to any patient
      // For clinic users, only allow access to their own patients
      if (user?.type === 'admin' || foundPatient.clinicId === user?.clinicId) {
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
  };

  const loadVideos = () => {
    if (!patientId) return;
    
    const allVideos = JSON.parse(localStorage.getItem('cinebaby_videos') || '[]');
    console.log('PatientDetail - All videos in localStorage:', allVideos);
    const patientVideos = allVideos.filter((v: Video) => v.patientId === patientId);
    console.log('PatientDetail - Patient videos:', patientVideos);
    setVideos(patientVideos);
  };

  const handleVideoUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !patientId) return;

    // Create a blob URL for the video file
    const videoUrl = URL.createObjectURL(selectedFile);

    const newVideo: Video = {
      id: Date.now().toString(),
      patientId,
      fileName: selectedFile.name,
      fileUrl: videoUrl,
      uploadedAt: new Date().toISOString()
    };

    const allVideos = JSON.parse(localStorage.getItem('cinebaby_videos') || '[]');
    const updatedVideos = [...allVideos, newVideo];
    localStorage.setItem('cinebaby_videos', JSON.stringify(updatedVideos));

    setVideos([...videos, newVideo]);
    setSelectedFile(null);
    setIsUploadDialogOpen(false);
    
    toast({
      title: "Vídeo enviado!",
      description: "O vídeo foi adicionado com sucesso.",
    });
  };

  const handleDeleteVideo = (videoId: string) => {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) return;

    const allVideos = JSON.parse(localStorage.getItem('cinebaby_videos') || '[]');
    const updatedVideos = allVideos.filter((v: Video) => v.id !== videoId);
    localStorage.setItem('cinebaby_videos', JSON.stringify(updatedVideos));

    setVideos(videos.filter(v => v.id !== videoId));
    
    toast({
      title: "Vídeo excluído!",
      description: "O vídeo foi removido com sucesso.",
      variant: "destructive"
    });
  };

  const handlePlayVideo = (video: Video) => {
    console.log('Playing video:', video.fileName, 'URL:', video.fileUrl);
    setSelectedVideo(video);
    setIsVideoPlayerOpen(true);
  };

  const generateQRCode = () => {
    if (!patient) return;
    
    const qrUrl = `${window.location.origin}/patient/${patient.id}/videos`;
    
    // Simular geração de QR Code (em produção, usaria uma biblioteca real)
    const updatedPatient = { ...patient, qrCode: qrUrl };
    
    const allPatients = JSON.parse(localStorage.getItem('cinebaby_patients') || '[]');
    const updatedPatients = allPatients.map((p: Patient) => 
      p.id === patient.id ? updatedPatient : p
    );
    localStorage.setItem('cinebaby_patients', JSON.stringify(updatedPatients));
    
    setPatient(updatedPatient);
    setIsQRViewerOpen(true);
    
    toast({
      title: "QR Code gerado!",
      description: "O QR Code foi criado com sucesso.",
    });
  };

  const printQRCard = () => {
    if (!patient) return;
    
    // Generate QR code URL if not already present
    const qrCodeUrl = patient.qrCode 
      ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(patient.qrCode)}`
      : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/patient/${patient.id}/videos`)}`;
    
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
          </style>
        </head>
        <body>
          <div class="card">
            <img src="/lovable-uploads/6bd58522-32f8-48b7-bbe7-999d3463508c.png" alt="CineBaby" class="logo">
            <div class="patient-name">${patient.name}</div>
            <div class="clinic-name">Clínica CineBaby</div>
            <div class="patient-info">Telefone: ${patient.phone}</div>
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
      return patient ? `/admin/clinic/${patient.clinicId}` : '/admin';
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
                      Selecione o vídeo do ultrassom para fazer o upload
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
                      />
                    </div>
                    
                    <Button type="submit" className="w-full bg-cinebaby-gradient hover:opacity-90">
                      Fazer Upload
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
                  key={selectedVideo.id}
                  src={selectedVideo.fileUrl} 
                  controls 
                  autoPlay
                  className="w-full h-full"
                  preload="metadata"
                  onLoadStart={() => console.log('Video loading started')}
                  onCanPlay={() => console.log('Video can play')}
                  onError={(e) => console.error('Video error:', e)}
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
