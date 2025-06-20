import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Upload, Video as VideoIcon, X, Play, Download, Trash2, ArrowLeft, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import QRCodeViewer from '@/components/QRCodeViewer';
import { Patient, Video, VideoData } from '@/types';
import { videoStorage } from '@/utils/videoStorage';
import { supabase } from '@/utils/supabase';

interface PatientDetailParams {
  patientId: string;
}

const PatientDetail: React.FC = () => {
  const { patientId } = useParams<PatientDetailParams>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (patientId) {
      loadPatientData();
      loadVideos();
    }
  }, [patientId]);

  const loadPatientData = async () => {
    // Try Supabase first
    try {
      const { data: supabasePatient, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (supabasePatient && !error) {
        setPatient(supabasePatient);
        return;
      }
    } catch (error) {
      console.log('Supabase not available, using localStorage');
    }

    // Fallback to localStorage
    try {
      const patients = JSON.parse(localStorage.getItem('cinebaby_patients') || '[]');
      const foundPatient = patients.find((p: Patient) => p.id === patientId);
      if (foundPatient) {
        setPatient(foundPatient);
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
    }
  };

  const loadVideos = async () => {
    if (!patientId) return;
    
    try {
      // Try IndexedDB first
      const patientVideos = await videoStorage.getVideosByPatient(patientId);
      
      // Convert VideoData to Video format, filtering out incomplete entries
      const validVideos: Video[] = patientVideos
        .filter((video: VideoData) => video.file_url && video.file_url.trim() !== '')
        .map((video: VideoData) => ({
          id: video.id,
          patient_id: video.patient_id,
          file_name: video.file_name,
          file_url: video.file_url!,
          uploaded_at: video.uploaded_at
        }));
      
      setVideos(validVideos);
    } catch (error) {
      console.error('Error loading videos from IndexedDB:', error);
      
      // Fallback to localStorage
      try {
        const allVideos = JSON.parse(localStorage.getItem('cinebaby_videos') || '[]');
        const patientVideos = allVideos.filter((v: any) => v.patient_id === patientId);
        
        // Convert to Video format, filtering out incomplete entries
        const validVideos: Video[] = patientVideos
          .filter((video: any) => video.file_url && video.file_url.trim() !== '')
          .map((video: any) => ({
            id: video.id,
            patient_id: video.patient_id,
            file_name: video.file_name,
            file_url: video.file_url,
            uploaded_at: video.uploaded_at
          }));
        
        setVideos(validVideos);
      } catch (localStorageError) {
        console.error('Error loading videos from localStorage:', localStorageError);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !patient) return;

    setUploading(true);
    setUploadError('');

    try {
      const videoData: VideoData = {
        id: Date.now().toString(),
        patient_id: patient.id,
        file_name: file.name,
        file: file,
        uploaded_at: new Date().toISOString()
      };

      await videoStorage.saveVideo(videoData);
      
      // Reload videos to show the new upload
      await loadVideos();
      
      toast({
        title: "Upload realizado com sucesso!",
        description: `O vídeo ${file.name} foi salvo.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Erro ao fazer upload do vídeo. Tente novamente.');
      toast({
        title: "Erro no upload",
        description: "Não foi possível salvar o vídeo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video);
    setIsVideoPlayerOpen(true);
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      await videoStorage.deleteVideo(videoId);
      await loadVideos();
      toast({
        title: "Vídeo excluído",
        description: "O vídeo foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o vídeo.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadVideo = (video: Video) => {
    const link = document.createElement('a');
    link.href = video.file_url;
    link.download = video.file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  if (!patient) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Paciente não encontrada</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
              <p className="text-sm text-gray-600">{patient.phone}</p>
              <p className="text-xs text-gray-500">Criada em: {formatDate(patient.created_at)}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => setIsQRCodeOpen(true)}
              variant="outline"
              size="sm"
            >
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </Button>
          </div>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload de Vídeos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="flex-1"
                />
                <Button disabled={uploading}>
                  {uploading ? 'Enviando...' : 'Selecionar Vídeo'}
                </Button>
              </div>
              
              {uploadError && (
                <p className="text-sm text-red-600">{uploadError}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Videos List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <VideoIcon className="h-5 w-5 mr-2" />
              Vídeos ({videos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {videos.length === 0 ? (
              <div className="text-center py-8">
                <VideoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum vídeo encontrado</p>
                <p className="text-sm text-gray-400">Faça upload do primeiro vídeo acima</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {videos.map((video) => (
                  <Card key={video.id} className="overflow-hidden">
                    <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => handlePlayVideo(video)}
                        className="absolute inset-0 w-full h-full flex items-center justify-center hover:bg-black/10"
                      >
                        <Play className="h-12 w-12 text-gray-600" />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-sm mb-2 truncate" title={video.file_name}>
                        {video.file_name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-3">
                        {formatDate(video.uploaded_at)}
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadVideo(video)}
                          className="flex-1"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
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
      </div>

      {/* Video Player Dialog */}
      <Dialog open={isVideoPlayerOpen} onOpenChange={setIsVideoPlayerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Reproduzir Vídeo</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVideoPlayerOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              {selectedVideo && formatDate(selectedVideo.uploaded_at)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVideo && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video 
                src={selectedVideo.file_url} 
                controls 
                autoPlay
                className="w-full h-full"
                preload="metadata"
              >
                Seu navegador não suporta a reprodução de vídeo.
              </video>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <QRCodeViewer
        patient={patient}
        isOpen={isQRCodeOpen}
        onClose={() => setIsQRCodeOpen(false)}
      />
    </Layout>
  );
};

export default PatientDetail;
