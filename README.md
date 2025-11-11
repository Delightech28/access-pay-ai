# AI Access Protocol - Avalanche x402 Payment System

A full-stack Web3 application implementing the x402 payment standard for pay-per-access AI services on Avalanche blockchain.

## 🏆 Built for Avalanche Hack2Build Hackathon

This project demonstrates how AI services can use blockchain-based micropayments to control access, ensuring fair compensation for AI providers while enabling seamless access for users and autonomous agents.

## 🎯 Features

- **Smart Contract Payment System**: Solidity contract managing service registration, payments, and access control
- **Wallet Integration**: MetaMask and Core Wallet support with Avalanche Fuji Testnet
- **x402 Payment Standard**: Backend returns HTTP 402 (Payment Required) until blockchain payment confirmed
- **Multiple AI Services**: Support for various AI models (GPT-4, DALL-E, Claude, Whisper, etc.)
- **Real-time Payment Verification**: On-chain verification before granting API access
- **Beautiful UI**: Modern Web3 interface with Avalanche branding

## 🛠️ Tech Stack

### Frontend
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui components
- ethers.js for blockchain interactions
- TanStack Query for state management

### Backend
- Node.js + Express
- ethers.js for contract interaction
- x402 payment protocol implementation

### Blockchain
- Solidity ^0.8.19
- Avalanche C-Chain (Fuji Testnet)
- OpenZeppelin patterns

## 📋 Prerequisites

- Node.js >= 18.x
- npm or yarn
- MetaMask or Core Wallet browser extension
- Avalanche Fuji testnet AVAX (get from [faucet](https://faucet.avax.network/))

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ai-access-protocol

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Deploy Smart Contract

#### Option A: Using Remix IDE (Recommended for beginners)

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Create new file `AIServiceAccess.sol` and paste contract from `contracts/AIServiceAccess.sol`
3. Compile with Solidity 0.8.19+
4. Deploy:
   - Set environment to "Injected Provider - MetaMask"
   - Connect MetaMask to Avalanche Fuji
   - Click "Deploy"
   - Copy deployed contract address

#### Option B: Using Hardhat

```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat
npx hardhat init

# Copy contract to contracts/ folder
# Configure hardhat.config.js for Avalanche Fuji

# Deploy
npx hardhat run scripts/deploy.js --network fuji
```

### 3. Configure Environment

```bash
# Frontend
cp .env.example .env

# Update .env with your contract address
VITE_CONTRACT_ADDRESS=0xYourContractAddress

# Backend
cd backend
cp .env.example .env

# Update backend/.env
CONTRACT_ADDRESS=0xYourContractAddress
```

### 4. Register Services (One-time setup)

After deploying the contract, you need to register AI services. Use Remix or write a script:

```javascript
// Example using ethers.js
const contract = new ethers.Contract(address, abi, signer);

await contract.registerService(
  "GPT-4 API Access",
  ethers.parseEther("0.01"), // 0.01 AVAX
  "0xProviderAddress"
);
```

### 5. Run the Application

```bash
# Terminal 1: Start frontend
npm run dev

# Terminal 2: Start backend
cd backend
npm run dev
```

Visit `http://localhost:8080` to see the app!

## 📝 Usage Flow

1. **Connect Wallet**: Click "Connect Wallet" and approve MetaMask/Core connection
2. **Browse Services**: View available AI services with pricing
3. **Pay for Access**: Click "Pay & Access" on desired service
4. **Confirm Transaction**: Approve the transaction in your wallet
5. **Access Granted**: After confirmation, access to AI service is granted
6. **Use API**: Backend will now return AI responses (currently mocked)

## 🏗️ Architecture

### Smart Contract (`AIServiceAccess.sol`)

```solidity
- registerService(): Owner registers new AI services
- payForService(): Users pay to access services
- hasAccess(): Check if user has paid
- withdraw(): Owner withdraws collected funds
```

### Frontend (`src/`)

- `pages/Index.tsx`: Main dashboard
- `components/WalletConnect.tsx`: Wallet connection UI
- `components/ServiceList.tsx`: List of available services
- `components/ServiceCard.tsx`: Individual service cards
- `lib/avalanche.ts`: Blockchain utilities

### Backend (`backend/`)

- `server.js`: Express API with x402 implementation
- `/ai/service/:id`: Returns 402 or AI response
- `/services`: List available services

## 🔐 x402 Payment Protocol

The backend implements HTTP 402 (Payment Required):

```javascript
// Without payment
GET /ai/service/1?address=0xUser
→ 402 Payment Required
{
  "error": "Payment Required",
  "payment": {
    "contract": "0xContract",
    "serviceId": 1,
    "network": "Avalanche Fuji"
  }
}

// After payment
GET /ai/service/1?address=0xUser
→ 200 OK
{
  "success": true,
  "response": { /* AI response */ }
}
```

## 🧪 Testing

### Test on Fuji Testnet

1. Get test AVAX from [faucet](https://faucet.avax.network/)
2. Connect wallet to Fuji network
3. Pay for a service (small amounts like 0.001 AVAX)
4. Verify transaction on [SnowTrace Testnet](https://testnet.snowtrace.io/)

### Test Backend API

```bash
# Check if payment required
curl "http://localhost:3001/ai/service/1?address=0xYourAddress"

# After paying, try again
curl "http://localhost:3001/ai/service/1?address=0xYourAddress"
```

## 🔄 Future Enhancements

### Phase 2: Python AI Agent Integration
- Python SDK for automatic payment initiation
- Agent-to-agent payment flows
- Autonomous service discovery

### Phase 3: Advanced Features
- Multi-token support (USDC.e, USDT)
- Subscription models
- Pay-per-token pricing
- Service reputation system
- Cross-chain bridges

## 📚 Resources

- [Avalanche Documentation](https://docs.avax.network/)
- [Avalanche SDK](https://github.com/ava-labs/avalanche-sdk)
- [x402 Payment Standard](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/402)
- [ethers.js Docs](https://docs.ethers.org/)

## 🤝 Contributing

This is a hackathon project! Feel free to fork, improve, and submit PRs.

## 📄 License

MIT License - see LICENSE file for details

## 🏅 Hackathon Submission

**Avalanche Hack2Build**
- Category: DeFi Innovation / AI Integration
- Team: [Your Team Name]
- Demo: [Link to demo video]
- Live App: [Deployment URL]

---

Built with ❤️ on Avalanche
