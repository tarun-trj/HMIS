# Detailed Documentation of BedOccupancyTrends Component

## Component Overview

The `BedOccupancyTrends` component implements a comprehensive hospital bed occupancy analytics system that enables administrators to track, visualize, and analyze temporal patterns in bed utilization. Rather than providing simple occupancy counts, it offers a multidimensional analysis that encompasses new occupancies, vacated beds, and net occupancy trends across customizable time periods. The component features dynamic visualization options, statistical summaries, and filtering capabilities specifically designed for hospital capacity management and resource planning.

## State Management

The component maintains several state variables to track user preferences, data loading status, and analytical results:

```jsx
const [startDate, setStartDate] = useState('2024-09-10');
const [endDate, setEndDate] = useState('2025-04-15');
const [period, setPeriod] = useState('weekly');
const [chartType, setChartType] = useState('bar');
const [bedType, setBedType] = useState('all');
const [trends, setTrends] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [errorDetails, setErrorDetails] = useState('');
const [filterVisible, setFilterVisible] = useState(true);
```

These state variables serve distinct purposes:

- `startDate` and `endDate`: Control the date range for analysis
- `period`: Toggles between 'weekly' and 'monthly' time granularity
- `chartType`: Determines visualization style ('bar', 'line', or 'area')
- `bedType`: Filters data by bed category (ICU, general, pediatric, etc.)
- `trends`: Stores the retrieved occupancy data
- `loading` and `error`: Manage UI feedback during data operations
- `errorDetails`: Captures detailed error information for troubleshooting
- `filterVisible`: Controls the visibility of filter controls in the UI


## Date Validation Implementation

The component implements robust date validation through the `validateDates` function:

```jsx
const validateDates = () =&gt; {
  if (!startDate || !endDate) {
    setError('Please select both start and end dates');
    return false;
  }
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end &lt; start) {
      setError('End date must be after start date');
      return false;
    }
    setError(null);
    return true;
  } catch (err) {
    setError('Invalid date format');
    return false;
  }
};
```

This function performs three critical validation checks:

1. Ensures both dates are provided before proceeding
2. Verifies date parsing validity through a try-catch block
3. Confirms chronological ordering (end date must follow start date)

The validation results directly influence the UI by setting appropriate error messages and determining whether data fetching should proceed.

## Data Fetching Implementation

The component implements data retrieval through the `fetchData` function:

```jsx
const fetchData = async () =&gt; {
  if (!validateDates()) return;
  setLoading(true);
  setError(null);
  setErrorDetails('');
  try {
    const response = await axios.post(
      `http://localhost:5000/api/analytics/occupied-beds/${period}`,
      { startDate, endDate, bedType }
    );
    if (response.data &amp;&amp; response.data.trends) {
      setTrends(response.data.trends);
    } else {
      setError('No data available for the selected period');
    }
  } catch (err) {
    console.error("Error details:", err);
    setError('Failed to fetch data');
    setErrorDetails(err.response?.data?.message || err.message || 'Unknown error');
  } finally {
    setLoading(false);
  }
};
```

This function follows a comprehensive data fetching pattern:

1. Validates dates before proceeding
2. Sets loading state and clears previous errors
3. Makes an asynchronous POST request with the filter parameters
4. Validates the response structure before updating state
5. Implements robust error handling with fallback error messages
6. Ensures loading state is cleared in all scenarios via finally block

The component also implements automatic data fetching when certain parameters change:

```jsx
useEffect(() =&gt; {
  if (validateDates()) {
    fetchData();
  }
}, [period, bedType]);
```

This effect triggers a data refresh when either the time period or bed type changes, while requiring valid dates before proceeding. This conditional approach prevents unnecessary API calls with invalid parameters.

## Data Formatting for Visualization

The component implements several data transformation functions to prepare API data for visualization:

```jsx
const formatChartData = (data) =&gt; {
  if (!data || !data.length) return [];
  return data.map(item =&gt; {
    const label = period === 'weekly' ? formatWeekLabel(item.week) : formatMonthLabel(item.month);
    return {
      name: label,
      occupied: item.occupied,
      vacated: item.vacated,
      netOccupancy: item.netOccupancy,
      color: getTrendColor(item.netOccupancy, data)
    };
  });
};
```

This function performs multiple transformations:

1. Data validation with early return for empty datasets
2. Application of period-specific label formatting
3. Creation of a consistent data structure for charting
4. Addition of dynamic color coding based on relative occupancy

The component uses specialized formatters for time period labels:

```jsx
const formatWeekLabel = (week) =&gt; {
  if (!week) return '';
  // Format from "2023-W01" to "Week 1"
  const parts = week.split('-W');
  return `Week ${parseInt(parts[^1])}`;
};

