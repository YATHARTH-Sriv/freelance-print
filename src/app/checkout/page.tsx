"use client";

import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Loader2, AlertCircle } from 'lucide-react';

interface PrintShop {
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  rating: number;
}

interface File {
  createdAt: string;
  fileType: string;
  filename: string;
  status: string;
  updatedAt: string;
  uploadDate: string;
  url: string;
  localUrl?: string;
  userId: string;
  __v: number;
  _id: string;
}

interface PDFViewerProps {
  pdfUrl: string;
  width?: number;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, width = 800 }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPDF = async () => {
      try {
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error('Failed to load PDF');
        }
        setIsLoading(false);
      } catch (err) {
        setError('Error loading PDF. Please try again.');
        setIsLoading(false);
      }
    };

    checkPDF();
  }, [pdfUrl]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200">
      <iframe
        src={`${pdfUrl}#toolbar=0`}
        width={width}
        height={400}
        className="w-full"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default function CheckoutPage() {
  const { data: session } = useSession();
  const [userLocation, setUserLocation] = useState({ lat: 0, lng: 0 });
  const [printShops, setPrintShops] = useState<PrintShop[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        setError("Failed to get your location. Please enable location services.");
      }
    );

    // Fetch pending files
    const fetchFiles = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/getfilespending");
        setFiles(response.data);
      } catch (error) {
        console.error("Error fetching files:", error);
        setError("Failed to load your files. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const handleCompleteFiles = async () => {
    try {
      setIsLoading(true);
      await axios.post("/api/getfilespending");
      setFiles([]);
      setIsOrderComplete(true);
      setIsPaymentOpen(false);
    } catch (error) {
      console.error("Error completing order:", error);
      setError("Failed to complete your order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Map Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Nearby Print Shops
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
                <GoogleMap
                  center={userLocation}
                  zoom={14}
                  mapContainerClassName="w-full h-[400px] rounded-lg"
                >
                  {printShops.map((shop, index) => (
                    <Marker key={index} position={shop.location} />
                  ))}
                </GoogleMap>
              </LoadScript>
            </CardContent>
          </Card>

          {/* Order Summary Card */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    User: {session?.user?.name || "Guest"}
                  </p>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <span>Loading your files...</span>
                    </div>
                  ) : files.length === 0 ? (
                    <p className="text-sm text-gray-600">No files to checkout.</p>
                  ) : (
                    files.map((file) => (
                      <div key={file._id} className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 font-medium">{file.filename}</span>
                          <span className="text-gray-500 text-xs">
                            {new Date(file.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <PDFViewer 
                          pdfUrl={file.localUrl || file.url} 
                          width={800}
                        />
                      </div>
                    ))
                  )}
                  
                  <Separator />
                </div>
              </CardContent>
              
              <CardFooter>
                {files.length > 0 ? (
                  <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Proceed to Checkout
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-800">
                          Choose Payment Method
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <Button
                          onClick={() => setSelectedPaymentMethod("UPI")}
                          className={`w-full justify-start text-black ${
                            selectedPaymentMethod === "UPI" 
                              ? "bg-blue-100" 
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          <Image
                            src="/googleupi.png"
                            alt="UPI"
                            width={30}
                            height={30}
                            className="mr-2 rounded-md"
                          />
                          Pay with UPI
                        </Button>
                      </div>
                      {selectedPaymentMethod && (
                        <Button
                          onClick={handleCompleteFiles}
                          disabled={isLoading}
                          className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Processing...
                            </div>
                          ) : (
                            "Complete Order"
                          )}
                        </Button>
                      )}
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button
                    onClick={() => window.location.href = "/upload"}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    Go to Uploads
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Order Complete Dialog */}
        <Dialog open={isOrderComplete} onOpenChange={setIsOrderComplete}>
          <DialogContent className="bg-white text-center">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-800">
                Order Complete
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-green-500 rounded-full p-4">
                <Image 
                  src="/check.jpg" 
                  alt="Order Complete" 
                  width={40} 
                  height={40} 
                />
              </div>
              <p>Your order has been successfully placed!</p>
              <Button
                onClick={() => {
                  setIsOrderComplete(false);
                  window.location.href = "/upload";
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to Dashboard
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}