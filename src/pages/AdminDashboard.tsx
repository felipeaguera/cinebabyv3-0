
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clinic, Patient, Video as VideoType } from '@/types';
import ClinicsTab from '@/components/ClinicsTab';
import VideosTab from '@/components/VideosTab';

const AdminDashboard: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load clinics
    const storedClinics = localStorage.getItem('cinebaby_clinics');
    if (storedClinics) {
      setClinics(JSON.parse(storedClinics));
    }

    // Load patients
    const storedPatients = localStorage.getItem('cinebaby_patients');
    if (storedPatients) {
      setPatients(JSON.parse(storedPatients));
    }

    // Load videos
    const storedVideos = localStorage.getItem('cinebaby_videos');
    if (storedVideos) {
      setVideos(JSON.parse(storedVideos));
    }
  };

  return (
    <Layout title="Painel Administrativo">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Painel Administrativo</h2>
            <p className="text-gray-600">Gerencie clínicas, pacientes e vídeos da plataforma</p>
          </div>
        </div>

        <Tabs defaultValue="clinics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="clinics">Clínicas</TabsTrigger>
            <TabsTrigger value="videos">Todos os Vídeos</TabsTrigger>
          </TabsList>

          <TabsContent value="clinics" className="space-y-6">
            <ClinicsTab
              clinics={clinics}
              setClinics={setClinics}
              patients={patients}
              setPatients={setPatients}
              videos={videos}
              setVideos={setVideos}
            />
          </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            <VideosTab
              videos={videos}
              setVideos={setVideos}
              patients={patients}
              clinics={clinics}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
