const { spawn, execSync } = require('child_process')
const readline = require('readline')
const path = require('path')
const fs = require('fs')
const { app } = require('electron')
const os = require('os')
const https = require('https')

let pythonProcess = null
let pythonReadline = null

// Python installation paths and versions
const PYTHON_VERSION = '3.11.8'  // Specific version for consistency
const PYTHON_PATHS = {
  win32: {
    installer: `python-${PYTHON_VERSION}-amd64.exe`,
    downloadUrl: `https://www.python.org/ftp/python/${PYTHON_VERSION}/python-${PYTHON_VERSION}-amd64.exe`,
    defaultPath: 'C:\\Python311'
  },
  darwin: {
    installer: `python-${PYTHON_VERSION}-macos11.pkg`,
    downloadUrl: `https://www.python.org/ftp/python/${PYTHON_VERSION}/python-${PYTHON_VERSION}-macos11.pkg`
  },
  linux: {
    packages: ['python3', 'python3-pip', 'python3-venv']
  }
}

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath)
    https.get(url, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    }).on('error', (err) => {
      fs.unlink(destPath, () => reject(err))
    })
  })
}

async function checkPythonInstallation() {
  try {
    const pythonCmd = getPythonCommand()
    execSync(`${pythonCmd} --version`)
    return true
  } catch (error) {
    return false
  }
}

async function installPythonWindows() {
  const { installer, downloadUrl, defaultPath } = PYTHON_PATHS.win32
  const downloadPath = path.join(app.getPath('temp'), installer)

  console.log('Downloading Python installer...')
  await downloadFile(downloadUrl, downloadPath)

  // Set unrestricted script policy for PowerShell
  try {
    execSync('powershell -Command "Set-ExecutionPolicy Unrestricted -Scope CurrentUser"')
  } catch (error) {
    console.warn('Failed to set PowerShell execution policy:', error)
  }

  console.log('Installing Python...')
  await new Promise((resolve, reject) => {
    const install = spawn(downloadPath, [
      '/quiet',
      'InstallAllUsers=0',
      'PrependPath=1',
      'Include_test=0',
      'Include_pip=1',
      'Include_dev=1',  // Include development headers for building extensions
      'CompileAll=1'    // Pre-compile standard library
    ])
    
    install.on('close', (code) => {
      if (code === 0) {
        // Update PATH to include Python
        process.env.PATH = `${defaultPath};${defaultPath}\\Scripts;${process.env.PATH}`
        resolve()
      } else {
        reject(new Error(`Python installation failed with code ${code}`))
      }
    })
  })

  // Clean up installer
  fs.unlinkSync(downloadPath)

  // Install Visual C++ Build Tools if needed
  try {
    execSync('where cl.exe')
  } catch (error) {
    console.log('Visual C++ Build Tools not found, installing...')
    const vsInstaller = await downloadFile(
      'https://aka.ms/vs/17/release/vs_buildtools.exe',
      path.join(app.getPath('temp'), 'vs_buildtools.exe')
    )
    await new Promise((resolve, reject) => {
      const install = spawn(vsInstaller, [
        '--quiet',
        '--wait',
        '--norestart',
        '--nocache',
        '--installPath', 'C:\\BuildTools',
        '--add', 'Microsoft.VisualStudio.Component.VC.Tools.x86.x64'
      ])
      install.on('close', (code) => code === 0 ? resolve() : reject(new Error(`VS Build Tools installation failed with code ${code}`)))
    })
  }
}

