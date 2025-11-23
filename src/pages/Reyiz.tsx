import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import reyizImage from "@/assets/reyiz.png";

const Reyiz = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <img 
            src={reyizImage} 
            alt="Reyiz" 
            className="w-64 h-64 mx-auto rounded-full object-cover mb-8 shadow-lg"
          />
          <h1 className="text-4xl font-bold mb-4">Reyiz</h1>
          <p className="text-xl text-muted-foreground">
            Welcome to the Reyiz section of Bosphorus News Network.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reyiz;
