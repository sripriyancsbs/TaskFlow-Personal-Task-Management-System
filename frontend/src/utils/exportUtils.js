/**
 * Download a file client-side
 * @param {string} content
 * @param {string} fileName
 * @param {string} contentType
 */
function downloadFile(content, fileName, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export tasks array to CSV format
 * @param {Array} tasks
 */
export function exportToCSV(tasks) {
  if (!tasks || tasks.length === 0) return false;

  const headers = ['ID', 'Title', 'Description', 'Status', 'Priority', 'Due Date', 'Created At'];
  const rows = tasks.map((t) => [
    t.id,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.status || 'Pending',
    t.priority || 'Medium',
    t.due_date ? new Date(t.due_date).toISOString() : '',
    t.created_at ? new Date(t.created_at).toISOString() : '',
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const fileName = `taskflow-export-${new Date().toISOString().slice(0, 10)}.csv`;
  downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
  return true;
}

/**
 * Export tasks array to JSON format
 * @param {Array} tasks
 */
export function exportToJSON(tasks) {
  if (!tasks || tasks.length === 0) return false;

  const jsonContent = JSON.stringify(tasks, null, 2);
  const fileName = `taskflow-export-${new Date().toISOString().slice(0, 10)}.json`;
  downloadFile(jsonContent, fileName, 'application/json');
  return true;
}
