import { supabase } from "./lib/supabase";

export default async function Home() {

  const { data: tentSizes } = await supabase
    .from("tent_sizes")
    .select("*");

  return (
    <main className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-5xl font-bold mb-8">
          Zeltverleih Anzenberger
        </h1>

        <div className="bg-white rounded-2xl p-6 shadow mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Verfügbare Zeltgrößen
          </h2>

          <div className="space-y-2">
            {tentSizes?.map((tent) => (
              <div
                key={tent.id}
                className="p-3 bg-gray-100 rounded-lg"
              >
                {tent.name}
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}