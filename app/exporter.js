
window.EXPORTER = (function(){

  function importJSON() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';

      input.onchange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        try {
          const text = await file.text();
          resolve(JSON.parse(text));
        } catch (err) {
          reject(new Error(`Invalid JSON file: ${err.message}`));
        }
      };

      // Optional: Handle user canceling the file dialog
      input.oncancel = () => {
        reject(new Error('File selection canceled'));
      };

      input.click();
    });
  }

  function downloadJSON(data, filename = 'data.json') {
    // 1. Convert the JavaScript object to a formatted JSON string
    const jsonString = JSON.stringify(data, null, 2);
  
    // 2. Create a Blob with the JSON MIME type
    const blob = new Blob([jsonString], { type: 'application/json' });
  
    // 3. Create a temporary URL and anchor element
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
  
    // 4. Append, trigger the download, and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function exportProgress() {
    const data = {}
    const entries = Object.entries(localStorage);
    for (const [key, value] of entries) data[key] = value;
    downloadJSON(data, "my-progress.json");
  }

  async function importProgress() {
    try {
      const data = await importJSON();
      if (!data) return;
      const entries = Object.entries(data);
      for (const [key, value] of entries) localStorage.setItem(key, value);
    } catch(e) {}
  }

  return { exportProgress, importProgress };
})();
