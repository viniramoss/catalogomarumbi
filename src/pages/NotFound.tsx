import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { linkDoCatalogo } from "../config/catalogo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 pt-16 md:pt-20">
        <div className="py-20 text-center">
          <p className="font-serif text-6xl font-bold text-gold-500">404</p>
          <h1 className="mt-3 text-2xl font-bold text-foreground">Página não encontrada</h1>
          <Link
            to={linkDoCatalogo()}
            className="mt-6 inline-flex rounded-md bg-gold-500 px-6 py-3 font-semibold text-black hover:bg-gold-400 transition-colors"
          >
            Ver o catálogo
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
