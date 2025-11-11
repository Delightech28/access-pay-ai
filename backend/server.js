// Backend API server for x402 payment-required responses
// Node.js + Express implementation

const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Avalanche Fuji RPC
const FUJI_RPC = 'https://api.avax-test.network/ext/bc/C/rpc';
const provider = new ethers.JsonRpcProvider(FUJI_RPC);

// Contract configuration
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0xec82b07d2acc99c9dd7eb1676420cba5997f7dfa';
const CONTRACT_ABI = [
  'function hasAccess(address user, uint256 serviceId) external view returns (bool)',
  'function getService(uint256 serviceId) external view returns (uint256 id, string name, uint256 price, address provider, bool active)',
  'function serviceCount() external view returns (uint256)',
  'event AccessGranted(address indexed user, uint256 indexed serviceId, uint256 amount)',
];

// Initialize contract
const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Access Protocol API is running' });
});

/**
 * AI Service endpoint with x402 payment check
 * Returns 402 if payment not made, 200 with AI response if paid
 */
app.get('/ai/service/:id', async (req, res) => {
  const serviceId = parseInt(req.params.id);
  const userAddress = req.query.address;

  // Validate inputs
  if (!userAddress) {
    return res.status(400).json({
      error: 'Missing required parameter: address',
    });
  }

  if (isNaN(serviceId)) {
    return res.status(400).json({
      error: 'Invalid service ID',
    });
  }

  try {
    // Check if user has paid for access on-chain
    const hasAccess = await contract.hasAccess(userAddress, serviceId);

    if (!hasAccess) {
      // Return 402 Payment Required with payment details
      return res.status(402).json({
        error: 'Payment Required',
        message: 'You must pay to access this AI service',
        payment: {
          contract: CONTRACT_ADDRESS,
          serviceId: serviceId,
          network: 'Avalanche Fuji Testnet',
          chainId: 43113,
        },
      });
    }

    // Access granted - return AI response (mock)
    const aiResponse = generateMockAIResponse(serviceId, userAddress);
    
    return res.status(200).json({
      success: true,
      serviceId: serviceId,
      response: aiResponse,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

/**
 * Get service details
 */
app.get('/services/:id', async (req, res) => {
  const serviceId = parseInt(req.params.id);

  if (isNaN(serviceId)) {
    return res.status(400).json({ error: 'Invalid service ID' });
  }

  try {
    const service = await contract.getService(serviceId);
    return res.json({
      id: service.id.toString(),
      name: service.name,
      price: ethers.formatEther(service.price),
      provider: service.provider,
      active: service.active,
    });
  } catch (error) {
    return res.status(404).json({
      error: 'Service not found',
      message: error.message,
    });
  }
});

/**
 * List all services from contract
 */
app.get('/services', async (req, res) => {
  try {
    const serviceCount = await contract.serviceCount();
    const services = [];

    for (let i = 0; i < serviceCount; i++) {
      const service = await contract.getService(i);
      if (service.active) {
        services.push({
          id: service.id.toString(),
          name: service.name,
          price: ethers.formatEther(service.price),
          provider: service.provider,
          active: service.active,
        });
      }
    }

    res.json({ services });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      error: 'Failed to fetch services',
      message: error.message,
    });
  }
});

// Helper function for mock AI responses
function generateMockAIResponse(serviceId, userAddress) {
  const responses = {
    0: {
      model: 'gpt-4',
      content: 'This is a mock GPT-4 response. In production, this would call the actual OpenAI API.',
      tokens: 150,
    },
    1: {
      model: 'dall-e-3',
      imageUrl: 'https://placeholder.com/generated-image.png',
      prompt: 'Sample generated image',
    },
    2: {
      model: 'claude-3',
      content: 'Mock Claude AI response with advanced reasoning capabilities.',
      tokens: 200,
    },
  };

  return responses[serviceId] || { message: 'AI response generated successfully' };
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Access Protocol API running on port ${PORT}`);
  console.log(`📡 Connected to Avalanche Fuji Testnet`);
  console.log(`📝 Contract: ${CONTRACT_ADDRESS}`);
});

module.exports = app;
