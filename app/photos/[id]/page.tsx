"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";

type PhotoDetail = {
   id: string;
   author: string;
   width: number;
   height: number;
   url: string;
   download_url: string;
};

export default function PhotoDetailPage({
   params,
}: {
   params: Promise<{ id: string }>;
}) {
   // Unwrap params using React.use() for Next.js 15+ compatibility, or await it if async component
   const resolvedParams = use(params);
   const { id } = resolvedParams;

   const [photo, setPhoto] = useState<PhotoDetail | null>(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchPhotoDetail = async () => {
         try {
            const res = await fetch(`https://picsum.photos/id/${id}/info`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setPhoto(data);
         } catch (error) {
            console.error(error);
         } finally {
            setLoading(false);
         }
      };

      if (id) {
         fetchPhotoDetail();
      }
   }, [id]);

   if (loading)
      return (
         <div className="flex h-screen justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
         </div>
      );

   if (!photo) return <div className="text-center mt-10">Photo not found.</div>;

   return (
      <div className="container mx-auto p-4 max-w-4xl">
         <Link
            href="/photos"
            className="inline-block mb-4 text-blue-600 hover:underline"
         >
            &larr; Back to Gallery
         </Link>

         <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Full Size Image Section */}
            <div className="relative w-full aspect-video bg-gray-100">
               <Image
                  src={photo.download_url}
                  alt={photo.author}
                  fill
                  className="object-contain"
                  priority
               />
            </div>

            {/* Details Section */}
            <div className="p-6">
               <div className="mb-4">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                     {/* Placeholder Title */}
                     The Beauty of Nature #{photo.id}
                  </h1>
                  <p className="text-md text-gray-500 font-medium">
                     By: <span className="text-blue-600">{photo.author}</span>
                  </p>
               </div>

               <div className="prose max-w-none text-gray-700">
                  <h3 className="text-xl font-semibold mb-2">Description</h3>
                  {/* Placeholder Description */}
                  <p>
                     This is a stunning photograph captured by {photo.author}.
                     The original dimensions of this image are {photo.width}x
                     {photo.height} pixels. Lorem ipsum dolor sit amet,
                     consectetur adipiscing elit. Sed do eiusmod tempor
                     incididunt ut labore et dolore magna aliqua. Ut enim ad
                     minim veniam, quis nostrud exercitation ullamco laboris
                     nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <div className="mt-4 pt-4 border-t">
                     <a
                        href={photo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-500 hover:text-blue-700"
                     >
                        View on Unsplash / Source
                     </a>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
