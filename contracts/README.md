# Smart Contract Deployment Guide

## Quick Deploy with Remix

1. **Open Remix**: Go to [remix.ethereum.org](https://remix.ethereum.org/)

2. **Create Contract**: 
   - Click "File explorer" → New File
   - Name it `AIServiceAccess.sol`
   - Copy contents from `AIServiceAccess.sol`

3. **Compile**:
   - Click "Solidity Compiler" tab
   - Select compiler version 0.8.19 or higher
   - Click "Compile AIServiceAccess.sol"

4. **Deploy to Avalanche Fuji**:
   - Click "Deploy & Run Transactions" tab
   - Set Environment to "Injected Provider - MetaMask"
   - In MetaMask, switch to Avalanche Fuji Testnet
   - Click "Deploy"
   - Confirm transaction in MetaMask

5. **Copy Contract Address**: After deployment, copy the contract address

6. **Register Services**: In Remix, use these functions to register AI services:
   ```solidity
   registerService(
     "GPT-4 API Access",
     10000000000000000,  // 0.01 AVAX in wei
     "0xYourProviderAddress"
   )
   ```

## Contract Functions

### Owner Functions
- `registerService(name, price, provider)`: Register new AI service
- `deactivateService(serviceId)`: Disable a service
- `withdraw()`: Withdraw collected funds
- `transferOwnership(newOwner)`: Transfer contract ownership

### User Functions
- `payForService(serviceId)`: Pay for access (payable)
- `hasAccess(user, serviceId)`: Check if user has access
- `getService(serviceId)`: Get service details
- `getBalance()`: Get contract balance

### Events
- `ServiceRegistered`: Emitted when service is registered
- `AccessGranted`: Emitted when user pays for access
- `ServiceDeactivated`: Emitted when service is disabled
- `FundsWithdrawn`: Emitted when owner withdraws funds

## Testing the Contract

After deployment, test with these steps:

1. **Register a Test Service**:
   ```
   registerService("Test AI", 1000000000000000, "0xYourAddress")
   ```

2. **Pay for Service** (from different account):
   ```
   payForService(0) 
   // Send 0.001 AVAX with transaction
   ```

3. **Check Access**:
   ```
   hasAccess("0xUserAddress", 0)
   // Should return: true
   ```

4. **Withdraw Funds**:
   ```
   withdraw()
   // Transfers balance to owner
   ```

## Security Notes

- Contract uses OpenZeppelin patterns
- Access control via `onlyOwner` modifier
- Refunds excess payment automatically
- Prevents double payment with access tracking
- Events for all state changes

## Upgrading

To upgrade the contract:
1. Deploy new version
2. Update frontend config with new address
3. Re-register services in new contract
4. Withdraw funds from old contract
