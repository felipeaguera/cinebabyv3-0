import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, Heart, X } from 'lucide-react';
import { Patient, Video } from '@/types';

const PublicPatientVideos: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);

  useEffect(() => {
    console.log('PublicPatientVideos - patientId from URL:', patientId);
    loadPatientData();
    loadVideos();
  }, [patientId]);

  const loadPatientData = () => {
    if (!patientId) {
      console.log('PublicPatientVideos - No patientId provided');
      return;
    }
    
    const patients = JSON.parse(localStorage.getItem('cinebaby_patients') || '[]');
    console.log('PublicPatientVideos - All patients in localStorage:', patients);
    console.log('PublicPatientVideos - Looking for patient with ID:', patientId);
    
    const foundPatient = patients.find((p: Patient) => p.id === patientId);
    console.log('PublicPatientVideos - Found patient:', foundPatient);
    
    if (foundPatient) {
      setPatient(foundPatient);
    }
  };

  const loadVideos = () => {
    if (!patientId) return;
    
    const allVideos = JSON.parse(localStorage.getItem('cinebaby_videos') || '[]');
    console.log('PublicPatientVideos - All videos in localStorage:', allVideos);
    const patientVideos = allVideos.filter((v: Video) => v.patientId === patientId);
    console.log('PublicPatientVideos - Patient videos:', patientVideos);
    setVideos(patientVideos);
  };

  const handlePlayVideo = (video: Video) => {
    console.log('PublicPatientVideos - Playing video:', video.fileName, 'URL:', video.fileUrl);
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

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cinebaby-purple/5 to-cinebaby-teal/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-cinebaby-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-cinebaby-purple" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Paciente não encontrada
            </h2>
            <p className="text-gray-600">
              Não foi possível encontrar os dados desta paciente.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              ID procurado: {patientId}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cinebaby-purple/5 to-cinebaby-teal/5">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <img 
              src="/lovable-uploads/6bd58522-32f8-48b7-bbe7-999d3463508c.png" 
              alt="CineBaby" 
              className="h-12 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-cinebaby-purple mb-2">
              Vídeos de {patient.name}
            </h1>
            <p className="text-gray-600">
              "Reviva esse momento mágico sempre que quiser"
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              Seus Vídeos de Ultrassom ({videos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {videos.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-cinebaby-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-8 w-8 text-cinebaby-purple" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Ainda não há vídeos disponíveis
                </h3>
                <p className="text-gray-600">
                  Os vídeos do seu ultrassom aparecerão aqui em breve.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {videos.map((video) => (
                  <Card key={video.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handlePlayVideo(video)}>
                    <CardContent className="p-4">
                      <div className="aspect-video bg-gradient-to-br from-cinebaby-purple/10 to-cinebaby-teal/10 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                        {video.fileUrl ? (
                          <video 
                            src={video.fileUrl} 
                            className="w-full h-full object-cover"
                            poster=""
                            preload="metadata"
                          />
                        ) : (
                          <Play className="h-12 w-12 text-cinebaby-purple" />
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 rounded-full p-3">
                            <Play className="h-8 w-8 text-cinebaby-purple" />
                          </div>
                        </div>
                      </div>
                      <h4 className="font-medium mb-2 text-center" title={video.fileName}>
                        Vídeo do Ultrassom
                      </h4>
                      <p className="text-sm text-gray-500 text-center">
                        {formatDate(video.uploadedAt)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 p-6 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 italic">
            "Ver seu bebê antes do nascimento é um carinho que emociona para sempre."
          </p>
          <p className="text-xs text-gray-500 mt-2">
            CineBaby - Momentos que ficam para sempre
          </p>
        </div>
      </div>

      {/* Video Player Dialog */}
      <Dialog open={isVideoPlayerOpen} onOpenChange={setIsVideoPlayerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Vídeo do Ultrassom</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVideoPlayerOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              {selectedVideo && formatDate(selectedVideo.uploadedAt)}
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
                onLoadStart={() => console.log('PublicPatientVideos - Video loading started')}
                onCanPlay={() => console.log('PublicPatientVideos - Video can play')}
                onError={(e) => console.error('PublicPatientVideos - Video error:', e)}
                onLoadedData={() => console.log('PublicPatientVideos - Video data loaded')}
              >
                Seu navegador não suporta a reprodução de vídeo.
              </video>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PublicPatientVideos;
