import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Monitor, Share, Plus, MoreVertical, Check } from "lucide-react";
import { Link } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect device
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-success" />
            </div>
            <CardTitle className="text-2xl">App Installed!</CardTitle>
            <CardDescription>
              MKQ Consulting is installed on your device. You can now access it from your home screen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/auth">
              <Button className="w-full">Open App</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <Download className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-display mb-3">Install MKQ Consulting</h1>
          <p className="text-muted-foreground text-lg">
            Add this app to your home screen for quick access and a better experience.
          </p>
        </div>

        {/* Benefits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Why Install?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-success" />
                </div>
                <span>Launch instantly from your home screen</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-success" />
                </div>
                <span>Full-screen experience without browser UI</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-success" />
                </div>
                <span>Faster loading with cached resources</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-success" />
                </div>
                <span>Works offline for basic functionality</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Install Button (Android/Desktop) */}
        {deferredPrompt && (
          <div className="mb-8">
            <Button onClick={handleInstall} size="lg" className="w-full text-lg py-6">
              <Download className="w-5 h-5 mr-2" />
              Install App
            </Button>
          </div>
        )}

        {/* iOS Instructions */}
        {isIOS && !deferredPrompt && (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-primary" />
                <CardTitle className="text-lg">Install on iPhone/iPad</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-medium">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Tap the Share button</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Look for the <Share className="w-4 h-4" /> icon at the bottom of Safari
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-medium">
                    2
                  </span>
                  <div>
                    <p className="font-medium">Scroll and tap "Add to Home Screen"</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Look for the <Plus className="w-4 h-4" /> icon in the menu
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-medium">
                    3
                  </span>
                  <div>
                    <p className="font-medium">Tap "Add" to confirm</p>
                    <p className="text-sm text-muted-foreground">
                      The app will appear on your home screen
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Android Instructions (fallback if no prompt) */}
        {isAndroid && !deferredPrompt && (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-primary" />
                <CardTitle className="text-lg">Install on Android</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-medium">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Tap the menu button</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      Look for <MoreVertical className="w-4 h-4" /> in Chrome's top right
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-medium">
                    2
                  </span>
                  <div>
                    <p className="font-medium">Tap "Install app" or "Add to Home screen"</p>
                    <p className="text-sm text-muted-foreground">
                      The option may vary by browser version
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-medium">
                    3
                  </span>
                  <div>
                    <p className="font-medium">Confirm the installation</p>
                    <p className="text-sm text-muted-foreground">
                      The app will be added to your home screen
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Desktop Instructions */}
        {!isIOS && !isAndroid && !deferredPrompt && (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Monitor className="w-6 h-6 text-primary" />
                <CardTitle className="text-lg">Install on Desktop</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-medium">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Look for the install icon</p>
                    <p className="text-sm text-muted-foreground">
                      Check the right side of your browser's address bar
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-medium">
                    2
                  </span>
                  <div>
                    <p className="font-medium">Click "Install"</p>
                    <p className="text-sm text-muted-foreground">
                      Or use the browser menu → "Install MKQ Consulting"
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Back to App */}
        <div className="text-center">
          <Link to="/auth">
            <Button variant="outline">Back to App</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Install;
