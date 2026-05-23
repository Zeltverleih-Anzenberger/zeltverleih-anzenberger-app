"use client";

import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

type RequestedTent = {
  tent_size_id: string;
  quantity: number;
};

export default function Home() {

  const [message, setMessage] =
    useState("");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [requestedTents, setRequestedTents] =
    useState<RequestedTent[]>([
      {
        tent_size_id: "",
        quantity: 1
      }
    ]);

  const [tentSizes, setTentSizes] =
    useState<any[]>([]);

  const [selectedConflict, setSelectedConflict] =
    useState<any>(null);

  const [tentResults, setTentResults] =
    useState<any[]>([]);

  const [combinationResult, setCombinationResult] =
    useState<any>(null);

  useEffect(() => {

    loadTentSizes();

  }, []);

  async function loadTentSizes() {

    const { data, error } =
      await supabase
        .from("tent_sizes")
        .select("*")
        .order("name");

    if (error) {

      console.error(error);
      return;

    }

    if (data) {

      setTentSizes(data);

    }

  }

  function addTent() {

    setRequestedTents([
      ...requestedTents,
      {
        tent_size_id: "",
        quantity: 1
      }
    ]);

  }

  function updateTent(
    index: number,
    field: string,
    value: any
  ) {

    const updated =
      [...requestedTents];

    updated[index] = {
      ...updated[index],
      [field]: value
    };

    setRequestedTents(updated);

  }

  async function checkAvailability() {

    setMessage("");
    setTentResults([]);
    setCombinationResult(null);

    if (!fromDate || !toDate) {

      setMessage(
        "Bitte Zeitraum wählen."
      );

      return;

    }

    const validTents =
      requestedTents.filter(
        (t) => t.tent_size_id
      );

    if (
      validTents.length === 0
    ) {

      setMessage(
        "Bitte mindestens ein Zelt wählen."
      );

      return;

    }

    // =========================
    // MATERIALZUORDNUNGEN
    // =========================

    const {
      data: tentSizeMaterials,
      error: tentSizeMaterialsError
    } = await supabase
      .from("tent_size_materials")
      .select("*");

    if (
      tentSizeMaterialsError ||
      !tentSizeMaterials
    ) {

      setMessage(
        "Materialdaten konnten nicht geladen werden."
      );

      return;

    }

    // =========================
    // MATERIALBESTAND
    // =========================

    const {
      data: materials,
      error: materialsError
    } = await supabase
      .from("materials")
      .select("*");

    if (
      materialsError ||
      !materials
    ) {

      setMessage(
        "Materiallager konnte nicht geladen werden."
      );

      return;

    }

    // =========================
    // RESERVIERUNGEN
    // =========================

    const {
      data: reservations,
      error: reservationsError
    } = await supabase
      .from("reservations")
      .select("*");

    const {
      data: reservationTents,
      error: reservationTentsError
    } = await supabase
      .from("reservation_tents")
      .select("*");

    if (
      reservationsError ||
      reservationTentsError ||
      !reservations ||
      !reservationTents
    ) {

      setMessage(
        "Reservierungen konnten nicht geladen werden."
      );

      return;

    }

    // =========================
    // ZEITRAUM
    // =========================

    const requestStart =
      new Date(fromDate);

    const requestEnd =
      new Date(toDate);

    // =========================
    // ÜBERLAPPENDE RESERVIERUNGEN
    // =========================

    const overlappingReservations =
      reservations.filter(
        (reservation: any) => {

          const reservationStart =
            new Date(
              reservation.start_date
            );

          const reservationEnd =
            new Date(
              reservation.end_date
            );

          return (
            reservationStart <=
              requestEnd &&
            reservationEnd >=
              requestStart
          );

        }
      );

// =========================
// GLOBALER ALLOCATOR POOL
// =========================

const allocatorPool:
  Record<string, number> = {};

materials.forEach((material: any) => {

  allocatorPool[
    material.name
  ] = Number(
    material.stock || 0
  );

});

// =========================
// RESERVIERUNGEN ABZIEHEN
// =========================

for (
  const reservation
  of overlappingReservations
) {

  const tentsForReservation =
    reservationTents.filter(
      (rt: any) =>
        String(
          rt.reservation_id
        ) ===
        String(reservation.id)
    );

  for (
    const reservedTent
    of tentsForReservation
  ) {

    const materialsForReservedTent =
      tentSizeMaterials.filter(
        (m: any) =>
          String(m.tent_size_id)
          ===
          String(
            reservedTent.tent_size_id
          )
      );

    for (
      const material
      of materialsForReservedTent
    ) {

      const key =
        String(
          material.material_name
        ).trim();

      const quantity =
        Number(material.quantity)
        *
        Number(
          reservedTent.quantity
        );

      if (
        allocatorPool[key]
        === undefined
      ) {

        allocatorPool[key] = 0;

      }

      allocatorPool[key] -= quantity;

      if (
        !reservationUsage[key]
      ) {

        reservationUsage[key] = [];

      }

      reservationUsage[key].push({

        reservation:
          reservation.title ||
          reservation.customer_name ||
          "Reservierung",

        start:
          reservation.start_date,

        end:
          reservation.end_date,

        quantity

      });

    }

  }

}

// =========================
// MATERIALGRUPPEN
// =========================

const materialGroups:
  Record<string, any[]> = {};

materials.forEach((material: any) => {

  const group =
    material.alternative_group;

  if (!group) {
    return;
  }

  if (
    !materialGroups[group]
  ) {

    materialGroups[group] = [];

  }

  materialGroups[group].push(
    material
  );

});

// =========================
// PRIORITY SORTIEREN
// =========================

Object.keys(materialGroups)
  .forEach((group) => {

    materialGroups[group].sort(
      (
        a: any,
        b: any
      ) =>
        Number(a.priority || 999)
        -
        Number(b.priority || 999)
    );

  });

// =========================
// EINZELZELT-PRÜFUNG
// =========================

const singleTentResults:
  any[] = [];

for (
  const requestedTent
  of validTents
) {

  const tent =
    tentSizes.find(
      (t) =>
        String(t.id)
        ===
        String(
          requestedTent.tent_size_id
        )
    );

  const tentMaterials =
    tentSizeMaterials.filter(
      (m: any) =>
        String(m.tent_size_id)
        ===
        String(
          requestedTent.tent_size_id
        )
    );

  const tentConflicts:
    any[] = [];

  const usedAlternatives:
    any[] = [];

  // =========================
  // MATERIALIEN
  // =========================

  for (
    const material
    of tentMaterials
  ) {

    const originalName =
      String(
        material.material_name
      ).trim();

    const required =
      Number(material.quantity)
      *
      Number(
        requestedTent.quantity
      );

    const originalMaterial =
      materials.find(
        (m: any) =>
          String(m.name)
            .trim()
            .toLowerCase()
          ===
          originalName
            .trim()
            .toLowerCase()
      );

    if (!originalMaterial) {
      continue;
    }

    const group =
      originalMaterial
        .alternative_group;

    let alternatives:
      any[] = [];

    if (
      group &&
      materialGroups[group]
    ) {

      alternatives =
        materialGroups[group];

    } else {

      alternatives = [
        originalMaterial
      ];

    }

    let stillNeeded =
      required;

    // =========================
    // ALTERNATIVEN DURCHGEHEN
    // =========================

    for (
      const alternative
      of alternatives
    ) {

      const altName =
        String(
          alternative.name
        ).trim();

      const available =
        allocatorPool[
          altName
        ] || 0;

      if (
        available <= 0
      ) {

        continue;

      }

      const used =
        Math.min(
          available,
          stillNeeded
        );

      allocatorPool[
        altName
      ] -= used;

      stillNeeded -= used;

      // =========================
      // ALTERNATIVE VERWENDET
      // =========================

      if (
        altName
        !==
        originalName
      ) {

        usedAlternatives.push({

          original:
            originalName,

          alternative:
            altName,

          quantity:
            used

        });

      }

      if (
        stillNeeded <= 0
      ) {

        break;

      }

    }

    // =========================
    // KONFLIKT
    // =========================

    if (
      stillNeeded > 0
    ) {

      tentConflicts.push({

        material:
          originalName,

        benötigt:
          required,

        verfügbar:
          required -
          stillNeeded,

        fehlt:
          stillNeeded,

        reservierungen:
          reservationUsage[
            originalName
          ] || []

      });

    }

  }

  // =========================
  // STATUS
  // =========================

  let status =
    "Verfügbar";

  if (
    tentConflicts.length > 0
  ) {

    status =
      "Konflikt";

  } else if (
    usedAlternatives.length > 0
  ) {

    status =
      "Verfügbar mit Alternativen";

  }

  // =========================
  // ZELTALTERNATIVEN
  // =========================

  const alternatives:
    string[] = [];

  if (
    tentConflicts.length > 0
  ) {
  if (!tent?.name) {
    continue;
  }
    const currentName =
      String(
        tent?.name
      );

    const split =
      currentName.split("x");

    if (
      split.length === 2
    ) {

      const currentWidth =
        Number(split[0]);

      const currentLength =
        Number(split[1]);

      for (
        const alternativeTent
        of tentSizes
      ) {

        const alternativeName =
          String(
            alternativeTent.name
          );

        const altSplit =
          alternativeName.split("x");

        if (
          altSplit.length !== 2
        ) {

          continue;

        }

        const altWidth =
          Number(
            altSplit[0]
          );

        const altLength =
          Number(
            altSplit[1]
          );

        if (
          altWidth !==
          currentWidth
        ) {

          continue;

        }

        if (
          altLength >=
          currentLength
        ) {

          continue;

        }

        alternatives.push(
          alternativeTent.name
        );

      }

    }

  }

  singleTentResults.push({

    tent:
      tent?.name ||
      "Unbekannt",

    status,

    conflicts:
      tentConflicts,

    alternatives,

    usedAlternatives

  });

}

// =========================
// GESAMTSTATUS
// =========================

let combinationStatus =
  "Verfügbar";

if (
  singleTentResults.some(
    (r: any) =>
      r.status ===
      "Konflikt"
  )
) {

  combinationStatus =
    "Nicht verfügbar";

}

setTentResults(
  singleTentResults
);

setCombinationResult({

  status:
    combinationStatus

});

if (
  combinationStatus
  ===
  "Verfügbar"
) {

  setMessage(
    "Kombination verfügbar"
  );

} else {

  setMessage(
    "Konflikte gefunden"
  );

}

  return (

    <main className="min-h-screen bg-gray-100 p-10">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-5xl font-bold mb-10">
          Zeltverleih Anzenberger
        </h1>

        <div className="bg-white rounded-2xl shadow p-8">

          <h2 className="text-2xl font-semibold mb-6">
            Verfügbarkeit prüfen
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

            <div>

              <label className="block mb-2 font-medium">
                Von
              </label>

              <input
                type="date"
                value={fromDate}
                onChange={(e) =>
                  setFromDate(
                    e.target.value
                  )
                }
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
                onChange={(e) =>
                  setToDate(
                    e.target.value
                  )
                }
                className="w-full border rounded-lg p-3"
              />

            </div>

          </div>

          <div className="space-y-4">

            {requestedTents.map(
              (tent, index) => (

                <div
                  key={index}
                  className="grid grid-cols-2 gap-4"
                >

                  <select
                    value={
                      tent.tent_size_id
                    }
                    onChange={(e) =>
                      updateTent(
                        index,
                        "tent_size_id",
                        e.target.value
                      )
                    }
                    className="border rounded-lg p-3"
                  >

                    <option value="">
                      Zelt wählen
                    </option>

                    {tentSizes.map(
                      (size) => (

                        <option
                          key={size.id}
                          value={size.id}
                        >
                          {size.name}
                        </option>

                      )
                    )}

                  </select>

                  <input
                    type="number"
                    min="1"
                    value={tent.quantity}
                    onChange={(e) =>
                      updateTent(
                        index,
                        "quantity",
                        e.target.value
                      )
                    }
                    className="border rounded-lg p-3"
                  />

                </div>

              )
            )}

          </div>

          <button
            onClick={addTent}
            className="mt-4 border px-4 py-2 rounded-lg"
          >
            + Weiteres Zelt
          </button>

          <div>

            <button
              onClick={checkAvailability}
              className="mt-6 bg-black text-white px-6 py-3 rounded-xl"
            >
              Verfügbarkeit prüfen
            </button>

          </div>

          {message && (

            <div className="mt-6 p-4 bg-green-100 rounded-xl">

              <p className="font-bold mb-6">
                {message}
              </p>

              <div className="mb-8">

                <h3 className="text-xl font-bold mb-4">
                  Einzelprüfung
                </h3>

                <div className="space-y-4">

                  {tentResults.map(
                    (
                      result,
                      index
                    ) => (

                      <div
                        key={index}
                        className="border rounded-xl p-4 bg-white flex justify-between items-center"
                      >

                        <div>

                          <p className="font-bold">
                            {result.tent}
                          </p>

                          <p
                            className={
                              result.status ===
                              "Verfügbar"
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {result.status}
                          </p>

                        </div>

                        {
                          result.status ===
                          "Konflikt" && (

                            <button
                              onClick={() =>
                                setSelectedConflict(
                                  result
                                )
                              }
                              className="bg-black text-white px-4 py-2 rounded-lg"
                            >
                              Details
                            </button>

                          )
                        }

                      </div>

                    )
                  )}

                </div>

              </div>

              <div className="mb-8">

                <h3 className="text-xl font-bold mb-4">
                  Gesamtprüfung
                </h3>

                <div className="border rounded-xl p-4 bg-white">

                  <p
                    className={
                      combinationResult?.status ===
                      "Verfügbar"
                        ? "text-green-600 font-bold"
                        : "text-red-600 font-bold"
                    }
                  >
                    Kombination:
                    {" "}
                    {combinationResult?.status}
                  </p>

                </div>

              </div>

            </div>

          )}

        </div>

      </div>

      {/* MODAL */}

      {selectedConflict && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white p-8 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-2xl font-bold">
                Konfliktdetails
              </h2>

              <button
                onClick={() =>
                  setSelectedConflict(
                    null
                  )
                }
                className="text-xl"
              >
                ✕
              </button>

            </div>

            <div className="space-y-6">

              <div>

                <p className="font-bold text-2xl">
                  {selectedConflict.tent}
                </p>

                <p className="text-red-600 font-semibold">
                  Konflikt
                </p>

              </div>

              {/* FEHLENDE MATERIALIEN */}

              <div className="border rounded-xl p-5">

                <h3 className="font-bold text-lg mb-4">
                  Fehlende Materialien
                </h3>

                <div className="space-y-4">

                  {selectedConflict.conflicts.map(
                    (
                      conflict: any,
                      index: number
                    ) => (

                      <div
                        key={index}
                        className="pb-3 border-b last:border-b-0"
                      >

                        <p className="font-bold text-lg">
                          {conflict.material}
                        </p>

                        <div className="mt-1 text-sm">

                          <p>
                            {conflict.benötigt}
                            {" "}
                            benötigt
                            {" / "}
                            {conflict.verfügbar}
                            {" "}
                            verfügbar
                            {" / "}
                            <span className="text-red-600 font-semibold">
                              {conflict.fehlt}
                              {" "}
                              fehlt
                            </span>
                          </p>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

              {/* RESERVIERUNGEN */}

              <div className="border rounded-xl p-5">

                <h3 className="font-bold text-lg mb-4">
                  Blockierende Reservierungen
                </h3>

                <div className="space-y-4">

                  {Object.values(

                    selectedConflict.conflicts.reduce(
                      (
                        grouped: any,
                        conflict: any
                      ) => {

                        conflict.reservierungen.forEach(
                          (reservation: any) => {

                            const key =
                              `${reservation.reservation}-${reservation.start}-${reservation.end}`;

                            if (!grouped[key]) {

                              grouped[key] = {
                                reservation:
                                  reservation.reservation,
                                start:
                                  reservation.start,
                                end:
                                  reservation.end,
                                materials: []
                              };

                            }

                            grouped[key].materials.push({
                              material:
                                conflict.material,
                              quantity:
                                reservation.quantity
                            });

                          }
                        );

                        return grouped;

                      },
                      {}
                    )

                  ).map(
                    (
                      reservationGroup: any,
                      index: number
                    ) => (

                      <div
                        key={index}
                        className="border rounded-lg p-4"
                      >

                        <p className="font-bold text-lg">
                          {reservationGroup.reservation}
                        </p>

                        <p className="text-sm text-gray-600">
                          {reservationGroup.start}
                          {" "}
                          bis
                          {" "}
                          {reservationGroup.end}
                        </p>

                        <div className="mt-4 space-y-2">

                          {reservationGroup.materials.map(
                            (
                              material: any,
                              mIndex: number
                            ) => (

                              <div
                                key={mIndex}
                                className="flex justify-between border-b pb-2"
                              >

                                <span>
                                  {material.material}
                                </span>

                                <span className="font-semibold">
                                  {material.quantity}
                                </span>

                              </div>

                            )
                          )}

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

              {/* ZELTALTERNATIVEN */}

              <div className="border rounded-xl p-5">

                <h3 className="font-bold text-lg mb-4">
                  Mögliche Zeltalternativen
                </h3>

                {
                  selectedConflict.alternatives
                    ?.length === 0 && (

                    <p>
                      Keine passenden Alternativen verfügbar.
                    </p>

                  )
                }

                <div className="space-y-2">

                  {
                    selectedConflict.alternatives
                      ?.map(
                        (
                          alternative: any,
                          index: number
                        ) => (

                          <div
                            key={index}
                            className="border rounded-lg p-3"
                          >

                            <p className="font-bold">
                              {alternative}
                            </p>

                          </div>

                        )
                      )
                  }

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </main>

  );

}
}