async function installPythonMacOS() {
  const { installer, downloadUrl } = PYTHON_PATHS.darwin
  const downloadPath = path.join(app.getPath('temp'), installer)

  console.log('Downloading Python installer...')
  await downloadFile(downloadUrl, downloadPath)

  console.log('Installing Python...')
  await new Promise((resolve, reject) => {
    const install = spawn('sudo', ['installer', '-pkg', downloadPath, '-target', '/'])
    install.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Python installation failed with code ${code}`))
    })
  })

  // Clean up installer
  fs.unlinkSync(downloadPath)
}

async function installPythonLinux() {
  console.log('Installing Python via package manager...')
  const { packages } = PYTHON_PATHS.linux
  
  // Detect package manager
  let installCmd
  try {
    execSync('which apt')
    installCmd = ['apt-get', 'update', '&&', 'apt-get', 'install', '-y', ...packages]
  } catch {
    try {
      execSync('which dnf')
      installCmd = ['dnf', 'install', '-y', ...packages]
    } catch {
      try {
        execSync('which pacman')
        installCmd = ['pacman', '-Sy', '--noconfirm', ...packages]
      } catch {
        throw new Error('No supported package manager found')
      }
    }
  }

  await new Promise((resolve, reject) => {
    const install = spawn('sudo', installCmd)
    install.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`Python installation failed with code ${code}`))
    })
  })
}

async function ensurePythonInstalled() {
  if (await checkPythonInstallation()) {
    console.log('Python is already installed')
    return
  }

  console.log('Python not found, installing...')
  switch (process.platform) {
    case 'win32':
      await installPythonWindows()
      break
    case 'darwin':
      await installPythonMacOS()
      break
    case 'linux':
      await installPythonLinux()
      break
    default:
      throw new Error('Unsupported platform')
  }

  // Verify installation
  if (!await checkPythonInstallation()) {
    throw new Error('Python installation failed')
  }
}

function getPythonCommand() {
  switch (process.platform) {
    case 'win32':
      return 'python.exe'
    case 'darwin':
    case 'linux':
      return 'python3'
    default:
      return 'python'
  }
}

function getEnvVars() {
  const env = { ...process.env }
  
  switch (process.platform) {
    case 'win32':
      // Windows-specific environment setup
      env.PATH = `${env.PATH};${path.join(app.getPath('userData'), 'Python')}`;
      env.PYTHONPATH = path.join(__dirname, '../../..');
      break;
    case 'darwin':
      // macOS-specific environment setup
      env.PATH = `${env.PATH}:/usr/local/bin:/opt/homebrew/bin`;
      env.PYTHONPATH = path.join(__dirname, '../../..');
      break;
    case 'linux':
      // Linux-specific environment setup
      env.LD_LIBRARY_PATH = env.LD_LIBRARY_PATH || '';
      env.PYTHONPATH = path.join(__dirname, '../../..');
      break;
  }

  return env;
}

async function setupPythonEnv() {
  return new Promise(async (resolve, reject) => {
    try {
      // Ensure Python is installed first
      await ensurePythonInstalled()
      
      console.log('Setting up Python environment...')
      const pythonCmd = getPythonCommand()
      const env = getEnvVars()

      // For Windows, ensure CUDA is available if needed
      if (process.platform === 'win32') {
        try {
          execSync('nvcc --version')
        } catch (error) {
          console.log('CUDA not found, installing CUDA dependencies is recommended for GPU support')
        }
      }
      
      // Install uv package manager first
      const uvInstall = spawn(pythonCmd, ['-m', 'pip', 'install', 'uv'], {
        cwd: path.join(__dirname, '../../..'),
        env
      })

      await new Promise((resolve, reject) => {
        uvInstall.stdout.on('data', (data) => console.log('UV install output:', data.toString()))
        uvInstall.stderr.on('data', (data) => console.error('UV install error:', data.toString()))
        uvInstall.on('close', (code) => {
          if (code === 0) resolve()
          else reject(new Error(`UV installation failed with code ${code}`))
        })
      })

      // Install dependencies using uv with compile extras for Windows
      const installArgs = ['-m', 'uv', 'pip', 'install', '-e', '.']
      if (process.platform === 'win32') {
        installArgs.push('--extra')
        installArgs.push('compile')
      }

      const pythonSetup = spawn(pythonCmd, installArgs, {
        cwd: path.join(__dirname, '../../../Zonos'),
        env: {
          ...env,
          UV_NO_BUILD_ISOLATION: '1'  // Required for Windows builds
        }
      })

      pythonSetup.stdout.on('data', (data) => console.log('Python setup output:', data.toString()))
      pythonSetup.stderr.on('data', (data) => console.error('Python setup error:', data.toString()))
      
      pythonSetup.on('close', (code) => {
        if (code === 0) {
          console.log('Python environment setup completed')
          resolve()
        } else {
          reject(new Error(`Python setup failed with code ${code}`))
        }
      })
    } catch (error) {
      reject(error)
    }
  })
}

async function startPythonProcess(mainWindow) {
  try {
    if (!app.isPackaged || !fs.existsSync(path.join(__dirname, '../../../Zonos'))) {
      await setupPythonEnv()
    }

    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, '../../../server/tts_server.py')
      const samplesPath = process.env.SAMPLES_PATH?.replace('~', app.getPath('home')) || 
                         path.join(app.getPath('home'), 'voicepro/samples')

      fs.mkdirSync(samplesPath, { recursive: true })

      if (pythonProcess) {
        console.log('Python process already running, killing previous instance')
        pythonProcess.kill()
      }

      const pythonCmd = getPythonCommand()
      const env = {
        ...getEnvVars(),
        SAMPLES_PATH: samplesPath
      }

      console.log('Starting Python process with script:', scriptPath)
      pythonProcess = spawn(pythonCmd, [scriptPath], { env })

      pythonProcess.on('error', (error) => {
        console.error('Failed to start Python process:', error)
        reject(error)
        mainWindow?.webContents.send('python-error', {
          type: 'process-error',
          error: error.message
        })
      })

      let initialized = false
      const initTimeout = setTimeout(() => {
        if (!initialized) reject(new Error('Timeout waiting for Python process to initialize'))
      }, 10000)

      pythonReadline = readline.createInterface({
        input: pythonProcess.stdout,
        terminal: false
      })

      pythonProcess.stdout.on('data', (data) => {
        console.log('Python stdout:', data.toString())
        if (!initialized && data.toString().includes('Server ready')) {
          initialized = true
          clearTimeout(initTimeout)
          resolve()
        }
      })

      pythonProcess.stderr.on('data', (data) => console.error('Python stderr:', data.toString()))

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
    })
  } catch (error) {
    console.error('Error in startPythonProcess:', error)
    return Promise.reject(error)
  }
}

async function sendToPython(command) {
  if (!pythonProcess || !pythonReadline) {
    console.log('Python process not running, attempting to restart...')
    try {
      await startPythonProcess()
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      throw new Error('Failed to start Python process: ' + error.message)
    }
  }

  return new Promise((resolve, reject) => {
    let timeout = null
    if (command.type !== 'generate-audio') {
      timeout = setTimeout(() => {
        pythonReadline?.removeListener('line', responseHandler)
        reject(new Error('Timeout waiting for Python response'))
      }, 30000)
    }

    const responseHandler = (line) => {
      try {
        if (!line || line.trim() === '') {
          console.warn('Received empty response from Python')
          return
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

function cleanup() {
  if (pythonProcess) {
    pythonProcess.kill()
    pythonProcess = null
    pythonReadline = null
  }
}

module.exports = {
  startPythonProcess,
  sendToPython,
  cleanup
} 