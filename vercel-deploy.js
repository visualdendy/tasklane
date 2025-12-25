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
        if (fs.existsSync(envPath)) {
            console.log('📤 Syncing environment variables from .env to Vercel...');
            const envContent = fs.readFileSync(envPath, 'utf8');
            const lines = envContent.split(/\r?\n/);

            const { spawnSync } = require('child_process');

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#')) {
                    const delimiterIndex = trimmed.indexOf('=');
                    if (delimiterIndex === -1) continue;

                    const key = trimmed.slice(0, delimiterIndex).trim();
                    let value = trimmed.slice(delimiterIndex + 1).trim();

                    // Remove quotes if present
                    value = value.replace(/^["']|["']$/g, '');

                    if (key && value) {
                        process.stdout.write(`   ➕ Adding ${key}... `);
                        const result = spawnSync('vercel', ['env', 'add', key, value, 'production', '--yes'], { encoding: 'utf8' });
                        if (result.status === 0) {
                            console.log('✅');
                        } else {
                            console.log('ℹ️ (Synced or already exists)');
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