const formatMonthLabel = (month) =&gt; {
  if (!month) return '';
  // Format from "2023-01" to "Jan"
  const [year, monthNum] = month.split('-');
  const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
  return date.toLocaleString('default', { month: 'short' });
};
```

These functions transform ISO-formatted time periods into user-friendly labels:

- Weekly format: "2023-W01" → "Week 1"
- Monthly format: "2023-01" → "Jan"

This transformation enhances readability while maintaining the underlying temporal structure.

## Dynamic Color Calculation

The component implements dynamic color coding through the `getTrendColor` function:

```jsx
const getTrendColor = (value, data) =&gt; {
  if (!data || data.length === 0) return '#3B82F6';
  const values = data.map(item =&gt; item.netOccupancy);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min;
  
  // Normalize value between 0 and 1
  let ratio;
  if (range === 0) {
    ratio = 0.5; // Default to middle if all values are the same
  } else {
    ratio = (value - min) / range;
  }
  
  if (ratio &gt; 0.8) return '#EF4444'; // red-500
  if (ratio &gt; 0.6) return '#F59E0B'; // amber-500
  if (ratio &gt; 0.4) return '#10B981'; // emerald-500
  if (ratio &gt; 0.2) return '#3B82F6'; // blue-500
  return '#6366F1'; // indigo-500
};
```

This function implements a sophisticated color scaling algorithm:

1. Extracts all net occupancy values from the dataset
2. Determines the data range (minimum to maximum values)
3. Normalizes the specific value within this range (0-1 scale)
4. Assigns colors based on the normalized position:
    - Highest values (>80%): Red - indicating critical occupancy
    - High values (60-80%): Amber - indicating concerning occupancy
    - Medium values (40-60%): Emerald - indicating moderate occupancy
    - Low-medium values (20-40%): Blue - indicating stable occupancy
    - Lowest values (<20%): Indigo - indicating low occupancy

This visual encoding helps administrators quickly identify periods of concern without requiring detailed data analysis.

## Statistical Analysis Implementation

The component implements comprehensive statistical analysis through the `calculateOverview` function:

```jsx
const calculateOverview = () =&gt; {
  if (!trends || trends.length === 0) return null;
  let totalOccupied = 0;
  let totalVacated = 0;
  
  trends.forEach(item =&gt; {
    totalOccupied += item.occupied;
    totalVacated += item.vacated;
  });
  
  const netOccupancyValues = trends.map(item =&gt; item.netOccupancy);
  const maxOccupancy = Math.max(...netOccupancyValues);
  const minOccupancy = Math.min(...netOccupancyValues);
  
  // Calculate trend direction
  const firstValue = netOccupancyValues[^0];
  const lastValue = netOccupancyValues[netOccupancyValues.length - 1];
  const trend = lastValue &gt; firstValue ? 'increasing' : 
                lastValue &lt; firstValue ? 'decreasing' : 'stable';
  
  // Calculate percentage change
  const percentChange = firstValue !== 0 ? 
    Math.round(((lastValue - firstValue) / Math.abs(firstValue)) * 100) : 0;
  
  return {
    totalOccupied,
    totalVacated, 
    netTotal: totalOccupied - totalVacated,
    maxOccupancy,
    minOccupancy,
    trend,
    percentChange
  };
};
```

This function performs multiple analytical operations:

1. Aggregates total beds occupied and vacated across all time periods
2. Calculates net total impact on occupancy (occupied minus vacated)
3. Identifies maximum and minimum occupancy values across periods
4. Determines trend direction by comparing first and last values
5. Computes percentage change between start and end periods
6. Returns a comprehensive statistical summary object

This data supports the overview cards that provide administrators with key metrics at a glance.

## Custom Tooltip Implementation

The component implements an enhanced tooltip through a custom component:

```jsx
const CustomTooltip = ({ active, payload, label }) =&gt; {
  if (active &amp;&amp; payload &amp;&amp; payload.length) {
    return (
      <div>
        <p>{label}</p>
        <p>
          New Occupied: {payload[^0]?.value || 0}
        </p>
        <p>
          Vacated: {payload[^1]?.value || 0}
        </p>
        <p>
          Net Occupancy: {payload[^2]?.value || 0}
        </p>
      </div>
    );
  }
  return null;
};
```

This tooltip provides:

1. Contextual time period information in the header
2. Color-coded metrics for new occupancies (blue)
3. Color-coded metrics for vacated beds (red)
4. Emphasized net occupancy value (purple, font-medium)
5. Clean white background with shadow for readability
6. Proper null handling when tooltip isn't active

The component is designed to render only when hovering over chart elements, providing precisely targeted information.

## Chart Type Implementation

The component implements dynamic chart rendering based on the selected chart type:

```jsx
const renderChart = () =&gt; {
  const data = formatChartData(trends);
  
  switch (chartType) {
    case 'line':
      return (
        &lt;LineChart data={data} /* other props */&gt;
          {/* Chart elements */}
        &lt;/LineChart&gt;
      );
    case 'area':
      return (
        &lt;AreaChart data={data} /* other props */&gt;
          {/* Chart elements */}
        &lt;/AreaChart&gt;
      );
    default: // 'bar'
      return (
        &lt;BarChart data={data} /* other props */&gt;
          {/* Chart elements */}
        &lt;/BarChart&gt;
      );
  }
};
```

This implementation:

1. Prepares a consistent data format for all chart types
2. Uses a switch statement to determine the appropriate chart component
3. Implements three visualization options:
    - Bar chart: For clear comparison between time periods
    - Line chart: For identifying trends over time
    - Area chart: For visualizing cumulative effects

Each chart type maintains consistent axes, tooltip configuration, and color schemes while offering different visual representations of the same data.

## Filter Controls Implementation

The component implements a collapsible filter panel:

```jsx
<div>
  <div>
    <h3>Filters &amp; Options</h3>
    &lt;button
      onClick={() =&gt; setFilterVisible(!filterVisible)}
      className="text-gray-500 hover:text-gray-700"
    &gt;
      {filterVisible ? 'Hide' : 'Show'} &lt;FaChartBar className="inline ml-1" /&gt;
    &lt;/button&gt;
  </div>
  
  {filterVisible &amp;&amp; (
    <div>
      {/* Filter controls */}
    </div>
  )}
