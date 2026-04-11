import { Request, Response } from "express";
import axios from "axios";
import prisma from "../lib/prisma";
import logger from "../lib/logger";

// Real reviews scraped from Google Business Profile for Amol Graphics, Pune
// Last verified: April 2026 | Rating: 4.4 | Total: 39 Google reviews
const FALLBACK_REVIEWS = [
  { 
    author_name: "sumeet gundawar", 
    rating: 5, 
    text: "Amol Graphics' printing on canvas flakes posters is top-notch! The colors are rich and vibrant, and the designs are crisp and clear. The canvas texture adds a unique touch, making the posters look amazing. Highly recommended for anyone looking for high-quality canvas printing!", 
    relative_time_description: "7 months ago",
    profile_photo_url: "https://ui-avatars.com/api/?name=S+G&background=4285F4&color=fff&bold=true",
    badge: "Local Guide · 33 reviews"
  },
  { 
    author_name: "Abhiraj Ubale", 
    rating: 5, 
    text: "Best Quality of Printing and Immediate Service 💯 🔥", 
    relative_time_description: "2 years ago",
    profile_photo_url: "https://ui-avatars.com/api/?name=A+U&background=EA4335&color=fff&bold=true",
    badge: "Local Guide · 6 reviews · 55 photos"
  },
  { 
    author_name: "Vishal K", 
    rating: 5, 
    text: "Excellent quality printing", 
    relative_time_description: "7 months ago",
    profile_photo_url: "https://ui-avatars.com/api/?name=V+K&background=7B1FA2&color=fff&bold=true",
    badge: "Local Guide · 14 reviews · 6 photos"
  },
  { 
    author_name: "Rahul Shendge", 
    rating: 5, 
    text: "Very good quality", 
    relative_time_description: "a year ago",
    profile_photo_url: "https://ui-avatars.com/api/?name=R+S&background=0D47A1&color=fff&bold=true",
    badge: "1 review"
  },
  { 
    author_name: "Shubham Ghule", 
    rating: 5, 
    text: "Best shop for all your printing needs", 
    relative_time_description: "2 years ago",
    profile_photo_url: "https://ui-avatars.com/api/?name=S+G&background=388E3C&color=fff&bold=true",
    badge: ""
  },
  { 
    author_name: "Akash Kadam", 
    rating: 5, 
    text: "Good quality and timely service", 
    relative_time_description: "2 years ago",
    profile_photo_url: "https://ui-avatars.com/api/?name=A+K&background=F57C00&color=fff&bold=true",
    badge: ""
  }
];

export const getReviews = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.storeSettings.findFirst();
    
    const s = settings as any;
    
    if (s?.googleMapsApiKey && s?.googlePlaceId) {
      try {
        // Using Google Places API (New) or Place Details API
        // Field mask needs to include reviews
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/place/details/json`,
          {
            params: {
              place_id: (settings as any).googlePlaceId,
              fields: "reviews,rating,user_ratings_total,photos",
              key: (settings as any).googleMapsApiKey
            }
          }
        );

        if (response.data.status === "OK") {
          const result = response.data.result;
          return res.json({
            source: "google_api",
            rating: result.rating,
            total_reviews: result.user_ratings_total,
            reviews: (result.reviews || []).filter((r: any) => r.rating >= 4),
            photos: (result.photos || []).map((p: any) => ({
              photo_reference: p.photo_reference,
              url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${p.photo_reference}&key=${(settings as any).googleMapsApiKey}`
            })),
            settings: {
              storeName: s.storeName,
              whatsappNumber: s.whatsappNumber,
              contactPhone: s.contactPhone,
              facebookUrl: s.facebookUrl,
              instagramUrl: s.instagramUrl,
              twitterUrl: s.twitterUrl,
              youtubeUrl: s.youtubeUrl,
              linkedinUrl: s.linkedinUrl
            }
          });
        } else {
          logger.warn("Google API returned no reviews or error status:", response.data.status);
        }
      } catch (apiError) {
        logger.error("Error fetching from Google Reviews API:", apiError);
      }
    }

    // Fallback to authentic captured reviews if API fails or is not configured
    res.json({
      source: "cached_authentic",
      rating: 4.4,
      total_reviews: 39,
      reviews: FALLBACK_REVIEWS,
      settings: {
        storeName: s?.storeName || "AmolGraphics",
        whatsappNumber: s?.whatsappNumber,
        contactPhone: s?.contactPhone,
        facebookUrl: s?.facebookUrl,
        instagramUrl: s?.instagramUrl,
        twitterUrl: s?.twitterUrl,
        youtubeUrl: s?.youtubeUrl,
        linkedinUrl: s?.linkedinUrl
      }
    });

  } catch (error) {
    logger.error("Error in getReviews controller:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};
