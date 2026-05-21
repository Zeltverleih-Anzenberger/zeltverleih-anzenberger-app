"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function Home() {

  const [message, setMessage] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedTent, setSelectedTent] = useState("");

  const [tentSizes, setTentSizes] = useState<any[]>([]);

  useEffect(() => {

    loadTentSizes();

  }, []);

  async function loadTentSizes() {

    const { data } = await supabase
      .from("tent_sizes")
      .select("*")
      .order("name");

    if (data) {
      setTentSizes(data);
    }

  }

  return (
    <main className="min-h-screen bg-gray-100 p-10">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-5xl font-bold mb-10">
          Zeltverleih Anzenberger
        </h1>

        <div className="bg-white rounded-2xl shadow p-8">

          <h2 className="text-2xl font-semibold mb-6">
            Verfügbarkeit prüfen
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>
              <label className="block mb-2 font-medium">
                Von
              </label>

              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Bis
              </label>

              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border rounded-lg p-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Zeltgröße
              </label>

              <select
                value={selectedTent}
                onChange={(e) => setSelectedTent(e.target.value)}
                className="w-full border rounded-lg p-3"
              >

                <option value="">
                  Bitte auswählen
                </option>

                {tentSizes.map((tent) => (

                  <option
                    key={tent.id}
                    value={tent.name}
                  >
                    {tent.name}
                  </option>

                ))}

              </select>
            </div>

          </div>

          <button
            onClick={() => {

              setMessage(
                `Prüfe ${selectedTent} von ${fromDate} bis ${toDate}`
              );

            }}
            className="mt-6 bg-black text-white px-6 py-3 rounded-xl"
          >
            Verfügbarkeit prüfen
          </button>

          {message && (

            <div className="mt-6 p-4 bg-green-100 rounded-xl">
              {message}
            </div>

          )}

        </div>

      </div>

    </main>
  );
}