</div>
```

This implementation:

1. Provides a clear section header with toggle button
2. Uses conditional rendering to show/hide the filter panel
3. Maintains filter state even when the panel is hidden

The filter controls themselves offer:

1. Date range selection with validation
2. Time period granularity selection (weekly/monthly)
3. Chart type selection with visual indicators
4. Bed type filtering for focused analysis
5. A refresh button to manually trigger data updates

## Status Message Implementation

The component implements context-aware status messages:

```jsx
{loading ? (
  <div>
    &lt;FaSyncAlt className="animate-spin text-blue-500 text-3xl mx-auto mb-4" /&gt;
    <p>Loading data...</p>
  </div>
) : error ? (
  <div>
    <div>
      &lt;FaExclamationCircle className="text-red-500 mt-1 mr-2" /&gt;
      <div>
        <p>{error}</p>
        {errorDetails &amp;&amp; <p>{errorDetails}</p>}
      </div>
    </div>
  </div>
) : trends.length === 0 ? (
  <div>
    <div>
      &lt;FaExclamationCircle className="text-yellow-500 mt-1 mr-2" /&gt;
      <p>
        No data available for the selected period and bed type. Please adjust your filters and try again.
      </p>
    </div>
  </div>
) : (
  // Render charts and statistics
)}
```

This implementation handles four distinct states:

1. Loading state: Animated spinner with message
2. Error state: Red alert with primary and detailed error information
3. Empty result state: Yellow warning with guidance for filter adjustment
4. Data available state: Renders charts and statistics

Each state provides clear visual cues and actionable information appropriate to the context.

## Trend Indicator Implementation

The component implements dynamic trend indicators in the statistical summary:

```jsx
<div>
  <span>
    {overview.percentChange}%
  </span>
  <span>
    {overview.trend === 'increasing' ? (
      &lt;FaArrowUp className="text-red-500" /&gt;
    ) : overview.trend === 'decreasing' ? (
      &lt;FaArrowDown className="text-green-500" /&gt;
    ) : (
      &lt;FaMinus className="text-gray-500" /&gt;
    )}
  </span>
</div>
```

This implementation:

1. Displays the calculated percentage change
2. Uses conditional rendering to show appropriate trend icons
3. Applies semantic color coding:
    - Increasing (up arrow): Red - potentially concerning
    - Decreasing (down arrow): Green - typically positive for capacity
    - Stable (horizontal line): Gray - neutral

This makes the trend direction immediately visible without requiring interpretation of the numerical value.

## Main Processing Flow

The complete data processing flow consists of:

1. Initial loading with default parameters
2. User adjustment of filters (date range, period, bed type, chart type)
3. Date validation before API requests
4. Data fetching with appropriate parameters
5. Data transformation for visualization:
    - Period-appropriate label formatting
    - Color calculation based on relative values
    - Statistical summary derivation
6. Rendering appropriate visualization based on:
    - Selected chart type
    - Data availability
    - Loading/error status
7. Providing interactive elements (tooltips, trend indicators)
8. Enabling user interaction through filter controls

This pipeline creates a complete analytical system for hospital bed occupancy management.

## Rendering Logic

The component's rendering follows a hierarchical structure:

1. Page header with title and description
2. Filter panel (collapsible)
    - Date range controls
    - Period selector
    - Chart type selector
    - Bed type selector
    - Refresh button
3. Status messages (loading, error, empty results)
4. When data is available:
    - Statistical overview cards
        - Total occupied
        - Total vacated
        - Net change
        - Trend indicators
    - Occupancy visualization
        - Chart based on selected type
        - Interactive tooltip
        - Color-coded data points

This structure provides a complete analytical dashboard for hospital administrators to monitor and analyze bed occupancy trends, making informed decisions about resource allocation and capacity planning.
