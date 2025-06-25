import { Card } from "./TeamMemberList";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042"];

const FeedbackDashboard = ({feedbackAnalytics}) => {
    const total = feedbackAnalytics.length;
    const submitted = feedbackAnalytics.filter(f => ["submitted", "acknowledged"].includes(f.status)).length;
    const draft = feedbackAnalytics.filter(f => f.status === "draft").length;
    const requested = feedbackAnalytics.filter(f => f.status === "requested").length;
    const acknowledged = feedbackAnalytics.filter(f => f.status === "acknowledged").length;
    const sentimentCount = feedbackAnalytics.filter(f => f.sentiment && ["submitted", "acknowledged"].includes(f.status)).reduce((acc, item) => {
      acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
      return acc;
    }, {});
  
    const sentimentData = Object.entries(sentimentCount).map(([key, value]) => ({
      name: key,
      value
    }));
  
    const statusData = [
      { name: "Submitted", value: submitted },
      { name: "Draft", value: draft },
      { name: "Requested", value: requested},
      { name: "Acknowledged", value: acknowledged}
    ];
  
    return (
      <div className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-6">
        {/* Summary Cards */}
        <div className="col-span-2"><Card emp={{name: "Total Feedback", role: total, email:""}} /></div>
        <div className="col-span-2"><Card emp={{name: "Submitted", role: submitted, email:""}}/></div>
        <div className="col-span-2"><Card emp={{name: "Drafts", role: draft, email:""}} /></div>
  
        {/* Sentiment Pie Chart */}
        <div className="col-span-3 md:col-span-3">
        <Card>
            <p className="text-lg font-semibold mb-2">Sentiment Distribution (of submitted feedbacks)</p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={sentimentData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
        </Card>
        </div>
  
        {/* Status Bar Chart */}
        <div className="col-span-3 md:col-span-3">
        <Card>
            <p className="text-lg font-semibold mb-2">Feedback by Status</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
        </Card>
                    </div>
        {/* Recent Feedback Table */}
        <div className="col-span-6">
        <Card >
            <p className="text-lg font-semibold mb-2">Latest Feedback Entries</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Employee</th>
                  <th>Sentiment</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {feedbackAnalytics.map(entry => (
                  <tr key={entry.id} className="border-b">
                    <td className="py-2">{entry.employee_name}</td>
                    <td>{entry.sentiment}</td>
                    <td>{entry.status}</td>
                    <td>{new Date(entry.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </Card>
        </div>
      </div>
    );
  };

export default FeedbackDashboard;
  