"use client"

import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";

export default function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "sensor_data"), (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log("DATA:", data);
        return { id: doc.id, ...data };
      });
      setData(docs.reverse());
    });
    return () => unsubscribe();
  }, []);

  const downloadCSV = () => {
    const headers = ["Level Gas", "Level Debu", "Status Kipas", "Timestamp"];
    const rows = data.map(entry => [
      entry.level_gas ?? "",
      entry.level_debu ?? "",
      entry.status_kipas_angin ? "ON" : "OFF",
      formatTimestamp(entry.timestamp)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map(row => row.join(","))].join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `sensor_data_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTimestamp = (value) => {
    if (!value) return "-";

    try {
      if (typeof value.toDate === "function") {
        return value.toDate().toLocaleString();
      } else {
        const date = new Date(value);
        return isNaN(date.getTime()) ? "-" : date.toLocaleString();
      }
    } catch {
      return "-";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-8">
          Dashboard Air Purifier RPL IoT
        </h1>

        <div className="flex justify-end mb-4">
          <button
            onClick={downloadCSV}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded shadow">
            ⬇ Download CSV
          </button>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="w-full text-sm text-center text-gray-700">
            <thead className="bg-blue-600 text-white text-xs uppercase">
              <tr>
                <th className="py-3 px-4">Level Gas</th>
                <th className="py-3 px-4">Level Debu</th>
                <th className="py-3 px-4">Status Kipas</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-4 text-gray-400 italic">
                    Belum ada data sensor...
                  </td>
                </tr>
              ) : (
                data.map((entry, i) => (
                  <tr key={entry.id} className={`${i % 2 === 0 ? "bg-gray-100" : "bg-white"}`}>
                    <td className="py-2 px-4">{entry.level_gas}</td>
                    <td className="py-2 px-4">{entry.level_debu}</td>
                    <td className="py-2 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                        entry.status_kipas_angin ? "bg-green-500" : "bg-red-500"
                      }`}>
                        {entry.status_kipas_angin ? "ON" : "OFF"}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-xs text-gray-600">
                      {formatTimestamp(entry.timestamp)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}