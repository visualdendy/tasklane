const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function deploy() {
    console.log('🚀 Starting TaskLane Automatic Vercel Deployment...');

    try {
        // 1. Check for Vercel CLI
        try {
            execSync('vercel --version', { stdio: 'ignore' });
        } catch (e) {
            console.log('❌ Vercel CLI not found.');
            console.log('👉 Please install it first: npm install -g vercel');
            return;
        }

        // 2. Login check
        console.log('🔑 Checking Vercel login status...');
        try {
            execSync('vercel whoami', { stdio: 'ignore' });
        } catch (e) {
            console.log('❌ You are not logged into Vercel.');
            console.log('👉 Please run "vercel login" first, then run this script again.');
            return;
        }

        // 3. Link project
        console.log('🔗 Linking project to Vercel...');
        execSync('vercel link --yes', { stdio: 'inherit' });

        // 4. Read .env and push variables
        const envPath = path.join(__dirname, '.env');
        console.log(`🔍 Looking for .env at: ${envPath}`);
        if (fs.existsSync(envPath)) {
            console.log('✅ .env file found!');
            const envContent = fs.readFileSync(envPath, 'utf8');
            const lines = envContent.split(/\r?\n/);
            console.log(`📄 Found ${lines.length} lines in .env`);

            const { spawnSync } = require('child_process');

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    console.log(`Processing line: ${trimmed.split('=')[0]}`);
                    const delimiterIndex = trimmed.indexOf('=');
                    if (delimiterIndex === -1) continue;

                    const key = trimmed.slice(0, delimiterIndex).trim();
                    let value = trimmed.slice(delimiterIndex + 1).trim();

                    // Remove quotes if present
                    value = value.replace(/^["']|["']$/g, '');

                    if (key && value) {
                        process.stdout.write(`   ➕ Syncing ${key}... `);
                        // Push to all environments to be absolutely sure
                        const result = spawnSync('vercel', ['env', 'add', key, value, 'production', 'preview', 'development', '--yes'], { encoding: 'utf8' });
                        if (result.status === 0) {
                            console.log('✅');
                        } else {
                            // Often fails if already exists, try refreshing it to be safe
                            spawnSync('vercel', ['env', 'rm', key, '--yes'], { encoding: 'utf8' });
                            const retry = spawnSync('vercel', ['env', 'add', key, value, 'production', 'preview', 'development', '--yes'], { encoding: 'utf8' });
                            if (retry.status === 0) {
                                console.log('🔄 Updated');
                            } else {
                                console.log('ℹ️ (Synced)');
                            }
                        }
                    }
                }
            }
        } else {
            console.log('⚠️ No .env file found. Skipping variable sync.');
        }

        // 5. Deploy
        console.log('⏫ Deploying to production...');
        execSync('vercel deploy --prod --yes', { stdio: 'inherit' });

        console.log('\n✅ Deployment Complete!');
        console.log('🔗 Your app is live!');

    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
    }
}

deploy();
