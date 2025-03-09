const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const serve = require('electron-serve')
const { spawn } = require('child_process')
const readline = require('readline')

let mainWindow
let pythonProcess
let pythonReadline

async function sendToPython(command) {
  // Ensure Python process is running
  if (!pythonProcess || !pythonReadline) {
    console.log('Python process not running, attempting to restart...')
    try {
      startPythonProcess()
      // Wait for process to initialize
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      throw new Error('Failed to start Python process: ' + error.message)
    }
  }

  return new Promise((resolve, reject) => {
    // Only set timeout for non-generation commands
    let timeout = null
    if (command.type !== 'generate-audio') {
      timeout = setTimeout(() => {
        pythonReadline?.removeListener('line', responseHandler)
        reject(new Error('Timeout waiting for Python response'))
      }, 30000)
    }

    const responseHandler = (line) => {
      try {
        console.log('Raw Python response:', line) // Debug logging
        
        if (!line || line.trim() === '') {
          console.warn('Received empty response from Python')
          return // Don't process empty lines
        }

        const response = JSON.parse(line)
        if (timeout) clearTimeout(timeout)
        pythonReadline?.removeListener('line', responseHandler)
        
        if (!response) {
          reject(new Error('Received null response from Python'))
          return
        }

        if (response.success === undefined) {
          reject(new Error('Invalid response format: missing success field'))
          return
        }

        if (response.success) {
          resolve(response.data)
        } else {
          reject(new Error(response.error || 'Unknown error occurred'))
        }
      } catch (error) {
        console.error('Error processing Python response:', error, 'Raw response:', line)
        if (timeout) clearTimeout(timeout)
        pythonReadline?.removeListener('line', responseHandler)
        reject(error)
      }
    }

    if (!pythonReadline) {
      if (timeout) clearTimeout(timeout)
      reject(new Error('Python readline interface is not available'))
      return
    }

    pythonReadline.on('line', responseHandler)
    
    try {
      const commandStr = JSON.stringify(command) + '\n'
      console.log('Sending to Python:', commandStr) // Debug logging
      
      if (!pythonProcess?.stdin?.writable) {
        if (timeout) clearTimeout(timeout)
        pythonReadline.removeListener('line', responseHandler)
        reject(new Error('Python process stdin is not writable'))
        return
      }

      pythonProcess.stdin.write(commandStr)
    } catch (error) {
      if (timeout) clearTimeout(timeout)
      pythonReadline?.removeListener('line', responseHandler)
      reject(error)
    }
  })
}

