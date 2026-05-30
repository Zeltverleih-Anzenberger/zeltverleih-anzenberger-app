"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  employeeId: string;

  onClose: () => void;

  onSaved: () => void;
};

export default function AddWorkLogModal({
  employeeId,
  onClose,
  onSaved,
}: Props) {

  const [workType, setWorkType] = useState("Aufbau");

  const [workDate, setWorkDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [hours, setHours] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSave() {

    if (!hours) return;

    setLoading(true);

    const { error } = await supabase
      .from("work_logs")
      .insert({
        employee_id: employeeId,

        work_type: workType,

        work_date: workDate,

        hours: Number(hours),

work_year: new Date(workDate).getFullYear(),

      });

    setLoading(false);

    if (error) {

      console.error(error);

      return;
    }

    onSaved();

    onClose();
  }

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-3xl p-10 w-full max-w-xl">

        <h2 className="text-4xl font-bold mb-8">
          Arbeitsstunde hinzufügen
        </h2>

        <div className="space-y-6">

          {/* Arbeitsart */}

          <div>

            <label className="block mb-2 font-medium">
              Arbeitsart
            </label>

            <select
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              className="w-full border rounded-2xl px-4 py-3"
            >

              <option>Aufbau</option>

              <option>Abbau</option>

              <option>Reinigung</option>

              <option>Transport</option>

              <option>Sonstiges</option>

            </select>

          </div>

          {/* Datum */}

          <div>

            <label className="block mb-2 font-medium">
              Datum
            </label>

            <input
              type="date"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              className="w-full border rounded-2xl px-4 py-3"
            />

          </div>

          {/* Stunden */}

          <div>

            <label className="block mb-2 font-medium">
              Stunden
            </label>

            <input
              type="number"
              step="0.25"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full border rounded-2xl px-4 py-3"
              placeholder="z.B. 5"
            />

          </div>

        </div>

        {/* Buttons */}

        <div className="flex justify-end gap-4 mt-10">

          <button
            onClick={onClose}
            className="px-6 py-3 rounded-2xl border"
          >

            Abbrechen

          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-black text-white px-6 py-3 rounded-2xl"
          >

            {loading
              ? "Speichern..."
              : "Speichern"}

          </button>

        </div>

      </div>

    </div>

  );

}