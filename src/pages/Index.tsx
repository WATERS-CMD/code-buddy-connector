import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Heart, DollarSign } from "lucide-react";
import { toast } from "sonner";
import DonationForm from "@/components/DonationForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Make a Difference Today
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join us in making a positive impact. Your donation helps support our charitable cause
            and brings hope to those in need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="text-red-500" />
                Why Donate?
              </CardTitle>
              <CardDescription>Your support makes a real difference</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Help those in need
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Support local communities
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Make a lasting impact
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="text-green-500" />
                Donation Information
              </CardTitle>
              <CardDescription>Safe and secure payments via DPO Pay</CardDescription>
            </CardHeader>
            <CardContent>
              <DonationForm />
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>All donations are processed securely through DPO Pay.</p>
          <p>For any questions, please contact our support team.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;