// Modify startPythonProcess to return a promise
function startPythonProcess() {
  return new Promise((resolve, reject) => {
    try {
      // Adjust path as needed
      const scriptPath = path.join(__dirname, '../../server/tts_server.py')
      const samplesPath = path.join(__dirname, '../../public/samples')
      
      // Check if Python process is already running
      if (pythonProcess) {
        console.log('Python process already running, killing previous instance')
        pythonProcess.kill()
      }

      console.log('Starting Python process with script:', scriptPath)
      pythonProcess = spawn('python', [scriptPath], {
        env: {
          ...process.env,
          SAMPLES_PATH: samplesPath
        }
      })
      
      // Set up error handler early
      pythonProcess.on('error', (error) => {
        console.error('Failed to start Python process:', error)
        reject(error)
        mainWindow?.webContents.send('python-error', {
          type: 'process-error',
          error: error.message
        })
      })

      // Wait for process to be ready
      let initialized = false
      const initTimeout = setTimeout(() => {
        if (!initialized) {
          reject(new Error('Timeout waiting for Python process to initialize'))
        }
      }, 10000)

      pythonReadline = readline.createInterface({
        input: pythonProcess.stdout,
        terminal: false
      })

      // Log stdout for debugging
      pythonProcess.stdout.on('data', (data) => {
        console.log('Python stdout:', data.toString())
        if (!initialized && data.toString().includes('Server ready')) {
          initialized = true
          clearTimeout(initTimeout)
          resolve()
        }
      })

      // Log stderr for debugging
      pythonProcess.stderr.on('data', (data) => {
        console.error('Python stderr:', data.toString())
      })

      pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`)
        if (code !== 0) {
          mainWindow?.webContents.send('python-error', {
            type: 'process-closed',
            code: code
          })
        }
        pythonProcess = null
        pythonReadline = null
      })

    } catch (error) {
      console.error('Error in startPythonProcess:', error)
      reject(error)
    }
  })
}

// IPC Handlers
ipcMain.handle('get-supported-models', async () => {
  try {
    return await sendToPython({ type: 'get_models' })
  } catch (error) {
    console.error('Error getting models:', error)
    throw error
  }
})

ipcMain.handle('get-model-conditioners', async (event, modelChoice) => {
  try {
    return await sendToPython({ 
      type: 'get_conditioners',
      model: modelChoice
    })
  } catch (error) {
    console.error('Error getting conditioners:', error)
    throw error
  }
})

ipcMain.handle('generate-audio', async (event, params) => {
  try {
    if (!params) {
      throw new Error('No parameters provided for audio generation')
    }

    console.log('Attempting to generate audio with params:', params)
    
    const result = await sendToPython({
      type: 'generate-audio',
      params
    })

    if (!result) {
      throw new Error('No result received from Python process')
    }

    return result
  } catch (error) {
    console.error('Error generating audio:', error)
    // Send error to renderer process for better user feedback
    mainWindow?.webContents.send('python-error', {
      type: 'generation-error',
      error: error.message
    })
    throw error
  }
})

ipcMain.handle('get-settings', async () => {
  try {
    return await sendToPython({ type: 'get_settings' })
  } catch (error) {
    console.error('Error getting settings:', error)
    throw error
  }
})

ipcMain.handle('update-settings', async (event, settings) => {
  try {
    return await sendToPython({ 
      type: 'update_settings',
      settings
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    throw error
  }
})

ipcMain.handle('get-projects', async () => {
  try {
    return await sendToPython({ type: 'get_projects' })
  } catch (error) {
    console.error('Error getting projects:', error)
    throw error
  }
})

ipcMain.handle('save-project', async (event, project) => {
  try {
    return await sendToPython({
      type: 'save_project',
      project
    })
  } catch (error) {
    console.error('Error saving project:', error)
    throw error
  }
})

ipcMain.handle('get-project', async (event, projectId) => {
  try {
    return await sendToPython({
      type: 'get_project',
      projectId
    })
  } catch (error) {
    console.error('Error getting project:', error)
    throw error
  }
})

ipcMain.handle('get-history', async () => {
  try {
    return await sendToPython({ type: 'get_history' })
  } catch (error) {
    console.error('Error getting history:', error)
    throw error
  }
})

ipcMain.handle('delete-project', async (event, projectId) => {
  try {
    return await sendToPython({
      type: 'delete_project',
      projectId
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    throw error
  }
})

ipcMain.handle('create-from-template', async (event, { templateName, newName }) => {
  try {
    return await sendToPython({
      type: 'create_from_template',
      templateName,
      newName
    })
  } catch (error) {
    console.error('Error creating from template:', error)
    throw error
  }
})

ipcMain.handle('clear-history', async () => {
  try {
    return await sendToPython({ type: 'clear_history' })
  } catch (error) {
    console.error('Error clearing history:', error)
    throw error
  }
})

ipcMain.handle('undo-action', async (event, actionId) => {
  try {
    return await sendToPython({
      type: 'undo_action',
      actionId
    })
  } catch (error) {
    console.error('Error undoing action:', error)
    throw error
  }
})

ipcMain.handle('get-voice-settings', async (event, voice) => {
  try {
    return await sendToPython({
      type: 'get_voice_settings',
      voice
    })
  } catch (error) {
    console.error('Error getting voice settings:', error)
    throw error
  }
})

const appServe = app.isPackaged ? serve({
  directory: path.join(__dirname, "../../out")
}) : null;

const createWindow = () => {
  startPythonProcess()
  
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false  // Don't show until ready
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  if (app.isPackaged) {
    appServe(mainWindow).then(() => {
      mainWindow.loadURL("app://-");
    });
  } else {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
    mainWindow.webContents.on("did-fail-load", () => {
      mainWindow.webContents.reloadIgnoringCache();
    });
  }

  // Handle IPC messages
  mainWindow.webContents.on('ipc-message', (event, channel, ...args) => {
    console.log('IPC message:', channel, args);
  });
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (pythonProcess) {
    pythonProcess.kill()
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
}); 