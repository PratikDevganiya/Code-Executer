const RecentSubmissions = ({ submissions = [] }) => {
  return (
    <div className="bg-[#D3C89F] p-6 rounded-lg shadow-md w-full text-gray-900">
      <h2 className="text-xl font-semibold mb-4">Recent Submissions</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border border-gray-700">
          <thead className="bg-gray-700 text-white">
            <tr>
              <th className="p-2">Language</th>
              <th className="p-2">Code</th>
              <th className="p-2">Status</th>
              <th className="p-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length > 0 ? (
              submissions.map((submission) => (
                <tr key={submission._id || submission.id} className="border-t border-gray-600">
                  <td className="p-2">{submission.language}</td>
                  <td className="p-2 truncate max-w-xs">{submission.codeSnippet}</td>
                  <td className="p-2">{submission.status}</td>
                  <td className="p-2">{new Date(submission.time).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-2 text-center text-gray-500">
                  No submissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentSubmissions;
