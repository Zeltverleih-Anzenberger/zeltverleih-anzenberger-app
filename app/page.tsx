"use client";

import Link from "next/link";

import {
  CalendarDays,
  ClipboardList,
  Users
} from "lucide-react";

export default function Home() {

  return (

    <main className="min-h-screen bg-white p-12">

      {/* ÜBERSCHRIFT */}

      <div className="text-center mb-20">

        <h1 className="text-6xl font-bold text-black">

          Zeltverleih Anzenberger Intern

        </h1>

      </div>

      {/* GRID */}

      <div className="grid grid-cols-3 gap-10 max-w-7xl mx-auto">

        {/* VERFÜGBARKEIT */}

        <Link
          href="/ZeltverleihAnzenbergerIntern/Verfuegbarkeit"
        >

          <div className="bg-gray-100 rounded-3xl shadow-xl h-[320px] flex flex-col items-center justify-center hover:bg-gray-200 transition cursor-pointer">

            <CalendarDays
              size={80}
              className="mb-8 text-black"
            />

            <h2 className="text-3xl font-bold text-black text-center px-6">

              Verfügbarkeit prüfen

            </h2>

          </div>

        </Link>

        {/* RESERVIERUNGEN */}

        <Link
  href="/ZeltverleihAnzenbergerIntern/Reservierungen"
>

  <div className="bg-gray-100 rounded-3xl shadow-xl h-[320px] flex flex-col items-center justify-center hover:bg-gray-200 transition cursor-pointer">

    <ClipboardList
      size={80}
      className="mb-8 text-black"
    />

    <h2 className="text-3xl font-bold text-black text-center px-6">

      Reservierungen

    </h2>

  </div>

</Link>

        {/* MITARBEITER */}

        <div className="bg-gray-100 rounded-3xl shadow-xl h-[320px] flex flex-col items-center justify-center hover:bg-gray-200 transition">

          <Users
            size={80}
            className="mb-8 text-black"
          />

          <h2 className="text-3xl font-bold text-black text-center px-6">

            Mitarbeiterverwaltung

          </h2>

        </div>

      </div>

    </main>

  );

}