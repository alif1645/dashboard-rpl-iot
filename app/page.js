"use client";

import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";

export default function Home() {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const THRESHOLDS = {
    DUST: { GOOD: 12, MODERATE: 35, UNHEALTHY: 55, VERY_UNHEALTHY: 150, HAZARDOUS: 250 },
    GAS: { GOOD: 300, MODERATE: 600, UNHEALTHY: 900, VERY_UNHEALTHY: 1200 }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "sensor_data"), (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        return { id: doc.id, ...data };
      });
      setData(docs.reverse());
    });
    return () => unsubscribe();
  }, []);

  const filterByDate = (data) => {
  if (!startDate && !endDate) return data;
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start) start.setHours(0, 0, 0, 0);
  if (end) end.setHours(23, 59, 59, 999);
  return data.filter(entry => {
    const timestamp = entry.timestamp?.toDate ? entry.timestamp.toDate() : new Date(entry.timestamp);
    if (!timestamp || isNaN(timestamp.getTime())) return false;
    return (!start || timestamp >= start) && (!end || timestamp <= end);
  });
};


  const downloadCSV = () => {
    const headers = ["Level Gas", "Level Debu", "Status Kipas", "Timestamp"];
    const filteredData = filterByDate(data);
    const rows = filteredData.map(entry => [
      entry.level_gas ?? "",
      entry.level_debu ?? "",
      entry.status_kipas_angin ? "ON" : "OFF",
      formatTimestamp(entry.timestamp)
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
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
      if (typeof value.toDate === "function") return value.toDate().toLocaleString();
      const date = new Date(value);
      return isNaN(date.getTime()) ? "-" : date.toLocaleString();
    } catch {
      return "-";
    }
  };

  const getStatusColor = (entry) => {
    if (entry.level_debu === null && entry.level_gas === null) return "bg-gray-400";
    const { level_gas, level_debu } = entry;
    if (level_debu >= THRESHOLDS.DUST.HAZARDOUS || level_gas >= THRESHOLDS.GAS.VERY_UNHEALTHY) return "bg-red-600";
    if (level_debu >= THRESHOLDS.DUST.VERY_UNHEALTHY || level_gas >= THRESHOLDS.GAS.UNHEALTHY) return "bg-orange-500";
    if (level_debu >= THRESHOLDS.DUST.UNHEALTHY || level_gas >= THRESHOLDS.GAS.MODERATE) return "bg-yellow-500";
    if (level_debu >= THRESHOLDS.DUST.MODERATE) return "bg-blue-400";
    return "bg-green-500";
  };

  const getStatusText = (entry) => {
    if (entry.level_debu === null && entry.level_gas === null) return "OFF";
    const { level_gas, level_debu } = entry;
    if (level_debu >= THRESHOLDS.DUST.HAZARDOUS || level_gas >= THRESHOLDS.GAS.VERY_UNHEALTHY) return "DARURAT";
    if (level_debu >= THRESHOLDS.DUST.VERY_UNHEALTHY || level_gas >= THRESHOLDS.GAS.UNHEALTHY) return "SANGAT BURUK";
    if (level_debu >= THRESHOLDS.DUST.UNHEALTHY || level_gas >= THRESHOLDS.GAS.MODERATE) return "BURUK";
    if (level_debu >= THRESHOLDS.DUST.MODERATE) return "SEDANG";
    return "BAIK";
  };

  const getRowClass = (level, type) => {
    const thresholds = type === 'gas' ? THRESHOLDS.GAS : THRESHOLDS.DUST;
    if (type === 'dust') {
      if (level >= thresholds.HAZARDOUS) return "font-bold text-red-700";
      if (level >= thresholds.VERY_UNHEALTHY) return "text-red-600";
      if (level >= thresholds.UNHEALTHY) return "text-orange-500";
      if (level >= thresholds.MODERATE) return "text-yellow-600";
    } else {
      if (level >= thresholds.VERY_UNHEALTHY) return "font-bold text-red-700";
      if (level >= thresholds.UNHEALTHY) return "text-red-600";
      if (level >= thresholds.MODERATE) return "text-orange-500";
    }
    return "text-gray-700";
  };

  const filteredData = filterByDate(data);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-6">
          Dashboard Air Purifier RPL IoT
        </h1>
        {/* Threshold Legend */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      <div className="flex items-center justify-center bg-green-100 px-3 py-2 rounded">
      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
        <span className="text-sm font-medium text-green-800">BAIK</span>
      </div>
      <div className="flex items-center justify-center bg-blue-100 px-3 py-2 rounded">
      <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
        <span className="text-sm font-medium text-blue-800">SEDANG</span>
      </div>
      <div className="flex items-center justify-center bg-yellow-100 px-3 py-2 rounded">
      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
        <span className="text-sm font-medium text-yellow-800">BURUK</span>
      </div>
      <div className="flex items-center justify-center bg-orange-100 px-3 py-2 rounded">
      <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
        <span className="text-sm font-medium text-orange-800">SANGAT BURUK</span>
      </div>
      <div className="flex items-center justify-center bg-red-100 px-3 py-2 rounded">
      <div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>
        <span className="text-sm font-medium text-red-800">DARURAT</span>
      </div>
    </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start md:items-center">
          <div className="flex gap-2 items-center">
            <label className="text-sm text-gray-700">Dari: </label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border px-2 py-1 rounded" />
            <label className="text-sm text-gray-700 ml-2">Sampai: </label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border px-2 py-1 rounded" />
          </div>
          <button
            onClick={downloadCSV}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded shadow transition-colors">
            ⬇ Download CSV
          </button>
        </div>

        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="w-full text-sm text-center">
            <thead className="bg-blue-600 text-white text-xs uppercase">
              <tr>
                <th className="py-3 px-4">Level Gas (ppm)</th>
                <th className="py-3 px-4">Level Debu (µg/m³)</th>
                <th className="py-3 px-4">Status Udara</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-4 text-gray-400 italic">
                    Belum ada data sensor...
                  </td>
                </tr>
              ) : (
                filteredData.map((entry, i) => (
                  <tr key={entry.id} className={`${i % 2 === 0 ? "bg-gray-100" : "bg-white"}`}>
                    <td className={`py-2 px-4 ${getRowClass(entry.level_gas, 'gas')}`}>{entry.level_gas}</td>
                    <td className={`py-2 px-4 ${getRowClass(entry.level_debu, 'dust')}`}>{entry.level_debu}</td>
                    <td className="py-2 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(entry)}`}>
                        {getStatusText(entry)}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-xs text-gray-600">{formatTimestamp(entry.timestamp)}</td>
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