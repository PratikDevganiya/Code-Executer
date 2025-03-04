const CollaborationHistory = ({ history = [] }) => {
  // Ensure history is an array before mapping
  if (!Array.isArray(history)) {
    console.error("Invalid history data:", history);
    return <p className="text-gray-500">No history available.</p>;
  }

  return (
    <div className="bg-[#D3C89F] p-6 rounded-lg shadow-md w-full text-gray-900">
      <h2 className="text-xl font-semibold mb-4">Collaboration History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border border-gray-700">
          <thead className="bg-gray-700 text-white">
            <tr>
              <th className="p-2">Document</th>
              <th className="p-2">Editor</th>
              <th className="p-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {history.length > 0 ? (
              history.map((entry, index) => (
                <tr key={entry._id || index} className="border-t border-gray-600">
                  <td className="p-2">{entry.documentName || "Untitled"}</td>
                  <td className="p-2">{entry.editor || "Unknown"}</td>
                  <td className="p-2">{new Date(entry.timestamp).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-2 text-center text-gray-500">
                  No collaboration history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CollaborationHistory;
