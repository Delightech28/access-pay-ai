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

// Contract configuration (update after deployment)
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
const CONTRACT_ABI = [
  'function hasAccess(address user, uint256 serviceId) external view returns (bool)',
  'function getService(uint256 serviceId) external view returns (uint256, string, uint256, address, bool)',
];

// Initialize contract
let contract;
try {
  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
} catch (error) {
  console.warn('Contract not initialized - update CONTRACT_ADDRESS');
}

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
    // Check if user has paid for access
    let hasAccess = false;

    if (contract && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000') {
      // Check on-chain access
      hasAccess = await contract.hasAccess(userAddress, serviceId);
    } else {
      // Mock check for development
      console.log(`Mock check: user ${userAddress} accessing service ${serviceId}`);
      hasAccess = false; // Always return false in mock mode
    }

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
    if (contract && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000') {
      const service = await contract.getService(serviceId);
      return res.json({
        id: service[0].toString(),
        name: service[1],
        price: ethers.formatEther(service[2]),
        provider: service[3],
        active: service[4],
      });
    } else {
      // Return mock data
      return res.json(getMockService(serviceId));
    }
  } catch (error) {
    return res.status(404).json({
      error: 'Service not found',
      message: error.message,
    });
  }
});

/**
 * List all services
 */
app.get('/services', (req, res) => {
  // Mock implementation - in production, query from contract
  const services = [
    { id: 1, name: 'GPT-4 API Access', price: '0.01', category: 'LLM' },
    { id: 2, name: 'DALL-E Image Generation', price: '0.005', category: 'Image' },
    { id: 3, name: 'Claude AI Chat', price: '0.008', category: 'LLM' },
    { id: 4, name: 'Whisper Transcription', price: '0.003', category: 'Audio' },
    { id: 5, name: 'Stable Diffusion XL', price: '0.004', category: 'Image' },
    { id: 6, name: 'Code Interpreter', price: '0.012', category: 'Code' },
  ];

  res.json({ services });
});

// Helper functions

function generateMockAIResponse(serviceId, userAddress) {
  const responses = {
    1: {
      model: 'gpt-4',
      content: 'This is a mock GPT-4 response. In production, this would call the actual OpenAI API.',
      tokens: 150,
    },
    2: {
      model: 'dall-e-3',
      imageUrl: 'https://placeholder.com/generated-image.png',
      prompt: 'Sample generated image',
    },
    3: {
      model: 'claude-3',
      content: 'Mock Claude AI response with advanced reasoning capabilities.',
      tokens: 200,
    },
    4: {
      model: 'whisper-1',
      transcription: 'This is a mock transcription of the audio file.',
      duration: 60,
    },
    5: {
      model: 'stable-diffusion-xl',
      imageUrl: 'https://placeholder.com/sd-image.png',
      seed: 12345,
    },
    6: {
      model: 'code-interpreter',
      result: 'print("Hello from AI code interpreter")',
      output: 'Hello from AI code interpreter',
    },
  };

  return responses[serviceId] || { message: 'AI response generated successfully' };
}

function getMockService(serviceId) {
  const services = {
    1: { id: 1, name: 'GPT-4 API Access', price: '0.01', provider: 'OpenAI', active: true },
    2: { id: 2, name: 'DALL-E Image Generation', price: '0.005', provider: 'OpenAI', active: true },
    3: { id: 3, name: 'Claude AI Chat', price: '0.008', provider: 'Anthropic', active: true },
    4: { id: 4, name: 'Whisper Transcription', price: '0.003', provider: 'OpenAI', active: true },
    5: { id: 5, name: 'Stable Diffusion XL', price: '0.004', provider: 'Stability AI', active: true },
    6: { id: 6, name: 'Code Interpreter', price: '0.012', provider: 'Custom', active: true },
  };

  return services[serviceId] || null;
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Access Protocol API running on port ${PORT}`);
  console.log(`📡 Connected to Avalanche Fuji Testnet`);
  console.log(`📝 Contract: ${CONTRACT_ADDRESS}`);
});

module.exports = app;
