// import React from 'react'; removed
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

const ProgressChart = ({ lessons }: { lessons: any[] }) => {
    // Process real lesson data into a daily count for the past 7 days
    const processData = () => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d;
        });

        return last7Days.map(date => {
            const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
            const count = lessons.filter(l => {
                if (!l.createdAt) return false;
                const lDate = new Date(l.createdAt);
                return lDate.getDate() === date.getDate() &&
                    lDate.getMonth() === date.getMonth() &&
                    lDate.getFullYear() === date.getFullYear();
            }).length;

            return { day: dayStr, lessons: count };
        });
    };

    const data = processData();

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold mb-4 text-gray-700">Generated Lessons (Last 7 Days)</h3>
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
                        <Line type="monotone" dataKey="lessons" stroke="#8884d8" activeDot={{ r: 8 }} name="Lessons Generated" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ProgressChart;
