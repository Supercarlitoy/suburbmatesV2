"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  suburb: string;
  text: string;
  result: string;
  avatar: string;
  color: string;
  rating: number;
}

export function TestimonialCard({
  name,
  suburb,
  text,
  result,
  avatar,
  color,
  rating
}: TestimonialCardProps) {
  return (
    <Card className="w-80 mx-4 bg-gray-50 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className={`w-12 h-12 ${color} rounded-full grid place-items-center text-white font-bold mr-3`} aria-hidden>
            {avatar}
          </div>
          <div>
            <h3 className="font-semibold">{name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{suburb}</span>
              <span className="text-gray-300">•</span>
              <div className="flex" aria-label={`${rating} star rating`}>
                {Array.from({ length: rating }).map((_, s) => (
                  <Star key={s} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className="text-gray-700 mb-3">"{text}"</p>
        <p className="text-sm text-primary font-semibold">{result}</p>
      </CardContent>
    </Card>
  );
}