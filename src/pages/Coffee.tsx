import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Coffee as CoffeeIcon } from "lucide-react";

const Coffee = () => {
  const paymentMethods = [
    {
      name: "Venmo",
      logo: "/images/venmo-logo.png",
      username: "@ZiyaKEsrefoglu",
      qrCode: "/images/qr-venmo-new.png",
      link: "https://venmo.com/u/ZiyaKEsrefoglu",
      color: "from-[#008CFF] to-[#0074CC]",
    },
    {
      name: "CashApp",
      logo: "/images/cashapp-logo.png",
      username: "$ZiyaEsrefoglu",
      qrCode: "/images/qr-cashapp.png",
      link: "https://cash.app/$ZiyaEsrefoglu",
      color: "from-[#00D64F] to-[#00B53F]",
    },
    {
      name: "Wise",
      logo: "/images/wise-logo.png",
      username: "ziyae28",
      qrCode: "/images/qr-wise.png",
      link: "https://apps.apple.com/us/app/wise-global-money/id612261027",
      color: "from-[#9FE870] to-[#7FBA56]",
    },
  ];

  const suggestedAmounts = [
    { amount: "$5", label: "One Coffee" },
    { amount: "$10", label: "Two Coffees" },
    { amount: "$25", label: "A Week's Worth" },
    { amount: "Custom", label: "Your Choice" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <CoffeeIcon className="w-16 h-16 text-[#F54927]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-bold mb-4">
              Buy Me a Coffee ☕
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Support independent journalism from the Bosphorus. Your contribution helps us continue
              delivering quality news and analysis that matters.
            </p>
          </div>

          {/* Suggested Amounts */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-center mb-6">Suggested Amounts</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {suggestedAmounts.map((item) => (
                <div
                  key={item.amount}
                  className="bg-card border border-border rounded-lg p-4 text-center hover:border-primary transition-colors"
                >
                  <div className="text-2xl font-bold text-primary mb-1">{item.amount}</div>
                  <div className="text-sm text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-center mb-6">Choose Your Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paymentMethods.map((method) => (
                <div
                  key={method.name}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all hover:scale-[1.02]"
                >
                  {/* Gradient Header */}
                  <div className={`bg-gradient-to-r ${method.color} rounded-t-lg -mx-6 -mt-6 px-6 py-6 mb-6 flex justify-center items-center`}>
                    <img 
                      src={method.logo} 
                      alt={method.name} 
                      className={`h-10 object-contain ${method.name !== 'Wise' ? 'bg-white px-4 py-2 rounded-lg' : ''}`}
                    />
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center mb-6">
                    <img
                      src={method.qrCode}
                      alt={`${method.name} QR Code`}
                      className="w-48 aspect-square object-contain"
                    />
                  </div>

                  {/* Link Button */}
                  {method.link ? (
                    <a
                      href={method.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-primary text-primary-foreground py-2 rounded-md text-center font-medium hover:bg-primary/90 transition-colors"
                    >
                      Open {method.name}
                    </a>
                  ) : (
                    <div className="text-center text-sm text-muted-foreground py-2">
                      Use the username above
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-6 mb-12">
            <h3 className="font-semibold mb-3">How to Support:</h3>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Choose your preferred payment method above</li>
              <li>Scan the QR code with your mobile app, or click the button to open directly</li>
              <li>Enter any amount you'd like to contribute</li>
              <li>Send your support and help us keep reporting!</li>
            </ol>
          </div>

          {/* Thank You Message */}
          <div className="text-center">
            <h2 className="text-2xl font-headline font-bold mb-4">Thank You! 🙏</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every contribution, no matter the size, makes a real difference. Your support allows us
              to maintain editorial independence and continue delivering the news that matters most to
              our readers. We're grateful for your generosity!
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Coffee;
