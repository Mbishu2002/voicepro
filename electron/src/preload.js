const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "electron",
  {
    invoke: (channel, ...args) => {
      const validChannels = [
        "get-supported-models",
        "get-model-conditioners",
        "generate-audio",
        "get-settings",
        "update-settings",
        "get-projects",
        "save-project",
        "get-project",
        "get-history",
        "delete-project",
        "create-from-template",
        "clear-history",
        "undo-action",
        "get-voice-settings"
      ];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, ...args);
      }
      throw new Error(`Unauthorized IPC channel: ${channel}`);
    },
    send: (channel, data) => {
      const validChannels = ["keyPress"];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    on: (channel, func) => {
      const validChannels = ["fromMain"];
      if (validChannels.includes(channel)) {
        // Strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  }
); 