import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

const data = [
    { day: 'Mon', words: 0 },
    { day: 'Tue', words: 5 },
    { day: 'Wed', words: 12 },
    { day: 'Thu', words: 18 },
    { day: 'Fri', words: 25 },
    { day: 'Sat', words: 30 },
    { day: 'Sun', words: 45 },
];

const ProgressChart = () => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold mb-4 text-gray-700">Learning Progress (This Week)</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="words" stroke="#8884d8" activeDot={{ r: 8 }} name="Words Learned" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ProgressChart;
