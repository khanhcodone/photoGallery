"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

// Định nghĩa kiểu dữ liệu cho Photo
type Photo = {
   id: string;
   author: string;
   width: number;
   height: number;
   url: string;
   download_url: string;
};

export default function PhotoList() {
   const [photos, setPhotos] = useState<Photo[]>([]);
   const [page, setPage] = useState(1);
   const [loading, setLoading] = useState(false);
   const [hasMore, setHasMore] = useState(true);

   // Ref để theo dõi element cuối cùng
   const observer = useRef<IntersectionObserver | null>(null);

   const lastPhotoElementRef = useCallback(
      (node: HTMLDivElement) => {
         if (loading) return;
         if (observer.current) observer.current.disconnect();

         observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
               setPage((prevPage) => prevPage + 1);
            }
         });

         if (node) observer.current.observe(node);
      },
      [loading, hasMore]
   );

   // Hàm fetch dữ liệu
   const fetchPhotos = async () => {
      setLoading(true);
      try {
         // Lấy 20 ảnh mỗi lần gọi
         const res = await fetch(
            `https://picsum.photos/v2/list?page=${page}&limit=20`
         );
         const data = await res.json();

         if (data.length === 0) {
            setHasMore(false);
         } else {
            // Dùng Set để lọc trùng lặp phòng trường hợp API trả về ID cũ (strict mode của React)
            setPhotos((prev) => {
               const newPhotos = data.filter(
                  (p: Photo) => !prev.some((existing) => existing.id === p.id)
               );
               return [...prev, ...newPhotos];
            });
         }
      } catch (error) {
         console.error("Error fetching photos:", error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchPhotos();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [page]);

   return (
      <div className="container mx-auto p-4">
         <h1 className="text-3xl font-bold mb-6 text-center">
            Lorem Picsum Gallery
         </h1>

         {/* Grid View */}
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {photos.map((photo, index) => {
               // Kiểm tra nếu là phần tử cuối cùng thì gắn ref
               if (photos.length === index + 1) {
                  return (
                     <div
                        ref={lastPhotoElementRef}
                        key={photo.id}
                        className="photo-card"
                     >
                        <PhotoCard photo={photo} />
                     </div>
                  );
               } else {
                  return (
                     <div key={photo.id} className="photo-card">
                        <PhotoCard photo={photo} />
                     </div>
                  );
               }
            })}
         </div>

         {/* Loading Indicator */}
         {loading && (
            <div className="flex justify-center items-center py-4">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
               <span className="ml-2">Loading more photos...</span>
            </div>
         )}

         {/* End of list message */}
         {!hasMore && (
            <div className="text-center py-4 text-gray-500">
               You have reached the end of the list.
            </div>
         )}
      </div>
   );
}

// Component hiển thị từng ảnh nhỏ
function PhotoCard({ photo }: { photo: Photo }) {
   return (
      <Link
         href={`/photos/${photo.id}`}
         className="block group h-full border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
      >
         <div className="relative aspect-square overflow-hidden bg-gray-200">
            <Image
               src={`https://picsum.photos/id/${photo.id}/300/300`} // Lấy thumbnail size 300x300
               alt={photo.author}
               fill
               className="object-cover group-hover:scale-110 transition-transform duration-300"
               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
         </div>
         <div className="p-4 bg-white">
            <p className="text-sm font-semibold text-green-500">Author</p>
            <h3 className="text-lg font-black text-black truncate">
               {photo.author}
            </h3>
         </div>
      </Link>
   );
}
