"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type WorkLog = {
  id: string;

  work_type: string;

  work_date: string;

  hours: number;

  is_paid: boolean;
};

type Props = {
  employeeId: string;

  employeeName: string;

  onClose: () => void;

  onChanged: () => void;
};

export default function WorkLogsModal({
  employeeId,
  employeeName,
  onClose,
  onChanged,
}: Props) {

  const [logs, setLogs] = useState<WorkLog[]>([]);

  async function loadLogs() {

    const { data, error } = await supabase
      .from("work_logs")
      .select("*")
      .eq("employee_id", employeeId)
      .order("work_date", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setLogs(data || []);
  }

  async function markAsPaid(id: string) {

    const { error } = await supabase
      .from("work_logs")
      .update({
        is_paid: true,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    loadLogs();

    onChanged();
  }

  async function deleteLog(id: string) {

    const confirmed = confirm(
      "Arbeitsstunde wirklich löschen?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("work_logs")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    loadLogs();

    onChanged();
  }

  useEffect(() => {
    loadLogs();
  }, []);

  return (

    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">

      <div className="bg-white rounded-3xl p-8 w-full max-w-4xl">

        <div className="flex justify-between items-center mb-8">

          <h2 className="text-4xl font-bold">

            Arbeitsstunden — {employeeName}

          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black text-xl"
          >
            ✕
          </button>

        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto">

          {logs.length === 0 && (

            <div className="text-gray-500">

              Keine Arbeitsstunden vorhanden.

            </div>

          )}

          {logs.map((log) => (

            <div
              key={log.id}
              className="border rounded-2xl p-5 flex justify-between items-center"
            >

              <div>

                <div className="font-bold text-lg">

                  {log.work_type}

                </div>

                <div className="text-gray-500">

                  {log.work_date}

                </div>

                <div className="mt-2">

                  {Number(log.hours).toFixed(2)} h

                </div>

              </div>

              <div className="flex items-center gap-3">

                <div
                  className={`px-3 py-2 rounded-xl text-sm font-semibold ${
                    log.is_paid
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >

                  {log.is_paid
                    ? "Ausbezahlt"
                    : "Offen"}

                </div>

                {!log.is_paid && (

                  <button
                    onClick={() => markAsPaid(log.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
                  >

                    Ausbezahlen

                  </button>

                )}

                <button
                  onClick={() => deleteLog(log.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition"
                >

                  Löschen

                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}