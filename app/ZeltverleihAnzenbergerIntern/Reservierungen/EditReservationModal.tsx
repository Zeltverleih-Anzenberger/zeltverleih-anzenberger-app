"use client";

import { useState } from "react";

import { supabase } from "@/app/lib/supabase";

type Props = {
  reservation: any;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditReservationModal({
  reservation,
  onClose,
  onSaved,
}: Props) {

  const [title, setTitle] =
    useState(reservation.title);

  const [status, setStatus] =
    useState(reservation.status);

  const [startDate, setStartDate] =
    useState(reservation.start_date);

  const [endDate, setEndDate] =
    useState(reservation.end_date);

  const [setupTime, setSetupTime] =
    useState("");

  const [teardownTime, setTeardownTime] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  async function handleSave() {

    setSaving(true);

    const { error } = await supabase

      .from("reservations")

      .update({

        title,
        status,
        start_date: startDate,
        end_date: endDate,

      })

      .eq("id", reservation.id);

    if (error) {

      console.error(error);

      alert("Fehler beim Speichern");

      setSaving(false);

      return;

    }

    setSaving(false);

    onSaved();

  }

  async function handleCancelReservation() {

    const confirmed = confirm(
      "Reservierung wirklich stornieren?"
    );

    if (!confirmed) return;

    const { error } = await supabase

      .from("reservations")

      .update({

        status: "storniert",

      })

      .eq("id", reservation.id);

    if (error) {

      console.error(error);

      alert("Fehler beim Stornieren");

      return;

    }

    onSaved();

  }

  return (

    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl p-10 max-h-[90vh] overflow-y-auto">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-8">

          <h2 className="text-4xl font-bold">

            Reservierung bearbeiten

          </h2>

          <button

            onClick={onClose}

            className="text-3xl"

          >

            ×

          </button>

        </div>

        {/* FORMULAR */}

        <div className="space-y-8">

          {/* KUNDE */}

          <div>

            <label className="block mb-2 font-semibold">

              Kunde

            </label>

            <input

              value={title}

              onChange={(e) =>
                setTitle(e.target.value)
              }

              className="w-full border rounded-xl p-4"

            />

          </div>

          {/* DATUM */}

          <div className="grid grid-cols-2 gap-6">

            <div>

              <label className="block mb-2 font-semibold">

                Von

              </label>

              <input

                type="date"

                value={startDate}

                onChange={(e) =>
                  setStartDate(e.target.value)
                }

                className="w-full border rounded-xl p-4"

              />

            </div>

            <div>

              <label className="block mb-2 font-semibold">

                Bis

              </label>

              <input

                type="date"

                value={endDate}

                onChange={(e) =>
                  setEndDate(e.target.value)
                }

                className="w-full border rounded-xl p-4"

              />

            </div>

          </div>

          {/* STATUS */}

          <div>

            <label className="block mb-2 font-semibold">

              Status

            </label>

            <select

              value={status}

              onChange={(e) =>
                setStatus(e.target.value)
              }

              className="w-full border rounded-xl p-4"

            >

              <option value="reserviert">

                Reserviert

              </option>

              <option value="storniert">

                Storniert

              </option>

              <option value="abgeschlossen">

                Abgeschlossen

              </option>

            </select>

          </div>

          {/* AUFBAU / ABBAU */}

          <div className="grid grid-cols-2 gap-6">

            <div>

              <label className="block mb-2 font-semibold">

                Aufbauzeit

              </label>

              <input

                type="datetime-local"

                value={setupTime}

                onChange={(e) =>
                  setSetupTime(e.target.value)
                }

                className="w-full border rounded-xl p-4"

              />

            </div>

            <div>

              <label className="block mb-2 font-semibold">

                Abbauzeit

              </label>

              <input

                type="datetime-local"

                value={teardownTime}

                onChange={(e) =>
                  setTeardownTime(e.target.value)
                }

                className="w-full border rounded-xl p-4"

              />

            </div>

          </div>

          {/* MITARBEITER */}

          <div>

            <label className="block mb-2 font-semibold">

              Mitarbeiter-Zuordnung

            </label>

            <div className="border rounded-xl p-6 text-gray-400">

              Mitarbeiterverwaltung folgt später

            </div>

          </div>

        </div>

        {/* BUTTONS */}

        <div className="flex justify-between items-center mt-10">

          <button

            onClick={handleCancelReservation}

            className="bg-red-500 text-white px-6 py-4 rounded-2xl hover:bg-red-600 transition font-semibold"

          >

            Reservierung stornieren

          </button>

          <div className="flex gap-4">

            <button

              onClick={onClose}

              className="bg-gray-200 px-6 py-4 rounded-2xl font-semibold"

            >

              Abbrechen

            </button>

            <button

              onClick={handleSave}

              disabled={saving}

              className="bg-black text-white px-8 py-4 rounded-2xl hover:bg-gray-800 transition font-semibold"

            >

              {saving
                ? "Speichern..."
                : "Speichern"}

            </button>

          </div>

        </div>

      </div>

    </div>

  );

}