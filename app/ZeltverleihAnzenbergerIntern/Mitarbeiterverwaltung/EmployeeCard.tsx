import { useState } from "react";

import AddWorkLogModal from "./AddWorkLogModal";

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

type Props = {
  employee: Employee;

  onEdit: () => void;

  onShowLogs: () => void;
};

export default function EmployeeCard({
  employee,
  onEdit,
  onShowLogs,
}: Props) {

  const [showWorkLogModal, setShowWorkLogModal] = useState(false);

  return (

    <div className="bg-white rounded-2xl shadow p-6 flex justify-between items-center">

      {/* LINKE SEITE */}

      <div>

        <h2 className="text-2xl font-bold mb-2">

          {employee.first_name} {employee.last_name}

        </h2>

        <div className="space-y-1 text-gray-600">

          <p>

            Telefon:
            {" "}
            {employee.phone || "-"}

          </p>

          <p>

            E-Mail:
            {" "}
            {employee.email || "-"}

          </p>

          <div className="mt-4 space-y-1 text-sm">

  <p>
    Gesamtstunden:
    <span className="font-semibold ml-2">
      {employee.total_hours?.toFixed(2) || "0.00"} h
    </span>
  </p>

  <p>
    Ausbezahlt:
    <span className="font-semibold ml-2 text-green-600">
      {employee.paid_hours?.toFixed(2) || "0.00"} h
    </span>
  </p>

  <p>
    Offen:
    <span className="font-semibold ml-2 text-orange-500">
      {employee.open_hours?.toFixed(2) || "0.00"} h
    </span>
  </p>

</div>

        </div>

      </div>

      {/* RECHTE SEITE */}

      <div className="flex items-center gap-4">

        <div
          className={`px-4 py-2 rounded-xl font-semibold ${
            employee.active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >

          {employee.active
            ? "Aktiv"
            : "Inaktiv"}

        </div>

        <button
  onClick={() => setShowWorkLogModal(true)}
  className="bg-blue-600 text-white px-5 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition"
>

  + Stunde

</button>

<button
  onClick={onShowLogs}
  className="bg-gray-200 text-black px-5 py-3 rounded-2xl font-semibold hover:bg-gray-300 transition"
>
  Stunden
</button>

        <button

          onClick={onEdit}

          className="bg-black text-white px-5 py-3 rounded-2xl font-semibold hover:bg-gray-800 transition"
        >

          Bearbeiten

        </button>

      </div>

      {showWorkLogModal && (

  <AddWorkLogModal
    employeeId={employee.id}

    onClose={() => setShowWorkLogModal(false)}

    onSaved={() => window.location.reload()}
  />

)}

    </div>

  );

}