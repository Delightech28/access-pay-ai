# Deployment Guide - AI Access Protocol

Complete step-by-step guide for deploying to production.

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] MetaMask/Core Wallet with Avalanche Fuji testnet configured
- [ ] Test AVAX from [Avalanche Faucet](https://faucet.avax.network/)
- [ ] GitHub account (for Vercel deployment)
- [ ] Vercel account (for frontend hosting)
- [ ] VPS or cloud provider account (for backend) - optional

## Part 1: Smart Contract Deployment

### Step 1: Get Test AVAX

1. Visit [https://faucet.avax.network/](https://faucet.avax.network/)
2. Connect your wallet
3. Request test AVAX for Fuji C-Chain
4. Wait for confirmation (~2 seconds)

### Step 2: Deploy Contract via Remix

1. **Open Remix IDE**: [https://remix.ethereum.org/](https://remix.ethereum.org/)

2. **Upload Contract**:
   - Click "File explorer" icon
   - Create new file: `AIServiceAccess.sol`
   - Copy contract code from `contracts/AIServiceAccess.sol`

3. **Compile**:
   - Click "Solidity Compiler" icon
   - Select compiler: 0.8.19+
   - Click "Compile AIServiceAccess.sol"
   - Ensure no errors

4. **Deploy**:
   - Click "Deploy & Run Transactions" icon
   - Environment: "Injected Provider - MetaMask"
   - MetaMask will popup → Switch to Avalanche Fuji
   - Click "Deploy" button
   - Confirm in MetaMask
   - Wait for transaction confirmation

5. **Save Contract Address**:
   - Copy deployed contract address (shown in Remix console)
   - Save it - you'll need this!

### Step 3: Register AI Services

In Remix, with your deployed contract selected:

1. **Expand Contract Functions**: Click dropdown arrow next to deployed contract

2. **Register Services** (run these one by one):

```solidity
// Service 1: GPT-4
registerService(
  "GPT-4 API Access",
  "10000000000000000",  // 0.01 AVAX
  "0xYourWalletAddress"
)

// Service 2: DALL-E
registerService(
  "DALL-E Image Generation",
  "5000000000000000",   // 0.005 AVAX
  "0xYourWalletAddress"
)

// Service 3: Claude
registerService(
  "Claude AI Chat",
  "8000000000000000",   // 0.008 AVAX
  "0xYourWalletAddress"
)

// Add more services as needed...
```

3. **Verify Registration**:
   - Call `serviceCount()` → should return number of services
   - Call `getService(0)` → should return first service details

## Part 2: Backend Deployment

### Option A: Deploy to Railway (Recommended)

1. **Prepare Backend**:
   ```bash
   cd backend
   # Ensure package.json is correct
   ```

2. **Create Railway Account**: [https://railway.app/](https://railway.app/)

3. **Deploy**:
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Set root directory: `/backend`
   - Add environment variables:
     ```
     PORT=3001
     CONTRACT_ADDRESS=0xYourContractAddress
     FUJI_RPC=https://api.avax-test.network/ext/bc/C/rpc
     ```
   - Deploy!

4. **Get API URL**: Copy your Railway app URL (e.g., `https://your-app.railway.app`)

### Option B: Deploy to Render

1. **Create Render Account**: [https://render.com/](https://render.com/)

2. **Create Web Service**:
   - New → Web Service
   - Connect GitHub repo
   - Settings:
     - Root Directory: `backend`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Environment Variables: (same as Railway)

3. **Deploy**: Click "Create Web Service"

### Option C: Deploy to VPS (Advanced)

```bash
# SSH to your server
ssh user@your-server.com

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo
git clone <your-repo-url>
cd ai-access-protocol/backend

# Install dependencies
npm install

# Create .env file
nano .env
# Add your environment variables

# Install PM2 for process management
sudo npm install -g pm2

# Start server
pm2 start server.js --name ai-access-api

# Setup auto-restart
pm2 startup
pm2 save

# Setup nginx reverse proxy (optional)
sudo apt-get install nginx
# Configure nginx to proxy port 3001
```

## Part 3: Frontend Deployment

### Step 1: Configure Environment

1. **Create `.env` file** in project root:
   ```env
   VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
   VITE_API_URL=https://your-backend-url.com
   VITE_CHAIN_ID=43113
   ```

2. **Update Contract Address** in `src/lib/avalanche.ts`:
   ```typescript
   export const CONTRACT_ADDRESS = "0xYourContractAddress";
   ```

### Step 2: Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables**:
   - Go to Vercel dashboard
   - Select your project
   - Settings → Environment Variables
   - Add all variables from `.env`

5. **Redeploy**:
   ```bash
   vercel --prod
   ```

### Alternative: Deploy to Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

4. **Set Environment Variables** in Netlify dashboard

## Part 4: Testing Deployment

### Test Smart Contract

1. **Visit SnowTrace Testnet**: [https://testnet.snowtrace.io/](https://testnet.snowtrace.io/)
2. Search for your contract address
3. Verify contract is deployed
4. Check recent transactions

### Test Backend API

```bash
# Health check
curl https://your-backend-url.com/health

# Get services
curl https://your-backend-url.com/services

# Test payment required response
curl "https://your-backend-url.com/ai/service/1?address=0xTestAddress"
# Should return 402
```

### Test Frontend

1. Visit your deployed URL
2. Click "Connect Wallet"
3. Approve MetaMask connection
4. View services list
5. Try paying for a service
6. Verify transaction on SnowTrace
7. Check that access is granted

## Part 5: Post-Deployment

### Monitor

- **Frontend**: Check Vercel analytics/logs
- **Backend**: Check Railway/Render logs
- **Contract**: Monitor on SnowTrace

### Update Contract Address

If you need to redeploy the contract:

1. Deploy new contract
2. Update `CONTRACT_ADDRESS` in:
   - Frontend: `.env` and `src/lib/avalanche.ts`
   - Backend: `.env` or environment variables
3. Re-register all services
4. Redeploy frontend and backend

### Troubleshooting

**MetaMask not connecting?**
- Ensure Fuji network is added
- Check you have test AVAX
- Try clearing MetaMask cache

**Transaction failing?**
- Insufficient AVAX for gas
- Contract address incorrect
- Service doesn't exist or inactive

**Backend 500 errors?**
- Check environment variables
- Verify contract address
- Check Fuji RPC is accessible
- Review backend logs

## Production Checklist

Before going live with real AVAX (Mainnet):

- [ ] Smart contract audited
- [ ] Environment variables secured (use secrets management)
- [ ] Rate limiting on backend API
- [ ] Error tracking (Sentry, LogRocket)
- [ ] Analytics setup (Plausible, Fathom)
- [ ] Backup RPC endpoints configured
- [ ] Documentation complete
- [ ] Test all user flows
- [ ] Set up monitoring/alerts
- [ ] Enable HTTPS everywhere
- [ ] Configure CORS properly
- [ ] Set up CI/CD pipeline

## Support

For issues during deployment:
- Check the README.md
- Review Avalanche docs: https://docs.avax.network/
- Join Avalanche Discord: https://chat.avax.network/

---

Good luck with your deployment! 🚀
