"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/app/lib/supabase";

import ReservationCard from "./ReservationCard";

import EditReservationModal from "./EditReservationModal";

type Reservation = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: string;

  reservation_tents: {
    quantity: number;

    tent_sizes: {
      name: string;
    };

  }[];

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

        id,
        title,
        start_date,
        end_date,
        status,

        reservation_tents (

          quantity,

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

    setReservations(data || []);

    setLoading(false);

  }

  function handlePrint() {

    window.print();

  }

  return (

    <main className="min-h-screen bg-gray-100 p-10">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-10 print:hidden">

        <h1 className="text-5xl font-bold">

          Reservierungen

        </h1>

        <button

          onClick={handlePrint}

          className="bg-black text-white px-6 py-3 rounded-2xl font-semibold hover:bg-gray-800 transition"
        >

          Reservierungsliste drucken

        </button>

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