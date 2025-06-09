
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Calendar, Clock, Users } from "lucide-react";

const AnalyticsChart = () => {
  // Mock data for charts
  const weeklyAttendance = [
    { day: "Mon", present: 142, absent: 8, rate: 94.7 },
    { day: "Tue", present: 145, absent: 5, rate: 96.7 },
    { day: "Wed", present: 140, absent: 10, rate: 93.3 },
    { day: "Thu", present: 148, absent: 2, rate: 98.7 },
    { day: "Fri", present: 139, absent: 11, rate: 92.7 },
  ];

  const monthlyTrend = [
    { month: "Jan", rate: 92.5 },
    { month: "Feb", rate: 94.2 },
    { month: "Mar", rate: 91.8 },
    { month: "Apr", rate: 95.1 },
    { month: "May", rate: 94.7 },
    { month: "Jun", rate: 96.3 },
  ];

  const departmentData = [
    { name: "Engineering", value: 45, color: "#8884d8" },
    { name: "Marketing", value: 25, color: "#82ca9d" },
    { name: "Sales", value: 30, color: "#ffc658" },
    { name: "HR", value: 15, color: "#ff7300" },
    { name: "Finance", value: 20, color: "#00ff88" },
  ];

  const timeAnalysis = [
    { time: "08:00", checkIns: 15 },
    { time: "08:30", checkIns: 35 },
    { time: "09:00", checkIns: 75 },
    { time: "09:30", checkIns: 45 },
    { time: "10:00", checkIns: 20 },
    { time: "10:30", checkIns: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">95.2%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">9:00 AM</div>
            <p className="text-xs text-muted-foreground">Most common check-in time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Department</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Engineering</div>
            <p className="text-xs text-muted-foreground">97.8% attendance rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Attendance Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Overview</CardTitle>
            <CardDescription>
              Daily attendance patterns for the current week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyAttendance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" fill="#22c55e" name="Present" />
                <Bar dataKey="absent" fill="#ef4444" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Attendance Trend</CardTitle>
            <CardDescription>
              Attendance rate trends over the past 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[85, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, "Attendance Rate"]} />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>
              Employee distribution across departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Check-in Time Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Check-in Time Analysis</CardTitle>
            <CardDescription>
              Distribution of employee check-in times
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="checkIns" fill="#8b5cf6" name="Check-ins" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsChart;
