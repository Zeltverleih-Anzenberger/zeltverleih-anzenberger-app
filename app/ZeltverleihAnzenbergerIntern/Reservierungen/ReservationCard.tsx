type Reservation = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: string;

  reservation_tents: {
    quantity: number;

    tent_sizes: {
      name: string;
    };

  }[];

};

type Props = {
  reservation: Reservation;
  onEdit: () => void;
};

export default function ReservationCard({
  reservation,
  onEdit,
}: Props) {

  return (

    <div className="bg-white rounded-2xl shadow p-5 hover:shadow-lg transition">

      <div className="flex justify-between items-start gap-6">

        {/* LINKE SEITE */}

        <div className="flex-1">

          {/* KUNDE */}

          <h2 className="text-2xl font-bold text-black mb-3">

            {reservation.title}

          </h2>

          {/* ZEITRAUM */}

          <div className="text-gray-600 mb-4">

            {reservation.start_date} bis {reservation.end_date}

          </div>

          {/* ZELTE */}

          <div className="space-y-2">

            {reservation.reservation_tents.map(
              (tent, index) => (

                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-100 rounded-xl px-4 py-2"
                >

                  <span className="font-medium">

                    {tent.tent_sizes?.name || "Unbekannt"}

                  </span>

                  <span className="text-gray-700">

                    {tent.quantity}x

                  </span>

                </div>

              )
            )}

          </div>

        </div>

        {/* RECHTE SEITE */}

        <div className="flex flex-col items-end gap-4 min-w-[180px]">

          {/* STATUS */}

          <div
            className={`px-4 py-2 rounded-xl text-sm font-bold ${
              reservation.status === "reserviert"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >

            {reservation.status}

          </div>

          {/* BUTTON */}

          <button

            onClick={onEdit}

            className="bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition font-semibold"

          >

            Bearbeiten

          </button>

        </div>

      </div>

    </div>

  );

}