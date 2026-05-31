"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type WorkLog = {
  id: string;

  work_type: string;

  work_date: string;

  hours: number;

  is_paid: boolean;
};

type Props = {
  workLog?: WorkLog;
  employeeId: string;

  onClose: () => void;

  onSaved: () => void;
};

export default function EditWorkLogModal({
  workLog,
  onClose,
  onSaved,
employeeId,
}: Props) {

  const [workType, setWorkType] = useState(
  workLog?.work_type || "Aufbau"
);

  const [workDate, setWorkDate] = useState(
  workLog?.work_date ||
    new Date().toISOString().split("T")[0]
);

  const [hours, setHours] = useState(
  workLog?.hours || 0
);

  const [isPaid, setIsPaid] = useState(
  workLog?.is_paid || false
);

  const [loading, setLoading] = useState(false);

  async function handleSave() {

    setLoading(true);

    let error = null;

if (workLog?.id) {

  const result = await supabase
    .from("work_logs")
    .update({
      work_type: workType,
      work_date: workDate,
      hours,
      is_paid: isPaid,
    })
    .eq("id", workLog.id);

  error = result.error;

} else {

  const result = await supabase
    .from("work_logs")
    .insert({
      employee_id: employeeId,
      work_type: workType,
      work_date: workDate,
      hours,
      is_paid: isPaid,
      work_year: new Date(workDate).getFullYear(),
    });

  error = result.error;

}

    setLoading(false);

    if (error) {
      console.error(error);
      return;
    }

    onSaved();
  }

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-3xl p-10 w-full max-w-2xl">

        <h2 className="text-2xl font-black mb-8">
          {workLog
  ? "Arbeitsstunde bearbeiten"
  : "Arbeitsstunde hinzufügen"}
        </h2>

        <div className="space-y-6">

          <div>
            <label className="block mb-2 font-semibold">
              Arbeitsart
            </label>

            <select
              value={workType}
              onChange={(e) => setWorkType(e.target.value)}
              className="w-full border rounded-2xl px-5 py-4"
            >
              <option value="Aufbau">Aufbau</option>
              <option value="Abbau">Abbau</option>
              <option value="Fahrt">Fahrt</option>
              <option value="Lager">Lager</option>
              <option value="Sonstiges">Sonstiges</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Datum
            </label>

            <input
              type="date"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              className="w-full border rounded-2xl px-5 py-4"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              Stunden
            </label>

            <input
              type="number"
              step="0.25"
              value={hours}
              onChange={(e) =>
                setHours(Number(e.target.value))
              }
              className="w-full border rounded-2xl px-5 py-4"
            />
          </div>

          <div className="flex items-center gap-3">

            <input
              type="checkbox"
              checked={isPaid}
              onChange={(e) =>
                setIsPaid(e.target.checked)
              }
            />

            <label className="font-semibold">
              Bereits ausbezahlt
            </label>

          </div>

        </div>

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
            className="bg-black text-white px-6 py-3 rounded-2xl font-bold"
          >
            Speichern
          </button>

        </div>

      </div>

    </div>

  );

}