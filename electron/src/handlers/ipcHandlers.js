const { ipcMain } = require('electron')
const { sendToPython } = require('../services/pythonService')

function setupIpcHandlers(mainWindow) {
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
}

module.exports = setupIpcHandlers 