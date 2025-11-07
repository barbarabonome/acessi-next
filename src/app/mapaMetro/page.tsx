"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function MapaMetro() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Mapa do Metrô";
  }, [router]);

  return (
    <>
      <main>
        <h1 className="text-2xl font-bold dark:text-white text-center mt-6 mb-4">
          Mapa Metropolitano do Metrô de São Paulo
        </h1>

        <div className="flex justify-center">
          <Image
            src="/images/mapaMetro.jpg"
            width={1200}
            height={100}
            alt="Mapa do Metrô"
            className="w-[85%] h-auto rounded-lg shadow-lg mb-10"
          />
        </div>
      </main>
    </>
  );
}
