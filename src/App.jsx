import { useState } from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Cta from "./components/Cta";
import Footer from "./components/Footer";
import AuthModal from "./components/AuthModal";
import Dashboard from "./components/Dashboard";
import PwaInstallPrompt from "./components/PwaInstallPrompt";

function MainContent() {
  const { user, loading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("register");

  const openAuth = (tab = "register") => {
    setModalTab(tab);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <p>Cargando Solteros Adventistas...</p>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <Dashboard />
      ) : (
        <div className="app">
          <Navbar onOpenAuth={openAuth} />
          <Hero onOpenAuth={openAuth} />
          <Features />
          <Cta onOpenAuth={openAuth} />
          <Footer />

          <AuthModal
            isOpen={isModalOpen}
            initialTab={modalTab}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
      )}

      {/* AVISO DE INSTALACIÓN EN EL TELÉFONO (PWA) */}
      <PwaInstallPrompt />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;