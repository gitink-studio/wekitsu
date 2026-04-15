import fs from 'fs';
import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let pushingToDeploy = false;

// Check what branches are being pushed
rl.on('line', (line) => {
  const parts = line.trim().split(' ');
  if (parts.length >= 3) {
    const remoteRef = parts[2];
    if (remoteRef.includes('refs/heads/deploy')) {
      pushingToDeploy = true;
    }
  }
});

rl.on('close', () => {
  if (!pushingToDeploy) {
    process.exit(0);
  }

  // We are pushing to deploy. Check for version mismatch.
  let currentVersion = 'unknown';
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    currentVersion = packageJson.version;
  } catch (err) {
    console.error('❌ Error: Could not read local package.json');
    process.exit(1);
  }

  try {
    // Attempt to read the remote's package.json
    const remoteDeployVersionOutput = execSync('git show origin/deploy:package.json', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    if (remoteDeployVersionOutput) {
      const remoteDeployPackage = JSON.parse(remoteDeployVersionOutput);
      
      if (currentVersion === remoteDeployPackage.version) {
        console.error(`\n❌ Error: Version (${currentVersion}) has not been updated in package.json.`);
        console.error(`Please update the version in package.json (e.g. using 'npm version patch') before pushing to deploy.\n`);
        process.exit(1);
      } else {
        console.log(`✅ Version check passed: ${remoteDeployPackage.version} -> ${currentVersion}`);
      }
    }
  } catch (e) {
    console.log('⚠️ Could not fetch origin/deploy package.json (might be a new branch or no remote access). Bypassing version check.');
  }
  
  process.exit(0);
});
