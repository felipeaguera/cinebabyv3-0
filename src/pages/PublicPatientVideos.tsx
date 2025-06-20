
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, Heart, X, Smartphone } from 'lucide-react';
import { Patient, Video } from '@/types';
import { videoStorage } from '@/utils/videoStorage';

const PublicPatientVideos: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('PublicPatientVideos - patientId from URL:', patientId);
    if (patientId) {
      loadPatientData();
      loadVideos();
    }
    setLoading(false);
  }, [patientId]);

  const loadPatientData = () => {
    if (!patientId) {
      console.log('PublicPatientVideos - No patientId provided');
      return;
    }
    
    try {
      const patients = JSON.parse(localStorage.getItem('cinebaby_patients') || '[]');
      console.log('PublicPatientVideos - All patients in localStorage:', patients);
      console.log('PublicPatientVideos - Looking for patient with ID:', patientId, 'Type:', typeof patientId);
      
      // Buscar paciente por ID exato - melhorar a comparação
      const foundPatient = patients.find((p: Patient) => {
        const patientIdStr = String(p.id);
        const searchIdStr = String(patientId);
        const matches = patientIdStr === searchIdStr;
        
        console.log(`PublicPatientVideos - Comparing patient ID "${patientIdStr}" with search ID "${searchIdStr}": ${matches}`);
        
        if (matches) {
          console.log('PublicPatientVideos - Found matching patient:', p);
        }
        return matches;
      });
      
      console.log('PublicPatientVideos - Final found patient:', foundPatient);
      
      if (foundPatient) {
        setPatient(foundPatient);
      } else {
        console.log('PublicPatientVideos - Patient not found in localStorage');
        console.log('PublicPatientVideos - Available patient IDs:', patients.map((p: Patient) => ({ id: p.id, type: typeof p.id, name: p.name })));
      }
    } catch (error) {
      console.error('PublicPatientVideos - Error loading patient data:', error);
    }
  };

  const loadVideos = async () => {
    if (!patientId) return;
    
    try {
      console.log('PublicPatientVideos - Loading videos for patient ID:', patientId);
      
      // Try IndexedDB first
      const patientVideos = await videoStorage.getVideosByPatient(patientId);
      console.log('PublicPatientVideos - Patient videos from IndexedDB:', patientVideos);
      
      // Filter valid videos with URLs
      const validVideos = patientVideos.filter((video: Video) => {
        const isValid = video.file_url && video.file_url.trim() !== '';
        if (!isValid) {
          console.log('PublicPatientVideos - Invalid video URL for video:', video.file_name);
        }
        return isValid;
      });
      
      console.log('PublicPatientVideos - Valid videos found:', validVideos.length);
      setVideos(validVideos);
    } catch (error) {
      console.error('PublicPatientVideos - Error loading videos from IndexedDB:', error);
      
      // Fallback to localStorage with improved ID matching
      try {
        const allVideos = JSON.parse(localStorage.getItem('cinebaby_videos') || '[]');
        console.log('PublicPatientVideos - All videos in localStorage:', allVideos);
        
        // Search for videos by patient ID with improved comparison
        const patientVideos = allVideos.filter((v: Video) => {
          const videoPatientIdStr = String(v.patient_id);
          const searchIdStr = String(patientId);
          const matches = videoPatientIdStr === searchIdStr;
          
          if (matches) {
            console.log('PublicPatientVideos - Found matching video for patient:', v);
          }
          return matches;
        });
        
        console.log('PublicPatientVideos - Patient videos from localStorage:', patientVideos);
        
        // Filter valid videos with URLs
        const validVideos = patientVideos.filter((video: Video) => {
          const isValid = video.file_url && video.file_url.trim() !== '';
          if (!isValid) {
            console.log('PublicPatientVideos - Invalid video URL for video:', video.file_name);
          }
          return isValid;
        });
        
        console.log('PublicPatientVideos - Valid videos from localStorage:', validVideos.length);
        setVideos(validVideos);
      } catch (localStorageError) {
        console.error('PublicPatientVideos - Error loading videos from localStorage:', localStorageError);
      }
    }
  };

  const handlePlayVideo = (video: Video) => {
    console.log('PublicPatientVideos - Playing video:', video.file_name, 'URL:', video.file_url);
    
    // Check if video URL is still valid
    if (!video.file_url || video.file_url.trim() === '') {
      console.error('PublicPatientVideos - Invalid video URL');
      return;
    }
    
    setSelectedVideo(video);
    setIsVideoPlayerOpen(true);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cinebaby-purple/5 to-cinebaby-teal/5 flex items-center justify-center p-4">
        <Card className="max-w-sm w-full mx-4">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-cinebaby-purple/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Heart className="h-8 w-8 text-cinebaby-purple" />
            </div>
            <p className="text-sm text-gray-600">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cinebaby-purple/5 to-cinebaby-teal/5 flex items-center justify-center p-4">
        <Card className="max-w-sm w-full mx-4">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-cinebaby-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-cinebaby-purple" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Paciente não encontrada
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              Não foi possível encontrar os dados desta paciente.
            </p>
            <div className="text-xs text-gray-500 font-mono break-all bg-gray-50 p-2 rounded mb-3">
              <p>ID procurado: {patientId}</p>
              <p>Tipo: {typeof patientId}</p>
            </div>
            <Button 
              className="mt-4 bg-cinebaby-gradient hover:opacity-90"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cinebaby-purple/5 to-cinebaby-teal/5">
      {/* Header - Optimized for mobile */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
          <div className="text-center">
            <img 
              src="/lovable-uploads/6bd58522-32f8-48b7-bbe7-999d3463508c.png" 
              alt="CineBaby" 
              className="h-8 sm:h-12 mx-auto mb-3 sm:mb-4"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-cinebaby-purple mb-1 sm:mb-2">
              Vídeos de {patient.name}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 px-2">
              "Reviva esse momento mágico sempre que quiser"
            </p>
            <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
              <Smartphone className="h-3 w-3 mr-1" />
              Paciente ID: {patient.id}
            </div>
          </div>
        </div>
      </div>

      {/* Content - Responsive layout */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Card className="shadow-lg">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-center text-lg sm:text-xl">
              Seus Vídeos de Ultrassom ({videos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {videos.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-cinebaby-purple/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Play className="h-6 w-6 sm:h-8 sm:w-8 text-cinebaby-purple" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  Ainda não há vídeos disponíveis
                </h3>
                <p className="text-sm sm:text-base text-gray-600 px-4 mb-2">
                  Os vídeos do seu ultrassom aparecerão aqui em breve.
                </p>
                <p className="text-xs text-gray-500">
                  Verificando para paciente ID: {patientId}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                {videos.map((video) => (
                  <Card key={video.id} className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-white to-gray-50" onClick={() => handlePlayVideo(video)}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="aspect-video bg-gradient-to-br from-cinebaby-purple/10 to-cinebaby-teal/10 rounded-lg mb-3 sm:mb-4 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 active:opacity-100 transition-opacity">
                          <div className="bg-white/90 rounded-full p-2 sm:p-3">
                            <Play className="h-6 w-6 sm:h-8 sm:w-8 text-cinebaby-purple" />
                          </div>
                        </div>
                        <Play className="h-8 w-8 sm:h-12 sm:w-12 text-cinebaby-purple" />
                      </div>
                      <h4 className="font-medium mb-1 sm:mb-2 text-sm sm:text-base text-center" title={video.file_name}>
                        Vídeo do Ultrassom
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 text-center">
                        {formatDate(video.uploaded_at)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer - Compact for mobile */}
        <div className="text-center mt-6 sm:mt-8 p-4 sm:p-6 bg-white rounded-lg shadow-sm mx-1 sm:mx-0">
          <p className="text-xs sm:text-sm text-gray-600 italic leading-relaxed">
            "Ver seu bebê antes do nascimento é um carinho que emociona para sempre."
          </p>
          <p className="text-xs text-gray-500 mt-2">
            CineBaby - Momentos que ficam para sempre
          </p>
        </div>
      </div>

      {/* Video Player Dialog - Optimized for mobile */}
      <Dialog open={isVideoPlayerOpen} onOpenChange={setIsVideoPlayerOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] p-3 sm:p-6">
          <DialogHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-sm sm:text-lg">Vídeo do Ultrassom</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVideoPlayerOpen(false)}
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-xs sm:text-sm">
              {selectedVideo && formatDate(selectedVideo.uploaded_at)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVideo && (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {selectedVideo.file_url ? (
                <video 
                  src={selectedVideo.file_url} 
                  controls 
                  autoPlay
                  className="w-full h-full"
                  preload="metadata"
                  playsInline
                  onLoadStart={() => console.log('PublicPatientVideos - Video loading started')}
                  onCanPlay={() => console.log('PublicPatientVideos - Video can play')}
                  onError={(e) => {
                    console.error('PublicPatientVideos - Video error:', e);
                    console.error('PublicPatientVideos - Video URL that failed:', selectedVideo.file_url);
                  }}
                  onLoadedData={() => console.log('PublicPatientVideos - Video data loaded')}
                >
                  Seu navegador não suporta a reprodução de vídeo.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <Play className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm sm:text-base">Vídeo indisponível</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicPatientVideos;
