"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

import ReservationCard from "./ReservationCard";

import EditReservationModal from "./EditReservationModal";

import { ArrowLeft } from "lucide-react";

type Reservation = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: string;

  reservation_tents: Array<{
    quantity: number;

    tent_sizes: {
      name: string;
    } | null;
  }>;
};


export default function ReservierungenPage() {

  const [reservations, setReservations] =
    useState<Reservation[]>([]);

  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    loadReservations();

  }, []);

  async function loadReservations() {

    setLoading(true);

    const { data, error } = await supabase

  .from("reservations")

  .select(`
    *,
    reservation_tents (
      *,
      tent_sizes (
        name
      )
    )
  `)

  .order("start_date", {
    ascending: true,
  });

    if (error) {

      console.error(error);

      setLoading(false);

      return;

    }

    setReservations((data ?? []) as Reservation[]);

    setLoading(false);

  }

  function handlePrint() {

    window.print();

  }

  return (

    <main className="min-h-screen bg-gray-100 p-10">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-10 print:hidden">

  {/* LINKE SEITE */}

  <div className="flex items-center gap-4">

    <button

      onClick={() => window.location.href = "/"}

      className="bg-white border border-gray-300 p-3 rounded-2xl hover:bg-gray-100 transition shadow-sm"
    >

      <ArrowLeft size={28} />

    </button>

    <h1 className="text-5xl font-bold">

      Reservierungen

    </h1>

  </div>

  {/* RECHTE SEITE */}

  <div className="flex gap-4">

    {/* NEUE RESERVIERUNG */}

    <button

      className="bg-green-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-green-700 transition"
    >

      Neue Reservierung

    </button>

    {/* DRUCKEN */}

    <button

      onClick={handlePrint}

      className="bg-black text-white px-6 py-3 rounded-2xl font-semibold hover:bg-gray-800 transition"
    >

      Reservierungsliste drucken

    </button>

  </div>

</div>

      {/* LISTE */}

      <div className="space-y-4">

        {loading && (

          <div className="bg-white rounded-2xl p-6 shadow">

            Lade Reservierungen...

          </div>

        )}

        {!loading && reservations.length === 0 && (

          <div className="bg-white rounded-2xl p-6 shadow">

            Keine Reservierungen gefunden.

          </div>

        )}

        {reservations.map((reservation) => (

          <ReservationCard

            key={reservation.id}

            reservation={reservation}

            onEdit={() =>
              setSelectedReservation(reservation)
            }

          />

        ))}

      </div>

      {/* MODAL */}

      {selectedReservation && (

        <EditReservationModal

          reservation={selectedReservation}

          onClose={() =>
            setSelectedReservation(null)
          }

          onSaved={() => {

            setSelectedReservation(null);

            loadReservations();

          }}

        />

      )}

    </main>

  );

}