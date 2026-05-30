"use client";

import { useState } from "react";

import { supabase } from "@/lib/supabase";

type Employee = {
  id: string;

  first_name: string;

  last_name: string;

  phone: string | null;

  email: string | null;

  active: boolean;
};

type Props = {
  employee: Employee;

  onClose: () => void;

  onSaved: () => void;
};

export default function EditEmployeeModal({
  employee,
  onClose,
  onSaved,
}: Props) {

  const [firstName, setFirstName] =
    useState(employee.first_name);

  const [lastName, setLastName] =
    useState(employee.last_name);

  const [phone, setPhone] =
    useState(employee.phone || "");

  const [email, setEmail] =
    useState(employee.email || "");

  const [active, setActive] =
    useState(employee.active);

  const [loading, setLoading] =
    useState(false);

  async function handleSave() {

    setLoading(true);

    if (employee.id) {

      /* UPDATE */

      const { error } = await supabase

        .from("employees")

        .update({

          first_name: firstName,

          last_name: lastName,

          phone,

          email,

          active,

        })

      

        .eq("id", employee.id);

      if (error) {

        console.error(error);

      }

    } else {

      /* INSERT */

      const { error } = await supabase

        .from("employees")

        .insert({

          first_name: firstName,

          last_name: lastName,

          phone,

          email,

          active,

        });

      if (error) {

        console.error(error);

      }

    }

    setLoading(false);

    onSaved();

  }

  async function handleDelete() {

  if (!employee?.id) return;

  const confirmed = window.confirm(
    "Mitarbeiter wirklich löschen?"
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("employees")
    .delete()
    .eq("id", employee.id);

  if (error) {

    console.error(error);
    return;

  }

  onSaved();
}

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl">

        <h2 className="text-3xl font-bold mb-8">

          {employee.id
            ? "Mitarbeiter bearbeiten"
            : "Neuen Mitarbeiter anlegen"}

        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">

          <div>

            <label className="block mb-2 font-medium">

              Vorname

            </label>

            <input

              value={firstName}

              onChange={(e) =>
                setFirstName(
                  e.target.value
                )
              }

              className="w-full border rounded-xl p-3"
            />

          </div>

          <div>

            <label className="block mb-2 font-medium">

              Nachname

            </label>

            <input

              value={lastName}

              onChange={(e) =>
                setLastName(
                  e.target.value
                )
              }

              className="w-full border rounded-xl p-3"
            />

          </div>

        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">

          <div>

            <label className="block mb-2 font-medium">

              Telefon

            </label>

            <input

              value={phone}

              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }

              className="w-full border rounded-xl p-3"
            />

          </div>

          <div>

            <label className="block mb-2 font-medium">

              E-Mail

            </label>

            <input

              value={email}

              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }

              className="w-full border rounded-xl p-3"
            />

          </div>

        </div>

        <div className="mb-8">

          <label className="flex items-center gap-3">

            <input

              type="checkbox"

              checked={active}

              onChange={(e) =>
                setActive(
                  e.target.checked
                )
              }

            />

            Aktiv

          </label>

        </div>

        {/* BUTTONS */}

        <div className="flex justify-between items-center mt-8">

  <div>

    {employee && (

      <button
        onClick={handleDelete}
        className="
          bg-red-500
          hover:bg-red-600
          text-white
          px-5
          py-3
          rounded-2xl
          transition
        "
      >
        Löschen
      </button>

    )}

  </div>

  <div className="flex gap-4">

    <button
      onClick={onClose}
      className="
        border
        border-gray-300
        px-5
        py-3
        rounded-2xl
      "
    >
      Abbrechen
    </button>

    <button
      onClick={handleSave}
      className="
        bg-black
        text-white
        px-5
        py-3
        rounded-2xl
      "
    >
      Speichern
    </button>

  </div>

</div>

      </div>

    </div>

  );

}