// src/components/ModernLineChart.jsx
import React, { useRef, useEffect, useMemo } from "react";
import { Line } from "react-chartjs-2";

const ModernLineChart = ({ data, height = 300 }) => {
  const chartRef = useRef(null);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // légende masquée pour un design épuré
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "#555",
            font: { family: "'Roboto', sans-serif", size: 12 },
          },
        },
        y: {
          grid: { color: "rgba(200,200,200,0.2)" },
          ticks: {
            color: "#555",
            font: { family: "'Roboto', sans-serif", size: 12 },
          },
        },
      },
      elements: {
        point: {
          radius: 4,
          backgroundColor: "#00A86B",
        },
      },
    }),
    []
  );

  // Lors du démontage, détruire l'instance du graphique pour libérer le canvas
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        // Pour Chart.js v3, l'instance se trouve dans chartInstance,
        // pour v4, elle est directement dans chartRef.current.
        if (chartRef.current.chartInstance) {
          chartRef.current.chartInstance.destroy();
        } else if (chartRef.current.destroy) {
          chartRef.current.destroy();
        }
      }
    };
  }, []);

  return (
    <div style={{ height: `${height}px` }}>
      {/* On ajoute une clé dynamique pour forcer le remount du composant si les données changent */}
      <Line
        ref={chartRef}
        data={data}
        options={options}
        key={JSON.stringify(data)}
        redraw
      />
    </div>
  );
};

export default ModernLineChart;
