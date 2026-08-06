import client from './client';

// Downloads a file from an authenticated API endpoint (plain <a href> can't attach
// the JWT header, so we fetch as a blob and trigger a save via an object URL).
export async function downloadFile(url, filename) {
  const res = await client.get(url, { responseType: 'blob' });
  const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}
