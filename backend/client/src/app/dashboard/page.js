export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Guides</h3>
          <p className="text-3xl font-bold text-blue-600">24</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Destinations</h3>
          <p className="text-3xl font-bold text-green-600">18</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Active Users</h3>
          <p className="text-3xl font-bold text-purple-600">1,234</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Bookings</h3>
          <p className="text-3xl font-bold text-orange-600">89</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <span>New guide registration: "Paris City Tour"</span>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span>Booking confirmed for "Rome Adventure"</span>
            <span className="text-sm text-gray-500">4 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span>New user registration</span>
            <span className="text-sm text-gray-500">6 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
