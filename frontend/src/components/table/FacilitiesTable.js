import React, { useState, useEffect } from "react";
import BarChart from "./../BarChart";
import "./FacilitiesTable.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

function FacilitiesTable() {
  const [brokerStatusData, setBrokerStatusData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [top10FacilitiesBrokers, setTop10FacilitiesBrokers] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/data/insurance");
      setBrokerStatusData(response.data.results);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  useEffect(() => {
    fetchData();
  }, []); // Fetch data when the component mounts

  useEffect(() => {
    const facilitiesData = brokerStatusData.filter(
      (data) => data["MarketType"] === "Facilities"
    );
    const sortedFacilitiesBrokers = facilitiesData.sort((a, b) => b.GWP - a.GWP);
    const top10FacilitiesBrokersData = sortedFacilitiesBrokers.slice(0, 10);
    setTop10FacilitiesBrokers(top10FacilitiesBrokersData);
  }, [brokerStatusData]); // Update top 10 facilities brokers when data changes

  const filteredData =
    selectedYear !== "All Years"
      ? top10FacilitiesBrokers.filter((item) => item.Year === parseInt(selectedYear))
      : top10FacilitiesBrokers;

  const facilitiesChartData = {
    labels: filteredData.map((data) => data.Year),
    datasets: [
      {
        label: "GWP",
        data: filteredData.map((data) => data.GWP),
        backgroundColor: [
          "rgba(75,192,192,1)",
          "#ecf0f1",
          "#50AF95",
          "#f3ba2f",
          "#2a71d0",
        ],
        borderColor: "black",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="card mt-4">
      <div className="card-body">
        <div className="d-flex justify-content-between mb-3">
          <div>
            <span>
              <label htmlFor="yearSelect" className="form-label">
                Select Year
              </label>
            </span>
            <select
              id="yearSelect"
              className="form-select small-select"
              onChange={handleYearChange}
              value={selectedYear}
            >
              <option value="All Years">All Years</option>
              <option value="2021">2021</option>
              <option value="2022">2022</option>
            </select>
          </div>
          <h5 className="card-title">FACILITIES</h5>
        </div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th className="table-heading">Year</th>
              <th className="table-heading">Broker</th>
              <th className="table-heading">GWP</th>
              <th className="table-heading">[GWP-PGWP]%</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((data, index) => (
              <tr key={index}>
                <td>{data.Year}</td>
                <td>{data["BrokerName"]}</td>
                <td>{data.GWP}</td>
                <td>
                  {(((data.GWP - data["PlannedGWP"]) / data["PlannedGWP"]) * 100).toFixed(1)}
                  %
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <BarChart chartData={facilitiesChartData} />
      </div>
    </div>
  );
}

export default FacilitiesTable;
