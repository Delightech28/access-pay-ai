# Smart Contract Deployment Guide

## ⚠️ Important: Contract Updated for Time-Limited Access

The `AIServiceAccess.sol` contract has been updated to implement **1-hour time-limited access**. You must redeploy the contract to activate this feature.

## What Changed

### Previous Behavior
- Once a user paid for a service, `accessGranted[user][serviceId]` was set to `true` forever
- No expiration mechanism
- Users couldn't pay again

### New Behavior
- Access expires **exactly 1 hour** after payment
- Contract tracks `accessExpiry[user][serviceId]` as a Unix timestamp
- Users can pay again after their access expires
- Events include expiry timestamps
- New `getAccessExpiry()` function to query expiry time

### Contract Changes Summary

1. **Storage Variable Changed:**
   ```solidity
   // OLD:
   mapping(address => mapping(uint256 => bool)) public accessGranted;
   
   // NEW:
   mapping(address => mapping(uint256 => uint256)) public accessExpiry;
   uint256 public constant ACCESS_DURATION = 1 hours;
   ```

2. **Updated `payForService()` Function:**
   - Sets expiry timestamp: `block.timestamp + ACCESS_DURATION`
   - Allows re-payment after expiry
   - Emits `AccessGranted` event with `expiresAt` timestamp

3. **Updated `hasAccess()` Function:**
   - Returns `true` only if `accessExpiry[user][serviceId] > block.timestamp`
   - Access automatically expires after 1 hour

4. **New Function Added:**
   ```solidity
   function getAccessExpiry(address _user, uint256 _serviceId) 
       external view returns (uint256)
   ```
   - Returns expiry timestamp for a user's service access
   - Returns `0` if user never paid

5. **New Event Added:**
   ```solidity
   event AccessExpired(address indexed user, uint256 indexed serviceId);
   ```

## Deployment Instructions

### Step 1: Open Remix IDE

