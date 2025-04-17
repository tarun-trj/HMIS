import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faStar, faSync } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend);

/* Backend Implementation Reference:
GET /api/analytics/doctors/rating-distribution
MongoDB Aggregation Pipeline:

Step 1: First, we need to find the min and max ratings
[
  {
    $group: {
      _id: null,
      minRating: { $min: "$rating" },
      maxRating: { $max: "$rating" }
    }
  }
]

Step 2: Then we need to count doctors in each rating range
Once we have minRating and maxRating, we calculate the range size:
const rangeSize = (maxRating - minRating) / 5;

Then we can use multiple $match stages with $count or a more complex aggregation:
[
  {
    $facet: {
      "range1": [
        { $match: { rating: { $gte: minRating, $lt: minRating + rangeSize } } },
        { $count: "count" }
      ],
      "range2": [
        { $match: { rating: { $gte: minRating + rangeSize, $lt: minRating + 2 * rangeSize } } },
        { $count: "count" }
      ],
      "range3": [
        { $match: { rating: { $gte: minRating + 2 * rangeSize, $lt: minRating + 3 * rangeSize } } },
        { $count: "count" }
      ],
      "range4": [
        { $match: { rating: { $gte: minRating + 3 * rangeSize, $lt: minRating + 4 * rangeSize } } },
        { $count: "count" }
      ],
      "range5": [
        { $match: { rating: { $gte: minRating + 4 * rangeSize, $lte: maxRating } } },
        { $count: "count" }
      ]
    }
  },
  {
    $project: {
      ranges: [
        { 
          label: { $concat: [{ $toString: "$minRating" }, " - ", { $toString: { $add: ["$minRating", "$rangeSize"] } }] },
          count: { $ifNull: [{ $arrayElemAt: ["$range1.count", 0] }, 0] }
        },
        {
          label: { $concat: [{ $toString: { $add: ["$minRating", "$rangeSize"] } }, " - ", { $toString: { $add: ["$minRating", { $multiply: ["$rangeSize", 2] }] } }] },
          count: { $ifNull: [{ $arrayElemAt: ["$range2.count", 0] }, 0] }
        },
        {
          label: { $concat: [{ $toString: { $add: ["$minRating", { $multiply: ["$rangeSize", 2] }] } }, " - ", { $toString: { $add: ["$minRating", { $multiply: ["$rangeSize", 3] }] } }] },
          count: { $ifNull: [{ $arrayElemAt: ["$range3.count", 0] }, 0] }
        },
        {
          label: { $concat: [{ $toString: { $add: ["$minRating", { $multiply: ["$rangeSize", 3] }] } }, " - ", { $toString: { $add: ["$minRating", { $multiply: ["$rangeSize", 4] }] } }] },
          count: { $ifNull: [{ $arrayElemAt: ["$range4.count", 0] }, 0] }
        },
        {
          label: { $concat: [{ $toString: { $add: ["$minRating", { $multiply: ["$rangeSize", 4] }] } }, " - ", { $toString: "$maxRating" }] },
          count: { $ifNull: [{ $arrayElemAt: ["$range5.count", 0] }, 0] }
        }
      ]
    }
  }
]

Alternatively, this logic could be implemented in the backend service layer
after retrieving the min/max values and all doctor records.
*/

// Dummy data for testing
const generateDummyData = () => {
  // Simulate min and max rating values (e.g., 1.5 to 5.0)
  const minRating = 1.5;
  const maxRating = 5.0;
  const rangeSize = (maxRating - minRating) / 5;

  // Generate range labels
  const ranges = Array.from({ length: 5 }, (_, i) => {
    const start = minRating + i * rangeSize;
    const end = i === 4 ? maxRating : minRating + (i + 1) * rangeSize;
    return `${start.toFixed(1)} - ${end.toFixed(1)}`;
  });

  // Generate random count for each range
  const data = Array.from({ length: 5 }, () => Math.floor(Math.random() * 30) + 5);

  return { ranges, data, minRating, maxRating };
};

const Feedbacks = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingStats, setRatingStats] = useState({ min: 0, max: 0 });

  const fetchRatingDistribution = async () => {
    setLoading(true);
    try {
      // In production, this would be an actual API call:
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/feedback-rating-metrics`);
      const distribution = response.data.ratingDistribution;

      // // For testing, use dummy data
      // const { ranges, data, minRating, maxRating } = generateDummyData();

      // Get all possible ratings and their counts
      const ratings = Object.keys(distribution).map(Number);
      const minRating = Math.min(...ratings);
      const maxRating = Math.max(...ratings);
      const rangeSize = (maxRating - minRating) / 5;

      // Generate range labels
      const ranges = Array.from({ length: 5 }, (_, i) => {
        const start = minRating + i * rangeSize;
        const end = i === 4 ? maxRating : minRating + (i + 1) * rangeSize;
        return `${start.toFixed(1)} - ${end.toFixed(1)}`;
      });

      // Count doctors in each range
      const data = Array(5).fill(0);

      Object.entries(distribution).forEach(([rating, count]) => {
        const ratingNum = Number(rating);
        for (let i = 0; i < 5; i++) {
          const start = minRating + i * rangeSize;
          const end = i === 4 ? maxRating + 0.001 : minRating + (i + 1) * rangeSize;

          if (ratingNum >= start && ratingNum < end) {
            data[i] += count;
            break;
          }
        }
      });

      setRatingStats({
        min: minRating,
        max: maxRating
      });

      setChartData({
        labels: ranges,
        datasets: [
          {
            label: 'Number of Doctors',
            data: data,
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching doctor rating distribution:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatingDistribution();
  }, []);

  const handleRefresh = () => {
    fetchRatingDistribution();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
            <FontAwesomeIcon icon={faChartPie} className="mr-3" />
            Doctor Rating Distribution
          </h2>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center"
          >
            <FontAwesomeIcon icon={faSync} className="mr-2" />
            Refresh Data
          </button>
        </div>

        {/* Rating stats display */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-2" />
            <span className="text-gray-600">
              Rating Range: <span className="font-semibold">{ratingStats.min.toFixed(1)} - {ratingStats.max.toFixed(1)}</span>
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Chart displays distribution of doctors across five equal rating ranges.
          </p>
        </div>

        {/* Chart section */}
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : chartData ? (
          <div className="h-[400px] flex justify-center">
            <div className="w-full max-w-lg">
              <Pie
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: {
                        boxWidth: 15,
                        padding: 15
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          const label = context.label || '';
                          const value = context.raw || 0;
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = Math.round((value / total) * 100);
                          return `${label}: ${value} doctors (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-gray-500">No data available</div>
          </div>
        )}

        {/* Legend explanation */}
        {chartData && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Understanding the Chart</h3>
            <p className="text-sm text-gray-600">
              This pie chart divides doctor ratings into 5 equal ranges between the minimum and maximum rating values.
              Each slice represents the number and percentage of doctors who fall within that rating range.
              Hover over each slice to see detailed information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedbacks;