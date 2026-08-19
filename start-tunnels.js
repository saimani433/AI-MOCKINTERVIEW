import localtunnel from 'localtunnel';
import fs from 'fs';
import path from 'path';
import { exec, execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start() {
  try {
    console.log('[Tunnel] Starting backend tunnel on port 5000...');
    const backendTunnel = await localtunnel({ port: 5000 });
    const backendUrl = backendTunnel.url;
    console.log(`[Tunnel] Backend Tunnel is active: ${backendUrl}`);

    // Update frontend/.env
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace VITE_API_URL line
    envContent = envContent.replace(
      /^VITE_API_URL=.*$/m,
      `VITE_API_URL=${backendUrl}/api`
    );
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log(`[Tunnel] .env updated with VITE_API_URL=${backendUrl}/api`);

    // Build and sync Capacitor
    console.log('[Tunnel] Syncing Capacitor with new API URL...');
    execSync('npm run android:sync', { cwd: __dirname, stdio: 'inherit' });
    console.log('[Tunnel] Capacitor sync complete.');

    // Start Vite dev server in background
    console.log('[Vite] Starting Vite dev server on port 5188...');
    const viteProcess = exec('npx vite --port 5188 --strictPort --host 127.0.0.1', { cwd: __dirname });
    
    viteProcess.stdout.on('data', (data) => {
      console.log(`[Vite] ${data.trim()}`);
    });
    viteProcess.stderr.on('data', (data) => {
      console.error(`[Vite Error] ${data.trim()}`);
    });

    // Wait 3 seconds for Vite to spin up
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Start frontend tunnel
    console.log('[Tunnel] Starting frontend tunnel on port 5188...');
    const frontendTunnel = await localtunnel({ port: 5188 });
    
    console.log('\n================================================================');
    console.log(`[Host Link] Website URL:   ${frontendTunnel.url}`);
    console.log(`[API Link]  Backend URL:   ${backendUrl}`);
    console.log('================================================================\n');
    console.log('Both tunnels are running. Open the Website URL on your phone or browser!');

    // Handle exits to close everything gracefully
    process.on('SIGINT', () => {
      console.log('\nClosing tunnels and Vite dev server...');
      backendTunnel.close();
      frontendTunnel.close();
      viteProcess.kill();
      process.exit();
    });

  } catch (err) {
    console.error('Error starting tunnels:', err);
  }
}

start();