Go to [remix.ethereum.org](https://remix.ethereum.org/)

### Step 2: Create New Contract File

1. Click **File Explorer** → **New File**
2. Name it: `AIServiceAccess.sol`
3. Copy the entire contents from `contracts/AIServiceAccess.sol` in this project
4. Paste into Remix

### Step 3: Compile

1. Click **Solidity Compiler** tab (left sidebar)
2. Select compiler version: **0.8.19 or higher**
3. Click **Compile AIServiceAccess.sol**
4. Wait for "Compilation successful" message

### Step 4: Deploy to Avalanche Fuji

1. Click **Deploy & Run Transactions** tab
2. Set **Environment** to: `Injected Provider - MetaMask`
3. In MetaMask:
   - Switch to **Avalanche Fuji Testnet**
   - Make sure you have test AVAX (get from [faucet](https://faucet.avax.network/))
4. Click **Deploy** button
5. Confirm transaction in MetaMask
6. Wait for deployment confirmation

### Step 5: Copy Contract Address

After deployment:
1. Look for the deployed contract in Remix's **Deployed Contracts** section
2. Copy the contract address (starts with `0x...`)

### Step 6: Update Frontend

Update the contract address in your frontend code:

**File:** `src/lib/avalanche.ts`

```typescript
// Line 25 - Update this address
export const CONTRACT_ADDRESS = "0xYOUR_NEW_CONTRACT_ADDRESS";
```

### Step 7: Register Services

In Remix, under **Deployed Contracts**, use these functions to register your AI services:

#### Register GPT-4 Service (Example)
```solidity
registerService(
  "GPT-4 API Access",           // name
  "AI Chat",                     // category
  "Advanced AI chat powered by GPT-4", // description
  10000000000000000,             // price (0.01 AVAX in wei)
  "0xYourProviderAddress"        // provider address
)
```

#### Calculate Price in Wei
- 0.001 AVAX = 1000000000000000 wei
- 0.01 AVAX = 10000000000000000 wei
- 0.1 AVAX = 100000000000000000 wei
- 1 AVAX = 1000000000000000000 wei

### Step 8: Verify Deployment

Test the contract:

1. **Check Service Count:**
   ```solidity
   serviceCount() // Should return number of services registered
   ```

2. **Get Service Details:**
   ```solidity
   getService(0) // Get first service
   ```

3. **Test Payment:** (Use different wallet address)
   ```solidity
   payForService(0) 
   // Send exact price in value field
   ```

4. **Check Access:**
   ```solidity
   hasAccess("0xUserAddress", 0) // Should return true
   ```

5. **Check Expiry:**
   ```solidity
   getAccessExpiry("0xUserAddress", 0) // Should return Unix timestamp
   ```

## Contract Functions Reference

### Owner-Only Functions

| Function | Description |
|----------|-------------|
| `registerService()` | Register a new AI service |
| `deactivateService(serviceId)` | Disable a service |
| `withdraw()` | Withdraw collected funds |
| `transferOwnership(newOwner)` | Transfer contract ownership |

### Public Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `payForService(serviceId)` | Pay for 1-hour access (payable) | - |
| `hasAccess(user, serviceId)` | Check if user has active access | `bool` |
| `getAccessExpiry(user, serviceId)` | Get expiry timestamp | `uint256` |
| `getService(serviceId)` | Get service details | Service struct |
| `getBalance()` | Get contract balance | `uint256` |

### Events

| Event | Emitted When |
|-------|--------------|
| `ServiceRegistered` | New service is registered |
| `AccessGranted` | User pays for access (includes `expiresAt`) |
| `AccessExpired` | Access expires (optional) |
| `ServiceDeactivated` | Service is disabled |
| `FundsWithdrawn` | Owner withdraws funds |

## Testing Access Expiry

To test the 1-hour expiry:

1. **Pay for service:**
   ```solidity
   payForService(0) // Send price in value
   ```

2. **Immediately check access:**
   ```solidity
   hasAccess("0xYourAddress", 0) // Returns: true
   ```

3. **Check expiry time:**
   ```solidity
   getAccessExpiry("0xYourAddress", 0) 
   // Returns: block.timestamp + 3600 (1 hour in seconds)
   ```

4. **Wait 1 hour, then check again:**
   ```solidity
   hasAccess("0xYourAddress", 0) // Returns: false (expired)
   ```

5. **Pay again (allowed after expiry):**
   ```solidity
   payForService(0) // Works! Extends access for another hour
   ```

## Frontend Integration

The frontend automatically:
- ✅ Shows countdown timer when access is active
- ✅ Displays "Access Granted ✅" badge with time remaining
- ✅ Enables chat interface during active access period
- ✅ Shows "Pay & Get 1 Hour Access" button when expired
- ✅ Allows re-payment after expiry

## Security Notes

- ✅ Access control via `onlyOwner` modifier
- ✅ Automatic refunds for excess payment
- ✅ Prevents payment while access is still active
- ✅ Time-based expiry enforced on-chain
- ✅ Events for all state changes
- ✅ No way to extend access without paying again

## Troubleshooting

### "Access still active" error
- User tried to pay while access hasn't expired yet
- Wait until the 1-hour period ends
- Check expiry with `getAccessExpiry()`

### Frontend shows "Pay" but contract says access exists
- Update the frontend contract address
- Clear browser cache
- Verify wallet is connected to correct address

### Can't deploy contract
- Make sure you're on Avalanche Fuji Testnet
- Get test AVAX from [faucet](https://faucet.avax.network/)
- Check MetaMask is unlocked

## Migration from Old Contract

If you have an existing contract:

1. **Withdraw Funds:**
   ```solidity
   withdraw() // On old contract
   ```

2. **Deploy New Contract** (follow steps above)

3. **Re-register Services:**
   - Use same names, prices, and descriptions
   - Services in old contract won't carry over

4. **Notify Users:**
   - Old contract access records won't work
   - Users need to pay again on new contract
   - Old "forever access" is no longer valid

## Support

For issues or questions:
- Check Avalanche Fuji block explorer: [testnet.snowtrace.io](https://testnet.snowtrace.io/)
- Verify contract on Snowtrace for transparency
- Review transaction logs for payment confirmations
