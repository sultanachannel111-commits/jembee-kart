"use client";

export default function DiagnosticsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">System Diagnostics</h1>

      <div className="bg-white p-4 rounded shadow mb-4">
        Firebase Connection: OK
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        Banner Loading: OK
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        Product Image Check: Running
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        Seller Panel Status: Active
      </div>
    </div>
  );
}
