"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

import EditWorkLogModal from "./EditWorkLogModal";


type WorkLog = {
  id: string;

  work_type: string;

  work_date: string;

  hours: number;

  is_paid: boolean;

  payout_id?: string | null;
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
  const [payouts, setPayouts] = useState<any[]>([]);

  const [selectedWorkLog, setSelectedWorkLog] = useState<any>(null);

  const [filter, setFilter] = useState<
  "all" | "open" | "paid"
>("all");

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

  async function loadPayouts() {

    console.log("EMPLOYEE:", employeeId);

  const { data, error } = await supabase
    .from("payouts")
    .select("*")
    .eq("employee_id", employeeId)
    .order("payout_date", {
      ascending: false,
    });

  if (error) {
    console.error(error);
    return;
  }

  console.log("PAYOUTS GELADEN:", data);

  setPayouts(data || []);
}

  async function markAsPaid(log: any) {


  const today = new Date()
    .toISOString()
    .split("T")[0];

  const { data: payout, error: payoutError } =
    await supabase
      .from("payouts")
      .insert({
        employee_id: employeeId,
        payout_date: today,
        hours_paid: Number(log.hours),
        notes: "Einzelauszahlung",
      })
      .select()
      .single();

  if (payoutError) {
    console.error(payoutError);
    return;
  }

  const { error } = await supabase
    .from("work_logs")
    .update({
      is_paid: true,
      status: "ausbezahlt",
      payout_id: payout.id,
    })
    .eq("id", log.id);

  if (error) {
  console.error(error);
  return;
}

  loadLogs();

  loadPayouts();

  onChanged();
}

async function payAllOpenHours() {

  const openLogs = logs.filter(
    (log) => !log.is_paid
  );

  if (openLogs.length === 0) {
    alert("Keine offenen Stunden vorhanden.");
    return;
  }

  const totalHours = openLogs.reduce(
    (sum, log) => sum + Number(log.hours),
    0
  );

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const { data: payout, error: payoutError } =
    await supabase
      .from("payouts")
      .insert({
        employee_id: employeeId,
        payout_date: today,
        hours_paid: totalHours,
        notes: "Sammelauszahlung",
      })
      .select()
      .single();

  if (payoutError) {
    console.error(payoutError);
    return;
  }

  const ids = openLogs.map(
    (log) => log.id
  );

  const { error } = await supabase
    .from("work_logs")
    .update({
      is_paid: true,
      status: "ausbezahlt",
      payout_id: payout.id,
    })
    .in("id", ids);

  if (error) {
    console.error(error);
    return;
  }

  loadLogs();
  loadPayouts();
  onChanged();
}

async function markAsOpen(log: any) {

  const payoutId = log.payout_id;

  const { error } = await supabase
    .from("work_logs")
    .update({
      is_paid: false,
      status: "offen",
      payout_id: null,
    })
    .eq("id", log.id);

  if (error) {
    console.error(error);
    return;
  }

  if (payoutId) {

    const { data: remainingLogs, error: logsError } =
      await supabase
        .from("work_logs")
        .select("hours")
        .eq("payout_id", payoutId);

    if (logsError) {
      console.error(logsError);
      return;
    }

    const remainingHours =
      remainingLogs?.reduce(
        (sum, item) => sum + Number(item.hours),
        0
      ) || 0;

    const { error: payoutError } =
      await supabase
        .from("payouts")
        .update({
          hours_paid: remainingHours,
        })
        .eq("id", payoutId);

    if (payoutError) {
      console.error(payoutError);
      return;
    }
  }

  loadLogs();
  loadPayouts();
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
      .eq("id",id);

    if (error) {
      console.error(error);
      return;
    }

    loadLogs();

    loadPayouts();

    onChanged();
  }

  useEffect(() => {
  loadLogs();
  loadPayouts();
}, []);

  const groupedLogs = [...logs]
  .filter((log) => {
    if (filter === "open") {
      return !log.is_paid;
    }

    if (filter === "paid") {
      return log.is_paid;
    }

    return true;
  })
  .sort(
    (a, b) =>
      new Date(b.work_date).getTime() -
      new Date(a.work_date).getTime()
  )
  .reduce((groups: any, log) => {

    const month = new Date(log.work_date)
      .toLocaleDateString("de-DE", {
        month: "long",
        year: "numeric",
      });

    if (!groups[month]) {
      groups[month] = [];
    }

    groups[month].push(log);

    return groups;

  }, {});



  return (

    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">

      <div className="bg-white rounded-3xl p-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto">

        <div className="mb-8">

  <div className="flex justify-between items-center">

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

  <div className="flex justify-end mt-8 mb-6">

    <button
      onClick={() => setSelectedWorkLog({})}
      className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition"
    >
      + Arbeitsstunde
    </button>

  </div>

</div>

<div className="flex gap-3 mb-6">

  <button
    onClick={() => setFilter("all")}
    className={`px-4 py-2 rounded-xl font-semibold transition ${
      filter === "all"
        ? "bg-black text-white"
        : "bg-gray-100"
    }`}
  >
    Alle
  </button>

  <button
    onClick={() => setFilter("open")}
    className={`px-4 py-2 rounded-xl font-semibold transition ${
      filter === "open"
        ? "bg-orange-500 text-white"
        : "bg-orange-100 text-orange-600"
    }`}
  >
    Offen
  </button>

  <button
    onClick={() => setFilter("paid")}
    className={`px-4 py-2 rounded-xl font-semibold transition ${
      filter === "paid"
        ? "bg-green-600 text-white"
        : "bg-green-100 text-green-700"
    }`}
  >
    Ausbezahlt
  </button>

</div>

<div className="grid grid-cols-3 gap-4 mb-6">

  <div className="bg-gray-100 rounded-2xl p-4">
    <p className="text-sm text-gray-500">
      Gesamtstunden
    </p>

    <p className="text-2xl font-bold mt-1">
      {logs
        .reduce((sum, log) => sum + Number(log.hours), 0)
        .toFixed(2)} h
    </p>
  </div>

  <div className="bg-orange-50 rounded-2xl p-4">
    <p className="text-sm text-orange-500">
      Offen
    </p>

    <p className="text-2xl font-bold mt-1 text-orange-600">
      {logs
        .filter((log) => !log.is_paid)
        .reduce((sum, log) => sum + Number(log.hours), 0)
        .toFixed(2)} h
    </p>
  </div>

  <div className="bg-green-50 rounded-2xl p-4">
    <p className="text-sm text-green-500">
      Ausbezahlt
    </p>

    <p className="text-2xl font-bold mt-1 text-green-600">
      {logs
        .filter((log) => log.is_paid)
        .reduce((sum, log) => sum + Number(log.hours), 0)
        .toFixed(2)} h
    </p>
  </div>

</div>

<div className="mb-8">

  <button
    onClick={payAllOpenHours}
    className="bg-green-700 text-white px-6 py-4 rounded-2xl font-bold hover:bg-green-800 transition"
  >
    Alle offenen Stunden auszahlen
  </button>

</div>

        <div className="space-y-4 pr-2">

          {logs.length === 0 && (

            <div className="text-gray-500">

              Keine Arbeitsstunden vorhanden.

            </div>

          )}

          {Object.entries(groupedLogs).map(
  ([month, monthLogs]: any) => {

    const monthTotal = monthLogs.reduce(
  (sum: number, log: any) => sum + log.hours,
  0
);

const monthPaid = monthLogs
  .filter((log: any) => log.is_paid)
  .reduce(
    (sum: number, log: any) => sum + log.hours,
    0
  );

const monthOpen = monthLogs
  .filter((log: any) => !log.is_paid)
  .reduce(
    (sum: number, log: any) => sum + log.hours,
    0
  );

    return (

      <div key={month} className="mb-8">

        <div className="mb-4">

          <h3 className="text-2xl font-black mt-2 capitalize">
            {month}
          </h3>

          <div className="flex gap-4 mt-4 mb-8 flex-wrap">

          <div className="grid md:grid-cols-3 gap-4 mt-4 mb-6">

  <div className="bg-gray-100 rounded-2xl p-4 w-[180px]">
    <p className="text-sm text-gray-500">
      Gesamt
    </p>

    <p className="text-2xl font-black mt-2">
      {monthTotal.toFixed(2)} h
    </p>
  </div>

  <div className="bg-orange-50 rounded-2xl p-4 w-[180px]">
    <p className="text-sm text-orange-500">
      Offen
    </p>

    <p className="text-2xl font-black mt-2 text-orange-600">
      {monthOpen.toFixed(2)} h
    </p>
  </div>

  <div className="bg-green-50 rounded-2xl p-4 w-[180px]">
    <p className="text-sm text-green-500">
      Ausbezahlt
    </p>

    <p className="text-2xl font-black mt-2 text-green-600">
      {monthPaid.toFixed(2)} h
    </p>
  </div>

</div>
</div>


        </div>

        <div className="space-y-4">

         {monthLogs.map((log: any) => {

  return (

    <div
      key={log.id}
      className="border rounded-3xl p-6 flex justify-between items-center"
    >

      <div className="flex items-center gap-3 flex-wrap">

        <span className="font-bold text-3xl">
          {log.work_type}
        </span>

        <span className="text-gray-400">•</span>

        <span className="text-gray-500 font-semibold">
          {new Date(log.work_date).toLocaleDateString("de-DE")}
        </span>

        <span className="text-gray-400">•</span>

        <span className="font-bold text-2xl">
          {Number(log.hours).toFixed(2)} h
        </span>

      </div>

      <div className="flex items-center gap-3">

        <div
          className={`px-4 py-2 rounded-2xl text-sm font-bold ${
            log.is_paid
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-600"
          }`}
        >
          {log.is_paid
            ? "Ausbezahlt"
            : "Offen"}
        </div>

        {!log.is_paid ? (
  <button
    onClick={() => markAsPaid(log)}
    className="bg-green-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-green-700 transition"
  >
    Ausbezahlen
  </button>
) : (
  <button
    onClick={() => markAsOpen(log)}
    className="bg-orange-500 text-white px-5 py-3 rounded-2xl font-bold hover:bg-orange-600 transition"
  >
    Wieder öffnen
  </button>
)}

        <button
          onClick={() => setSelectedWorkLog(log)}
          className="bg-blue-500 text-white px-5 py-3 rounded-2xl font-bold hover:bg-blue-600 transition"
        >
          Bearbeiten
        </button>

        <button
          onClick={() => deleteLog(log.id)}
          className="bg-red-500 text-white px-5 py-3 rounded-2xl font-bold hover:bg-red-600 transition"
        >
          Löschen
        </button>

      </div>

    </div>

  );

})}

        </div>

      </div>

      

    );

  })}

{/* Auszahlungshistorie */}

<div className="mt-12 border-t pt-8">

  <h3 className="text-3xl font-black mb-6">
    Auszahlungen
  </h3>

  {payouts.length === 0 && (
    <div className="text-gray-500">
      Noch keine Auszahlungen vorhanden.
    </div>
  )}

  {payouts.map((payout) => (

    <div
      key={payout.id}
      className="border rounded-3xl p-5 mb-4"
    >

      <div className="font-bold text-xl">
        {new Date(
          payout.payout_date
        ).toLocaleDateString("de-DE")}
      </div>

      <div className="mt-2 text-lg">
        {Number(
          payout.hours_paid
        ).toFixed(2)} h
      </div>

      <div className="text-gray-500 mt-1">
        {payout.notes}
      </div>

    </div>

  ))}

</div>

{selectedWorkLog && (
  <EditWorkLogModal
    workLog={selectedWorkLog}
    employeeId={employeeId}
    onClose={() => setSelectedWorkLog(null)}
    onSaved={() => {
      setSelectedWorkLog(null);
      loadLogs();
      loadPayouts();
      onChanged();
    }}
  />
)}

        </div>

      </div>

    </div>

  );

}