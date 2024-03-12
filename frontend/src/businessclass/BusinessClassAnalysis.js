import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import "./BusinessClassAnalysis.css";

const BusinessClassAnalysis = () => {
  const [data, setData] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassType, setSelectedClassType] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/businessdata");
      setData(response.data.results);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleClassClick = (classOfBusiness) => {
    setSelectedClass(classOfBusiness);
    setSelectedClassType(null);
  };

  const handleClassTypeClick = (classType) => {
    setSelectedClassType(classType);
  };

  const classOfBusinessOptions = Array.from(
    new Set(data.map((item) => item["ClassOfBusiness"]))
  );

  const classTypeOptions =
    selectedClass &&
    Array.from(
      new Set(
        data
          .filter((item) => item["ClassOfBusiness"] === selectedClass)
          .map((item) => item.ClassType)
      )
    );

  const filteredData =
    selectedClassType !== null
      ? data.filter(
          (item) =>
            item["ClassOfBusiness"] === selectedClass &&
            item.ClassType === selectedClassType
        )
      : selectedClass !== null
      ? data.filter((item) => item["ClassOfBusiness"] === selectedClass)
      : data;

  const numColumns = filteredData.length > 6 ? 2 : 3;
  const columnSize = Math.ceil(filteredData.length / numColumns);
  const columnData = Array.from({ length: numColumns }, (_, columnIndex) =>
    filteredData.slice(
      columnIndex * columnSize,
      columnIndex * columnSize + columnSize
    )
  );

  const getClassTypeData = () => {
    const classTypeCounts = {};
    data.forEach((item) => {
      if (!classTypeCounts[item.ClassType]) {
        classTypeCounts[item.ClassType] = 1;
      } else {
        classTypeCounts[item.ClassType]++;
      }
    });

    const labels = Object.keys(classTypeCounts);
    const dataValues = Object.values(classTypeCounts);

    return {
      labels,
      datasets: [
        {
          data: dataValues,
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
          ],
        },
      ],
    };
  };

  const getClassTypeAnalysisData = () => {
    if (selectedClassType) {
      const classTypeAnalysis = data
        .filter(
          (item) =>
            item["ClassOfBusiness"] === selectedClass &&
            item.ClassType === selectedClassType
        )
        .map((item) => ({
          label: item.Year,
          value: item.GWP, // You can modify this based on your analysis logic
        }));

      const analysisLabels = classTypeAnalysis.map((item) => item.label);
      const analysisValues = classTypeAnalysis.map((item) => item.value);

      return {
        labels: analysisLabels,
        datasets: [
          {
            data: analysisValues,
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
              "rgba(153, 102, 255, 0.6)",
            ],
          },
        ],
      };
    }
    return null;
  };

  const getPieChartOptions = () => {
    return {
      legend: {
        display: true,
        position: "left", // Set legend position to the left
      },
    };
  };

  return (
    <div className="container-fluid dashboard">
      <h2 className="mt-4 mb-4">BUSINESS CLASS ANALYSIS</h2>
      <div className="row">
        <div className="col-lg-3">
          <h5>CLASSES OF BUSINESS</h5>
          <ul className="list-group">
            {classOfBusinessOptions.map((classOfBusiness, index) => (
              <li
                key={index}
                className={`list-group-item ${
                  selectedClass === classOfBusiness ? "active" : ""
                } category-box`}
                onClick={() => handleClassClick(classOfBusiness)}
              >
                {classOfBusiness}
              </li>
            ))}
          </ul>
        </div>

        {selectedClass && (
          <div className="col-lg-3">
            <h5>CLASS TYPES</h5>
            <ul className="list-group">
              {classTypeOptions.map((classType, index) => (
                <li
                  key={index}
                  className={`list-group-item ${
                    selectedClassType === classType ? "active" : ""
                  } category-box `}
                  onClick={() => handleClassTypeClick(classType)}
                >
                  {classType}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Include the pie chart with reduced size */}
        <div className="col-lg-6">
          <div className="pie-chart-container">
            <h5>CLASS TYPE DISTRIBUTION</h5>
            <Pie data={getClassTypeData()} options={getPieChartOptions()} />
          </div>
        </div>
      </div>

      {/* Show Analysis Results */}
      <div className="row">
        {selectedClassType && (
          <div className="col-lg-6">
            <div className="pie-chart-container">
              <h5>CLASS TYPE ANALYSIS</h5>
              <Pie data={getClassTypeAnalysisData()} options={getPieChartOptions()} />
            </div>
          </div>
        )}

        {columnData.map((column, index) => (
          <div key={index} className={`col-lg-${12 / numColumns} mb-4`}>
            <div className="table-responsive">
              <table className="table table-striped custom-table">
                <thead className="thead-dark">
                  <tr>
                    <th>Year</th>
                    <th>Class of Business</th>
                    <th>Class Type</th>
                    <th>Business Plan</th>
                    <th>Earned Premium</th>
                    <th>GWP</th>
                  </tr>
                </thead>
                <tbody>
                  {column.map((item, rowIndex) => (
                    <tr key={rowIndex}>
                      <td>{item.Year}</td>
                      <td>{item["ClassOfBusiness"]}</td>
                      <td>{item.ClassType}</td>
                      <td>{item["BusinessPlan"]}</td>
                      <td>{item["EarnedPremium"]}</td>
                      <td>{item["GWP"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessClassAnalysis;
