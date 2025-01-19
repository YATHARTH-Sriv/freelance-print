"use client";

import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useSession } from "next-auth/react";
import axios from "axios";

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
  userId: string;
  __v: number;
  _id: string;
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const [userLocation, setUserLocation] = useState({ lat: 0, lng: 0 });
  const [printShops, setPrintShops] = useState<PrintShop[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });

    // Fetch files for the logged-in user
    const fetchFiles = async () => {
      try {
        const response = await axios.get("/api/getfilespending");
        console.log("Files:", response.data);
        setFiles(response.data);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, []);

  const handleCompleteFiles = async () => {
    setIsLoading(true);
    try {
      await axios.post("/api/getfilespending");
      setFiles([]);
      setIsOrderComplete(true);
    } catch (error) {
      console.error("Error updating files:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Checkout</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <Card className="flex-1 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Nearby Print Shops</CardTitle>
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

          <Card className="flex-1 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">User: {session?.user?.name || "Guest"}</p>
                {files.map((file) => (
                  <div key={file._id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{file.filename}</span>
                  </div>
                ))}
                {files.length === 0 && (
                  <p className="text-sm text-gray-600">No files to checkout.</p>
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
                      <DialogTitle className="text-xl font-bold text-gray-800">Choose Payment Method</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Button
                        onClick={() => setSelectedPaymentMethod("UPI")}
                        className={`w-full justify-start text-black ${
                          selectedPaymentMethod === "UPI" ? "bg-blue-100" : "bg-gray-100 hover:bg-gray-200"
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
                        className="w-full bg-green-600 hover:bg-green-700 text-white mt-4"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <div className="loader mr-2"></div>
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
                  onClick={() => (window.location.href = "/upload")}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Go to Uploads
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {isOrderComplete && (
          <Dialog open={isOrderComplete} onOpenChange={setIsOrderComplete}>
            <DialogContent className="bg-white text-center">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-800">Order Complete</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-green-500 rounded-full p-4">
                  <Image src="/check.jpg" alt="Order Complete" width={40} height={40} />
                </div>
                <p>Your order has been successfully placed!</p>
                <Button
                  onClick={() => setIsOrderComplete(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
