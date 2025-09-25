import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="glass-card p-8 text-center max-w-md mx-4">
        <h1 className="mb-4 text-4xl font-bold medical-accent">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <Link 
          to="/" 
          className="inline-flex items-center justify-center px-6 py-2 bg-medical-primary hover:bg-medical-secondary text-primary-foreground rounded-lg transition-colors pulse-glow"
        >
          Return to Surakshabot
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
