"use client";

import WorkLogsModal from "./WorkLogsModal";

import { useEffect, useState } from "react";

import {
  ArrowLeft,
  Plus
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import EmployeeCard from "./EmployeeCard";

import EditEmployeeModal from "./EditEmployeeModal";

type Employee = {
  id: string;

  first_name: string;

  last_name: string;

  phone: string | null;

  email: string | null;

  active: boolean;

  total_hours?: number;

  paid_hours?: number;

  open_hours?: number;
};

export default function MitarbeiterverwaltungPage() {

  const [employees, setEmployees] =
    useState<Employee[]>([]);

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [logsEmployee, setLogsEmployee] = 
    useState<Employee | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    loadEmployees();

  }, []);

  async function loadEmployees() {

    setLoading(true);

    const { data, error } = await supabase

      .from("employees")
.select(`
  *,
  work_logs (
    hours,
    is_paid
  )
`)

      .order("last_name", {
        ascending: true,
      });

    if (error) {

      console.error(error);

      setLoading(false);

      return;

    }

    const employeesWithHours = data.map((employee: any) => {

  const totalHours =
    employee.work_logs?.reduce(
      (sum: number, log: any) =>
        sum + Number(log.hours || 0),
      0
    ) || 0;

  const paidHours =
    employee.work_logs?.reduce(
      (sum: number, log: any) =>
        log.is_paid
          ? sum + Number(log.hours || 0)
          : sum,
      0
    ) || 0;

  return {
    ...employee,

    total_hours: totalHours,

    paid_hours: paidHours,

    open_hours: totalHours - paidHours,
  };

});




    setEmployees(
  employeesWithHours as Employee[]
);

    setLoading(false);

  }

  return (

    <main className="min-h-screen bg-gray-100 p-10">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-10">

        {/* LINKE SEITE */}

        <div className="flex items-center gap-4">

          <button

            onClick={() =>
              window.location.href = "/"
            }

            className="bg-white border border-gray-300 p-3 rounded-2xl hover:bg-gray-100 transition shadow-sm"
          >

            <ArrowLeft size={28} />

          </button>

          <h1 className="text-5xl font-bold">

            Mitarbeiterverwaltung

          </h1>

        </div>

        {/* RECHTE SEITE */}

        <button

          onClick={() =>
            setSelectedEmployee({

              id: "",

              first_name: "",

              last_name: "",

              phone: "",

              email: "",

              active: true,

            })
          }

          className="bg-black text-white px-6 py-3 rounded-2xl font-semibold hover:bg-gray-800 transition flex items-center gap-2"
        >

          <Plus size={22} />

          Neuer Mitarbeiter

        </button>

      </div>

      {/* LISTE */}

      <div className="space-y-4">

        {loading && (

          <div className="bg-white rounded-2xl p-6 shadow">

            Lade Mitarbeiter...

          </div>

        )}

        {!loading &&
          employees.length === 0 && (

            <div className="bg-white rounded-2xl p-6 shadow">

              Keine Mitarbeiter vorhanden.

            </div>

          )}

        {employees.map((employee) => (

          <EmployeeCard

            key={employee.id}

            employee={employee}

            onEdit={() => {
              setSelectedEmployee(employee)
            }}

            onShowLogs={() => {
  setLogsEmployee(employee);
}}

          />

        ))}

        {logsEmployee && (

  <WorkLogsModal
    employeeId={logsEmployee.id}

    employeeName={`${logsEmployee.first_name} ${logsEmployee.last_name}`}

    onClose={() => {
      setLogsEmployee(null);
    }}

    onChanged={() => {
      loadEmployees();
    }}
  />

)}

      </div>

      {/* MODAL */}

      {selectedEmployee && (

        <EditEmployeeModal

          employee={selectedEmployee}

          onClose={() =>
            setSelectedEmployee(null)
          }

          onSaved={() => {

            setSelectedEmployee(null);

            loadEmployees();

          }}

        />

      )}

    </main>

  );

}